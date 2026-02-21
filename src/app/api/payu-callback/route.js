import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { markItemsAsSold } from '@/lib/data';
import { templates } from '@/lib/email';
import { getPayUConfig, validatePayUResponseHash } from '@/lib/payu';

/**
 * PayU Callback Handler
 * PayU POSTs to surl (success) or furl (failure) after payment.
 * We validate the reverse hash, update Firestore, and redirect user.
 */
export async function POST(request) {
    try {
        // PayU sends form-urlencoded data
        const formData = await request.formData();
        const params = {};
        for (const [key, value] of formData.entries()) {
            params[key] = value;
        }

        console.log('PayU Callback received:', JSON.stringify(params, null, 2));

        const {
            mihpayid,    // PayU payment ID
            status,       // success | failure | pending
            txnid,        // Our transaction ID
            amount,
            productinfo,
            firstname,
            email,
            hash,         // Reverse hash from PayU
            udf1,         // Our Firestore orderId (we stored it during initiation)
            udf2 = '', udf3 = '', udf4 = '', udf5 = '',
            error_Message,
            bank_ref_num,
            mode,         // CC, DC, NB, UPI, etc.
        } = params;

        const config = getPayUConfig();
        const orderId = udf1; // We stored orderId in udf1

        if (!orderId) {
            console.error('No orderId (udf1) in PayU callback');
            return NextResponse.redirect(
                new URL('/payment-failed?error=missing_order', process.env.NEXT_PUBLIC_BASE_URL),
                303
            );
        }

        // Validate reverse hash to ensure response is genuinely from PayU
        const isValidHash = validatePayUResponseHash({
            salt: config.salt,
            status,
            udf5, udf4, udf3, udf2, udf1,
            email: email || '',
            firstname: firstname || '',
            productinfo: productinfo || '',
            amount: amount || '',
            txnid: txnid || '',
            key: config.key,
            hash,
        });

        if (!isValidHash) {
            console.error('Invalid reverse hash from PayU! Possible tampering.');
            return NextResponse.redirect(
                new URL(`/payment-failed?orderId=${orderId}&error=hash_mismatch`, process.env.NEXT_PUBLIC_BASE_URL),
                303
            );
        }

        // Get order from Firestore
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            console.error('Order not found in Firestore:', orderId);
            return NextResponse.redirect(
                new URL(`/payment-failed?error=order_not_found`, process.env.NEXT_PUBLIC_BASE_URL),
                303
            );
        }

        const currentOrderData = orderSnap.data();

        // Idempotency: if already paid, just redirect to success
        if (currentOrderData.paymentStatus === 'paid') {
            return NextResponse.redirect(
                new URL(`/payment-success?orderId=${orderId}`, process.env.NEXT_PUBLIC_BASE_URL),
                303
            );
        }

        if (status === 'success') {
            // Strict Amount Validation
            const expectedAmount = parseFloat(currentOrderData.total).toFixed(2);
            const receivedAmount = parseFloat(amount).toFixed(2);

            if (expectedAmount !== receivedAmount) {
                console.error(`Amount mismatch! Expected: ${expectedAmount}, Received: ${receivedAmount}`);
                // Mark as failed due to fraud attempt
                await updateDoc(orderRef, {
                    paymentStatus: 'failed',
                    paymentError: 'Amount mismatch detected. Potential tampering.',
                    payuTxnId: txnid,
                    method: 'payu_online',
                });
                return NextResponse.redirect(
                    new URL(`/payment-failed?orderId=${orderId}&error=amount_mismatch`, process.env.NEXT_PUBLIC_BASE_URL),
                    303
                );
            }

            // Payment successful
            await updateDoc(orderRef, {
                paymentStatus: 'paid',
                paymentId: mihpayid,
                payuTxnId: txnid,
                bankRefNum: bank_ref_num || '',
                paymentMode: mode || 'online',
                paidAt: serverTimestamp(),
                method: 'payu_online',
            });

            // Mark items as sold
            await markItemsAsSold(orderId);

            // Send confirmation email
            try {
                await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: currentOrderData.customerEmail || email,
                        subject: `Order Confirmed: #${orderId.slice(-6).toUpperCase()}`,
                        html: templates.orderConfirmed({ id: orderId, ...currentOrderData })
                    })
                });
            } catch (emailErr) {
                console.error('Failed to send confirmation email:', emailErr);
            }

            return NextResponse.redirect(
                new URL(`/payment-success?orderId=${orderId}`, process.env.NEXT_PUBLIC_BASE_URL),
                303
            );

        } else {
            // Payment failed or pending
            await updateDoc(orderRef, {
                paymentStatus: status === 'pending' ? 'pending' : 'failed',
                payuTxnId: txnid,
                paymentError: error_Message || 'Payment was not successful',
                method: 'payu_online',
            });

            const errorMsg = encodeURIComponent(error_Message || 'Payment failed');
            return NextResponse.redirect(
                new URL(`/payment-failed?orderId=${orderId}&error=${errorMsg}`, process.env.NEXT_PUBLIC_BASE_URL),
                303
            );
        }

    } catch (error) {
        console.error('PayU Callback Error:', error);
        return NextResponse.redirect(
            new URL(`/payment-failed?error=server_error`, process.env.NEXT_PUBLIC_BASE_URL),
            303
        );
    }
}
