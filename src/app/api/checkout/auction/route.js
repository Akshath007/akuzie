import { NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request) {
    try {
        const body = await request.json();
        const { auctionId, userId, customerName, customerEmail, customerPhone, shippingAddress } = body;

        if (!auctionId || !userId) {
            return NextResponse.json({ error: 'Missing Required Fields' }, { status: 400 });
        }

        // 1. Fetch Auction
        const auctionRef = doc(db, 'auctions', auctionId);
        const auctionSnap = await getDoc(auctionRef);

        if (!auctionSnap.exists()) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        const auction = auctionSnap.data();

        // 2. Security Checks
        if (auction.status !== 'ended' && auction.status !== 'awaiting_payment') {
            return NextResponse.json({ error: 'Auction is not ready for payment' }, { status: 400 });
        }

        const currentWinnerId = auction.currentWinnerId || auction.highestBidderId;
        const payAmount = auction.currentWinningBid || auction.currentHighestBid;

        if (currentWinnerId !== userId) {
            return NextResponse.json({ error: 'Forbidden: You are not the winner' }, { status: 403 });
        }

        // 3. Create Order Record in Firestore
        // This links the payment to the auction and stores shipping info
        const orderRef = await addDoc(collection(db, 'orders'), {
            type: 'auction',
            auctionId: auctionId,
            customerName,
            customerEmail,
            customerPhone,
            address: shippingAddress || '', // Should obtain from frontend
            items: [{
                id: auctionId,
                title: `Auction: ${auction.title}`,
                price: payAmount,
                image: auction.images?.[0]
            }],
            totalAmount: payAmount,
            paymentStatus: 'payment_pending',
            userId: userId,
            createdAt: serverTimestamp()
        });

        const orderId = orderRef.id;

        // 4. Create Cashfree Order
        const amount = payAmount;
        const isSandbox = process.env.NEXT_PUBLIC_CASHFREE_MODE === 'sandbox';
        const apiUrl = isSandbox
            ? 'https://sandbox.cashfree.com/pg/orders'
            : 'https://api.cashfree.com/pg/orders';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': process.env.CASHFREE_APP_ID,
                'x-client-secret': process.env.CASHFREE_SECRET_KEY,
                'x-api-version': '2022-09-01',
            },
            body: JSON.stringify({
                order_amount: amount,
                order_currency: 'INR',
                order_id: orderId, // Link Cashfree order to Firestore Order Doc
                customer_details: {
                    customer_id: userId,
                    customer_name: customerName || 'Auction Winner',
                    customer_email: customerEmail || 'winner@example.com',
                    customer_phone: customerPhone || '9999999999',
                },
                order_meta: {
                    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?order_id=${orderId}`,
                    notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook`,
                },
                order_note: `Auction Payment ${auctionId}`,
                order_tags: {
                    type: 'auction',
                    auctionId: auctionId
                }
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Cashfree API error:', data);
            // Rollback order creation? Theoretically yes, but practically okay to leave pending doc
            throw new Error(data.message || 'Failed to create Cashfree order');
        }

        return NextResponse.json({ ...data, orderId });

    } catch (error) {
        console.error('Auction checkout error:', error);
        return NextResponse.json(
            { error: error.message || 'Server Error' },
            { status: 500 }
        );
    }
}
