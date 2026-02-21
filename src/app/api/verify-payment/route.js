
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { markItemsAsSoldAdmin } from '@/lib/data-admin';
import { templates } from '@/lib/email';

/**
 * Verify Payment API
 * Used by admin to manually confirm payments (e.g. manual UPI)
 * Also used as a fallback verification endpoint
 */
export async function POST(req) {
    try {
        const body = await req.json();
        const { orderId, paymentId } = body;

        if (!orderId) {
            return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
        }

        const orderRef = adminDb.collection('orders').doc(orderId);
        const orderSnap = await orderRef.get();

        if (!orderSnap.exists) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const currentOrderData = orderSnap.data();

        // Idempotency check
        if (currentOrderData.paymentStatus === 'paid') {
            return NextResponse.json({ success: true, status: 'already_paid' });
        }

        // Admin manual confirmation
        if (paymentId) {
            await orderRef.update({
                paymentStatus: 'paid',
                paymentId: paymentId,
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
                method: currentOrderData.method || 'manual_upi',
            });

            await markItemsAsSoldAdmin(orderId);

            // Send confirmation email
            try {
                await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: currentOrderData.customerEmail,
                        subject: `Order Confirmed: #${orderId.slice(-6).toUpperCase()}`,
                        html: templates.orderConfirmed({ id: orderId, ...currentOrderData })
                    })
                });
            } catch (emailErr) {
                console.error('Failed to send confirmation email:', emailErr);
            }

            return NextResponse.json({ success: true, status: 'paid' });
        }

        return NextResponse.json({
            success: false,
            status: 'pending_verification',
            message: 'Payment verification pending.'
        });

    } catch (error) {
        console.error('Payment Verification API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
