import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    runTransaction,
    Timestamp
} from "firebase/firestore";

// --- Collection Refs ---
const auctionsRef = collection(db, "auctions");
const bidsRef = collection(db, "bids");

// --- HELPER: Create Auction ---
export async function createAuction(data) {
    try {
        const docRef = await addDoc(auctionsRef, {
            ...data,
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
    const q = query(auctionsRef, where("status", "==", "active"), orderBy("endTime", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
