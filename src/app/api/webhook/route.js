import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateOrderStatus } from '@/lib/data';
import { ORDER_STATUS } from '@/lib/utils';

export async function POST(request) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('x-webhook-signature');
        const timestamp = request.headers.get('x-webhook-timestamp');

        // Use Cashfree verification or manual
        // Manual verification recommended to ensure correctness with rawBody
        const secret = process.env.CASHFREE_SECRET_KEY;

        if (!secret) {
            console.error('CASHFREE_SECRET_KEY is not configured');
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        if (!signature || !timestamp) {
            return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 });
        }

        // Verify signature: timestamp + body
        const data = timestamp + rawBody;
        const hmac = crypto.createHmac('sha256', secret);
        const computedSignature = hmac.update(data).digest('base64');

        if (signature !== computedSignature) {
            console.error('Invalid webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        const eventType = payload.type;

        console.log('Webhook received:', eventType);

        if (eventType === 'PAYMENT_SUCCESS_WEBHOOK') {
            await handlePaymentSuccess(payload);
        } else if (eventType === 'PAYMENT_FAILED_WEBHOOK') {
            await handlePaymentFailed(payload);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

async function handlePaymentSuccess(payload) {
    const payment = payload.data.payment;
    const order = payload.data.order;

    console.log('Payment successful for order:', order.order_id);

    // Extract order ID. We store it as just the ID typically, but payload might be complex.
    // Ensure order_id matches what we sent (which is the document ID).

    // Check status
    if (payment.payment_status === 'SUCCESS') {
        const orderId = order.order_id;

        // Mark order as paid in your Firebase database
        // Use the imported updateOrderStatus function
        try {
            // Example: orderId is already the Firestore doc ID based on our checkout logic
            await updateOrderStatus(orderId, ORDER_STATUS.PAID);
            console.log(`Order ${orderId} updated to PAID`);
        } catch (e) {
            console.error(`Failed to update order ${orderId}:`, e);
        }
    }
}

async function handlePaymentFailed(payload) {
    console.log('Payment failed:', payload.data.order.order_id);
    // You might want to log this or notify user if possible, 
    // but typically user is still on the checkout page seeing failure.
    // Webhook is for async updates.
}
