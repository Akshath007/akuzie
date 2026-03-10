import { NextResponse } from 'next/server';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getPayUConfig, generatePayUHash, generateTxnId } from '@/lib/payu';

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
        const orderRef = await addDoc(collection(db, 'orders'), {
            type: 'auction',
            auctionId: auctionId,
            customerName,
            customerEmail,
            customerPhone,
            address: shippingAddress || '',
            items: [{
                id: auctionId,
                title: `Auction: ${auction.title}`,
                price: payAmount,
                image: auction.images?.[0]
            }],
            totalAmount: payAmount,
            paymentStatus: 'payment_pending',
            method: 'payu_online',
            userId: userId,
            createdAt: serverTimestamp()
        });

        const orderId = orderRef.id;

        // 4. Generate PayU payment params
        const config = getPayUConfig();

        if (!config.key || !config.salt) {
            return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
        }

        const txnid = generateTxnId();
        const formattedAmount = parseFloat(payAmount).toFixed(2);
        const productinfo = `Auction: ${auction.title}`.substring(0, 100);

        const hash = generatePayUHash({
            key: config.key,
            salt: config.salt,
            txnid,
            amount: formattedAmount,
            productinfo,
            firstname: customerName || 'Auction Winner',
            email: customerEmail || 'winner@example.com',
            udf1: orderId,
        });

        const formData = {
            key: config.key,
            txnid,
            amount: formattedAmount,
            productinfo,
            firstname: customerName || 'Auction Winner',
            email: customerEmail || 'winner@example.com',
            phone: customerPhone || '',
            surl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payu-callback`,
            furl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payu-callback`,
            hash,
            udf1: orderId,
            udf2: auctionId,
            udf3: '',
            udf4: '',
            udf5: '',
        };

        return NextResponse.json({
            formData,
            paymentUrl: config.paymentUrl,
            orderId,
        });

    } catch (error) {
        console.error('Auction checkout error:', error);
        return NextResponse.json(
            { error: error.message || 'Server Error' },
            { status: 500 }
        );
    }
}
