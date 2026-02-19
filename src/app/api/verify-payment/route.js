
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { markItemsAsSold } from '@/lib/data';
import { templates } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req) {
    try {
        const body = await req.json();
        const { orderId, ...otherParams } = body;

        // Log params to see what Shiprocket sends (for debugging)
        console.log("Verify Payment Params:", body);

        if (!orderId) {
            return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
        }

        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const currentOrderData = orderSnap.data();

        // 1. Idempotency check: if already paid, success
        if (currentOrderData.paymentStatus === 'paid') {
            return NextResponse.json({ success: true, status: 'already_paid' });
        }

        // 2. Authenticate with Shiprocket to check status (if possible)
        // We look for a Shiprocket Order ID in the params passed from the redirect
        // Shiprocket might send 'order_id' or 'id'
        const shiprocketOrderId = otherParams.order_id || otherParams.id || otherParams.shiprocket_order_id;

        let isPaid = false;
        let paymentId = 'shiprocket_online';
        let shiprocketDetails = null;

        if (shiprocketOrderId) {
            try {
                // Call Fetch Order Details API
                const apiKey = process.env.SHIPROCKET_CHECKOUT_API_KEY;
                const secretKey = process.env.SHIPROCKET_CHECKOUT_SECRET_KEY;
                const timestamp = new Date().toISOString();

                const payload = {
                    order_id: shiprocketOrderId,
                    timestamp: timestamp
                };

                const signature = crypto
                    .createHmac('sha256', secretKey)
                    .update(JSON.stringify(payload))
                    .digest('base64');

                // Try production URL first
                const verifyUrl = 'https://checkout-api.shiprocket.com/api/v1/custom-platform-order/details';

                const verifyRes = await fetch(verifyUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Api-Key': apiKey,
                        'X-Api-HMAC-SHA256': signature
                    },
                    body: JSON.stringify(payload)
                });

                const verifyData = await verifyRes.json();
                console.log("Shiprocket Verification Response:", verifyData);

                if (verifyRes.ok && (verifyData.status === 'SUCCESS' || verifyData.status === 'PAID')) {
                    isPaid = true;
                    paymentId = verifyData.payment_id || shiprocketOrderId;
                    shiprocketDetails = verifyData;
                }
            } catch (err) {
                console.error("Shiprocket Verification API Error:", err);
            }
        } else {
            console.warn("No Shiprocket Order ID found in params to verify.");
            // OPTIONAL: If we trust the redirect (we strictly shouldn't for 'Real Money', but for getting started...)
            // We will NOT mark as paid if we can't verify. 
            // Better to leave as pending and let Webhook handle it.
        }

        if (isPaid) {
            await updateDoc(orderRef, {
                paymentStatus: 'paid',
                paymentId: paymentId,
                paidAt: serverTimestamp(),
                method: 'shiprocket_online',
                shiprocketOrderId: shiprocketOrderId
            });

            await markItemsAsSold(orderId);

            // Trigger Confirmation Email
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
                console.error("Failed to send confirmation email:", emailErr);
            }

            // Try to create Shipping Order (if Shiprocket Checkout doesn't do it)
            // Note: Shiprocket Checkout usually creates the order in Shiprocket panel automatically.
            // So we might NOT need to call 'createShiprocketOrder' manually here.
            // We just link the IDs.

            return NextResponse.json({ success: true, status: 'paid' });
        } else {
            // Check if it was a manual payment redirect (fallback)
            // If manual, we don't automatically mark paid.

            return NextResponse.json({
                success: false,
                status: 'pending_verification',
                message: 'Payment verification pending. Please check your email.'
            });
        }

    } catch (error) {
        console.error("Payment Verification API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
