import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateOrderStatus } from '@/lib/data';
import { ORDER_STATUS } from '@/lib/utils';

export async function POST(request) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('x-signature');
        const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

        if (!secret) {
            console.error('LEMONSQUEEZY_WEBHOOK_SECRET is not configured');
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        // Verify webhook signature
        const hmac = crypto.createHmac('sha256', secret);
        const digest = hmac.update(rawBody).digest('hex');

        if (signature !== digest) {
            console.error('Invalid webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        const eventName = payload.meta?.event_name;

        console.log('Webhook received:', eventName);

        // Handle different webhook events
        switch (eventName) {
            case 'order_created':
                await handleOrderCreated(payload);
                break;

            case 'order_refunded':
                await handleOrderRefunded(payload);
                break;

            case 'subscription_created':
                await handleSubscriptionCreated(payload);
                break;

            case 'subscription_updated':
                await handleSubscriptionUpdated(payload);
                break;

            case 'subscription_cancelled':
                await handleSubscriptionCancelled(payload);
                break;

            default:
                console.log('Unhandled event:', eventName);
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

async function handleOrderCreated(payload) {
    const orderData = payload.data.attributes;
    const customData = orderData.first_order_item?.product_name;

    console.log('Order created:', {
        orderId: payload.data.id,
        customerEmail: orderData.user_email,
        total: orderData.total_formatted,
        status: orderData.status,
    });

    // Update order status in your database
    // You can extract the order ID from custom data if you passed it during checkout
    if (orderData.status === 'paid') {
        // Mark order as paid in your Firebase database
        // await updateOrderStatus(yourOrderId, ORDER_STATUS.PAID);
    }
}

async function handleOrderRefunded(payload) {
    const orderData = payload.data.attributes;
    console.log('Order refunded:', payload.data.id);

    // Handle refund logic - update order status, restore painting availability, etc.
}

async function handleSubscriptionCreated(payload) {
    console.log('Subscription created:', payload.data.id);
    // Handle subscription creation if you add subscription products
}

async function handleSubscriptionUpdated(payload) {
    console.log('Subscription updated:', payload.data.id);
    // Handle subscription updates
}

async function handleSubscriptionCancelled(payload) {
    console.log('Subscription cancelled:', payload.data.id);
    // Handle subscription cancellation
}
