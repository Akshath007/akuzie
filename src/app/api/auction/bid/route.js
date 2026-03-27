import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: Missing or invalid Authorization header' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(idToken);
        } catch (error) {
            console.error('Error verifying Firebase ID token:', error);
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }

        const body = await request.json();
        const { auctionId, amount, userName = 'Masked User' } = body;
        const userId = decodedToken.uid; 
        
        if (!auctionId || !amount || isNaN(amount)) {
            return NextResponse.json({ error: 'Bad Request: Missing required fields or invalid amount' }, { status: 400 });
        }

        const bidAmount = Number(amount);

        await adminDb.runTransaction(async (transaction) => {
            const auctionDocRef = adminDb.collection('auctions').doc(auctionId);
            const auctionDoc = await transaction.get(auctionDocRef);

            if (!auctionDoc.exists) {
                throw new Error("Auction does not exist!");
            }

            const auctionData = auctionDoc.data();
            const nowDate = new Date();
            
            const endTime = auctionData.endTime?.toDate ? auctionData.endTime.toDate() : new Date(auctionData.endTime || 0);

            // 1. Validation
            if (auctionData.status !== 'active') {
                throw new Error("Auction is not active.");
            }

            if (nowDate.getTime() > endTime.getTime()) {
                throw new Error("Auction has ended.");
            }

            const currentBid = auctionData.currentHighestBid || 0;
            const minIncrement = auctionData.minBidIncrement || 0;
            const minNextBid = auctionData.bidCount > 0
                ? currentBid + minIncrement
                : auctionData.startingPrice;

            if (bidAmount < minNextBid) {
                throw new Error(`Bid must be at least ${minNextBid}`);
            }

            // 2. Anti-Sniping Logic (Extend by 2 mins if bid within last 2 mins)
            let newEndTime = endTime;
            const timeRemaining = endTime.getTime() - nowDate.getTime();
            if (timeRemaining < 2 * 60 * 1000) { // Less than 2 mins
                newEndTime = new Date(endTime.getTime() + 120 * 1000); // Add 2 minutes
            }

            // 3. Create Bid Record
            const newBidRef = adminDb.collection('bids').doc();
            transaction.set(newBidRef, {
                auctionId,
                userId,
                userName,
                amount: bidAmount,
                timestamp: nowDate
            });

            // 4. Update Auction State
            transaction.update(auctionDocRef, {
                currentHighestBid: bidAmount,
                highestBidderId: userId,
                highestBidderName: userName,
                endTime: newEndTime,
                bidCount: (auctionData.bidCount || 0) + 1,
                lastBidTime: nowDate
            });
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Bid API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
