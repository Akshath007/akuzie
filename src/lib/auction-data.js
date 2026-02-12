import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    runTransaction,
    writeBatch,
    Timestamp
} from "firebase/firestore";

// --- Collection Refs ---
const auctionsRef = collection(db, "auctions");
const bidsRef = collection(db, "bids");

// --- HELPER: Create Auction ---
export async function createAuction(data) {
    try {
        // Ensure dates are stored as Firestore Timestamps for proper querying
        const endTime = data.endTime instanceof Date
            ? Timestamp.fromDate(data.endTime)
            : data.endTime;
        const startTime = data.startTime instanceof Date
            ? Timestamp.fromDate(data.startTime)
            : data.startTime;

        const docRef = await addDoc(auctionsRef, {
            ...data,
            endTime,
            startTime,
            currentHighestBid: data.startingPrice || 0,
            highestBidderId: null,
            status: 'active',
            createdAt: serverTimestamp(),
            bidCount: 0
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating auction: ", error);
        throw error;
    }
}

// --- HELPER: Place Bid (Transactional) ---
export async function placeBid(auctionId, userId, amount) {
    try {
        await runTransaction(db, async (transaction) => {
            const auctionDocRef = doc(db, "auctions", auctionId);
            const auctionDoc = await transaction.get(auctionDocRef);

            if (!auctionDoc.exists()) {
                throw "Auction does not exist!";
            }

            const auctionData = auctionDoc.data();
            const now = Timestamp.now();
            const endTime = auctionData.endTime;

            // 1. Validation
            if (auctionData.status !== 'active') {
                throw "Auction is not active.";
            }

            if (now.toMillis() > endTime.toMillis()) {
                throw "Auction has ended.";
            }

            const currentBid = auctionData.currentHighestBid || 0;
            const minIncrement = auctionData.minBidIncrement || 0;
            const minNextBid = auctionData.bidCount > 0
                ? currentBid + minIncrement
                : auctionData.startingPrice;

            if (amount < minNextBid) {
                throw `Bid must be at least ${minNextBid}`;
            }

            // 2. Anti-Sniping Logic (Extend by 2 mins if bid within last 2 mins)
            let newEndTime = endTime;
            const timeRemaining = endTime.toMillis() - now.toMillis();
            if (timeRemaining < 2 * 60 * 1000) { // Less than 2 mins
                newEndTime = new Timestamp(endTime.seconds + 120, endTime.nanoseconds);
            }

            // 3. Create Bid Record
            const newBidRef = doc(collection(db, "bids"));
            transaction.set(newBidRef, {
                auctionId,
                userId,
                amount,
                timestamp: now
            });

            // 4. Update Auction State
            transaction.update(auctionDocRef, {
                currentHighestBid: amount,
                highestBidderId: userId,
                endTime: newEndTime,
                bidCount: (auctionData.bidCount || 0) + 1,
                lastBidTime: now
            });
        });

        return { success: true };
    } catch (e) {
        console.error("Transaction failed: ", e);
        throw e;
    }
}

// --- HELPER: Get active auctions ---
export async function getActiveAuctions() {
    try {
        // This composite query requires a Firestore index on status + endTime
        const q = query(auctionsRef, where("status", "==", "active"), orderBy("endTime", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Composite query failed (you may need to create a Firestore index):", error);
        // If the error message contains an index creation URL, log it prominently
        if (error.message && error.message.includes('https://')) {
            const urlMatch = error.message.match(/(https:\/\/console\.firebase\.google\.com[^\s]+)/);
            if (urlMatch) {
                console.error("\n🔗 CREATE THE REQUIRED INDEX HERE:\n" + urlMatch[1] + "\n");
            }
        }
        // Fallback: query without orderBy so auctions at least appear
        console.warn("Falling back to simple status query without ordering...");
        const fallbackQ = query(auctionsRef, where("status", "==", "active"));
        const fallbackSnapshot = await getDocs(fallbackQ);
        const results = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort client-side as fallback
        results.sort((a, b) => {
            const aEnd = a.endTime?.toMillis ? a.endTime.toMillis() : (a.endTime instanceof Date ? a.endTime.getTime() : 0);
            const bEnd = b.endTime?.toMillis ? b.endTime.toMillis() : (b.endTime instanceof Date ? b.endTime.getTime() : 0);
            return aEnd - bEnd;
        });
        return results;
    }
}

// --- HELPER: Get auction by ID ---
export async function getAuction(id) {
    const docRef = doc(db, "auctions", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            // Convert timestamps for serializability if needed on client
            startTime: data.startTime?.toMillis(),
            endTime: data.endTime?.toMillis(),
            createdAt: data.createdAt?.toMillis()
        };
    } else {
        return null;
    }
}

// --- HELPER: Get Bids for an Auction ---
export async function getBids(auctionId) {
    const q = query(bidsRef, where("auctionId", "==", auctionId), orderBy("amount", "desc")); // Highest first
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toMillis()
    }));
}

// --- HELPER: Delete Auction and its Bids ---
export async function deleteAuction(auctionId) {
    try {
        // 1. Delete all bids associated with the auction
        const bidsQuery = query(bidsRef, where("auctionId", "==", auctionId));
        const bidsSnapshot = await getDocs(bidsQuery);

        if (!bidsSnapshot.empty) {
            const batch = writeBatch(db);
            bidsSnapshot.docs.forEach((bidDoc) => {
                batch.delete(bidDoc.ref);
            });
            await batch.commit();
        }

        // 2. Delete the auction document itself
        await deleteDoc(doc(db, "auctions", auctionId));

        return { success: true };
    } catch (error) {
        console.error("Error deleting auction: ", error);
        throw error;
    }
}

// --- HELPER: Pass to next bidder (cascading payment) ---
export async function passToNextBidder(auctionId) {
    try {
        const auctionRef = doc(db, "auctions", auctionId);
        const auctionSnap = await getDoc(auctionRef);

        if (!auctionSnap.exists()) {
            throw new Error("Auction not found");
        }

        const auctionData = auctionSnap.data();
        const skippedBidders = auctionData.skippedBidders || [];

        // The current winner (either cascaded or original highest bidder)
        const currentWinner = auctionData.currentWinnerId || auctionData.highestBidderId;

        // Add the current winner to skipped list
        if (currentWinner && !skippedBidders.includes(currentWinner)) {
            skippedBidders.push(currentWinner);
        }

        // Fetch all bids for this auction, sorted by amount descending (highest first)
        const bidsQuery = query(
            bidsRef,
            where("auctionId", "==", auctionId),
            orderBy("amount", "desc")
        );
        const bidsSnapshot = await getDocs(bidsQuery);

        // Find the next eligible bidder (unique users, not already skipped)
        let nextWinner = null;
        const seenUsers = new Set();

        for (const bidDoc of bidsSnapshot.docs) {
            const bid = bidDoc.data();
            // Skip if we've already seen this user (they may have multiple bids)
            if (seenUsers.has(bid.userId)) continue;
            seenUsers.add(bid.userId);

            // Skip if this user is in the skipped list
            if (skippedBidders.includes(bid.userId)) continue;

            // This is our next winner!
            nextWinner = {
                userId: bid.userId,
                amount: bid.amount
            };
            break;
        }

        if (nextWinner) {
            // Update auction with the new current winner
            await updateDoc(auctionRef, {
                currentWinnerId: nextWinner.userId,
                currentWinningBid: nextWinner.amount,
                skippedBidders: skippedBidders,
                status: 'awaiting_payment'
            });

            return {
                success: true,
                newWinner: nextWinner,
                message: `Passed to next bidder. New winning bid: ${nextWinner.amount}`
            };
        } else {
            // No more bidders available — mark auction as unsold
            await updateDoc(auctionRef, {
                currentWinnerId: null,
                currentWinningBid: null,
                skippedBidders: skippedBidders,
                status: 'unsold'
            });

            return {
                success: true,
                newWinner: null,
                message: "No more eligible bidders. Auction marked as unsold."
            };
        }
    } catch (error) {
        console.error("Error passing to next bidder: ", error);
        throw error;
    }
}
