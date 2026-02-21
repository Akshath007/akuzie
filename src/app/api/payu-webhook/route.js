import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { markItemsAsSold } from '@/lib/data';
import { templates } from '@/lib/email';
import { getPayUConfig, validatePayUResponseHash } from '@/lib/payu';

/**
 * PayU Server-to-Server Webhook
 * Used to handle cases where the user closes the browser before redirection back to the site.
 * PayU will trigger this quietly in the background.
 */
export async function POST(request) {
    try {
        const formData = await request.formData();
        const params = {};
        for (const [key, value] of formData.entries()) {
            params[key] = value;
        }

        console.log('PayU Webhook received:', JSON.stringify(params, null, 2));

        const {
            mihpayid,
            status,
            txnid,
            amount,
            productinfo,
            firstname,
            email,
            hash,
            udf1, // orderId
            udf2 = '', udf3 = '', udf4 = '', udf5 = '',
            error_Message,
            bank_ref_num,
            mode,
        } = params;

        const config = getPayUConfig();
        const orderId = udf1;

        if (!orderId) {
            return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
        }

        // Validate reverse hash 
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
            console.error('Webhook: Invalid reverse hash');
            return NextResponse.json({ error: 'Tampering detected' }, { status: 400 });
        }

        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const currentOrderData = orderSnap.data();

        // Idempotency constraint - if already paid, we do nothing to prevent duplicate emails/updates
        if (currentOrderData.paymentStatus === 'paid') {
            return NextResponse.json({ message: 'Order already handled' }, { status: 200 });
        }

        if (status === 'success') {
            // Amount Validation
            const expectedAmount = parseFloat(currentOrderData.total).toFixed(2);
            const receivedAmount = parseFloat(amount).toFixed(2);

            if (expectedAmount !== receivedAmount) {
                console.error('Webhook: Amount mismatch!');
                await updateDoc(orderRef, {
                    paymentStatus: 'failed',
                    paymentError: 'Webhook amount mismatch detected.',
                    payuTxnId: txnid,
                    method: 'payu_online',
                });
                return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
            }

            // Mark as paid
            await updateDoc(orderRef, {
                paymentStatus: 'paid',
                paymentId: mihpayid,
                payuTxnId: txnid,
                bankRefNum: bank_ref_num || '',
                paymentMode: mode || 'online',
                paidAt: serverTimestamp(),
                method: 'payu_online',
            });

            await markItemsAsSold(orderId);

            // Send confirmation email
            try {
                // Must ensure we use a direct system call for email, or absolute process base URL
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://akuzie.in';
                await fetch(`${baseUrl}/api/send-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: currentOrderData.customerEmail || email,
                        subject: `Order Confirmed: #${orderId.slice(-6).toUpperCase()}`,
                        html: templates.orderConfirmed({ id: orderId, ...currentOrderData })
                    })
                });
            } catch (emailErr) {
                console.error('Webhook: Failed to send email:', emailErr);
            }

            return NextResponse.json({ message: 'Success' }, { status: 200 });

        } else if (status === 'failed' || status === 'cancel') {
            await updateDoc(orderRef, {
                paymentStatus: 'failed',
                payuTxnId: txnid,
                paymentError: error_Message || 'Webhook reported payment failure',
                method: 'payu_online',
            });
            return NextResponse.json({ message: 'Failed state recorded' }, { status: 200 });
        }

        return NextResponse.json({ message: 'Ignored status' }, { status: 200 });

    } catch (error) {
        console.error('PayU Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
