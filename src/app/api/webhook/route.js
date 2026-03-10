import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { markItemsAsSold } from '@/lib/data';
import { templates } from '@/lib/email';
import { getPayUConfig, validatePayUResponseHash } from '@/lib/payu';

/**
 * PayU Webhook Handler
 * PayU sends S2S (server-to-server) notifications for payment status changes.
 * This is the primary source of truth for transaction status per PayU docs.
 */
export async function POST(request) {
    try {
        // PayU webhooks can come as form-urlencoded or JSON
        const contentType = request.headers.get('content-type') || '';
        let params = {};

        if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            for (const [key, value] of formData.entries()) {
                params[key] = value;
            }
        } else {
            params = await request.json();
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
            udf1,
            udf2 = '', udf3 = '', udf4 = '', udf5 = '',
            bank_ref_num,
            mode,
            error_Message,
        } = params;

        const config = getPayUConfig();
        const orderId = udf1; // We stored orderId in udf1

        if (!orderId) {
            console.warn('No orderId in webhook payload');
            return NextResponse.json({ received: true, warning: 'no_order_id' });
        }

        // Validate hash
        if (hash) {
            const isValid = validatePayUResponseHash({
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

            if (!isValid) {
                console.error('Invalid webhook hash from PayU');
                return NextResponse.json({ error: 'Invalid hash' }, { status: 401 });
            }
        }

        // Get order from Firestore
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            console.warn('Order not found for webhook:', orderId);
            return NextResponse.json({ received: true, warning: 'order_not_found' });
        }

        const currentOrderData = orderSnap.data();

        // Idempotency: skip if already paid
        if (currentOrderData.paymentStatus === 'paid') {
            return NextResponse.json({ received: true, status: 'already_paid' });
        }

        if (status === 'success') {
            await updateDoc(orderRef, {
                paymentStatus: 'paid',
                paymentId: mihpayid,
                payuTxnId: txnid,
                bankRefNum: bank_ref_num || '',
                paymentMode: mode || 'online',
                paidAt: serverTimestamp(),
                method: 'payu_online',
                webhookVerified: true,
            });

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

            console.log(`Webhook: Order ${orderId} marked as PAID`);
        } else if (status === 'failure') {
            await updateDoc(orderRef, {
                paymentStatus: 'failed',
                payuTxnId: txnid,
                paymentError: error_Message || 'Payment failed',
                method: 'payu_online',
            });
            console.log(`Webhook: Order ${orderId} marked as FAILED`);
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
