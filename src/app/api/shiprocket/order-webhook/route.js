import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { markItemsAsSold } from '@/lib/data';
import crypto from 'crypto';

// Shiprocket Order Webhook
// POST /api/shiprocket/order-webhook
// Called by Shiprocket when an order is successfully placed through checkout
export async function POST(req) {
    try {
        const body = await req.text();
        const parsedBody = JSON.parse(body);

        console.log("=== Shiprocket Order Webhook Received ===");
        console.log("Body:", body);

        // Verify HMAC signature if present
        const hmacHeader = req.headers.get('X-Api-HMAC-SHA256');
        if (hmacHeader) {
            const secretKey = process.env.SHIPROCKET_CHECKOUT_SECRET_KEY;
            const expectedSignature = crypto
                .createHmac('sha256', secretKey)
                .update(body)
                .digest('base64');

            if (hmacHeader !== expectedSignature) {
                console.error("Invalid HMAC signature on webhook");
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        const {
            order_id: shiprocketOrderId,
            cart_data,
            status,
            phone,
            email,
            payment_type,
            total_amount_payable
        } = parsedBody;

        console.log("Shiprocket Order ID:", shiprocketOrderId);
        console.log("Status:", status);
        console.log("Payment Type:", payment_type);

        if (status === 'SUCCESS') {
            // Find the matching order in our database
            // We look for orders with matching email or phone that are still pending
            const ordersRef = collection(db, 'orders');

            // Try to find by checking recent pending orders
            const q = query(
                ordersRef,
                where('paymentStatus', '==', 'pending'),
                where('method', '==', 'shiprocket_online')
            );
            const snapshot = await getDocs(q);

            let matchedOrderDoc = null;
            snapshot.docs.forEach(docSnap => {
                const data = docSnap.data();
                // Match by email or phone
                if (
                    (email && data.customerEmail === email) ||
                    (phone && data.phone === phone)
                ) {
                    matchedOrderDoc = { id: docSnap.id, ...data };
                }
            });

            if (matchedOrderDoc) {
                const orderRef = doc(db, 'orders', matchedOrderDoc.id);

                await updateDoc(orderRef, {
                    paymentStatus: 'paid',
                    paymentId: shiprocketOrderId,
                    shiprocketOrderId: shiprocketOrderId,
                    paymentType: payment_type,
                    paidAt: serverTimestamp(),
                    paidAmount: total_amount_payable,
                    method: 'shiprocket_online'
                });

                // Mark items as sold
                await markItemsAsSold(matchedOrderDoc.id);

                console.log(`Order ${matchedOrderDoc.id} marked as PAID via webhook`);

                return NextResponse.json({
                    success: true,
                    message: 'Order updated successfully',
                    orderId: matchedOrderDoc.id
                });
            } else {
                console.warn("No matching pending order found for webhook data");
                return NextResponse.json({
                    success: false,
                    message: 'No matching order found'
                }, { status: 404 });
            }
        }

        return NextResponse.json({ success: true, message: 'Webhook received' });

    } catch (error) {
        console.error("Shiprocket Order Webhook Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
