import { db } from "@/lib/firebase";
import { collection, getDocs, getDoc, doc, query, orderBy, where, addDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { PAINTING_STATUS, ORDER_STATUS } from "./utils";

export const safeToMillis = (dateValue) => {
    if (!dateValue) return null;
    if (typeof dateValue.toMillis === 'function') return dateValue.toMillis();
    if (typeof dateValue.toDate === 'function') return dateValue.toDate().getTime();
    if (dateValue instanceof Date) return dateValue.getTime();
    if (typeof dateValue === 'number') return dateValue;
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date.getTime();
};

// Admin Logging
export async function logAdminAction(adminUser, action, targetId, details = {}) {
    if (!adminUser) return;
    try {
        await addDoc(collection(db, "admin_logs"), {
            adminEmail: adminUser.email,
            adminName: adminUser.displayName || adminUser.email,
            action,
            targetId,
            details,
            timestamp: serverTimestamp(),
        });
    } catch (err) {
        console.error("Failed to log admin action:", err);
    }
}

// Paintings and Crochet
export async function getPaintings(category = null) {
    const paintingsCol = collection(db, "paintings");

    // Always query ALL items sorted by date to avoid composite index requirements
    const q = query(paintingsCol, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const items = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            // Backwards compatibility: Default to 'painting' if no category
            category: data.category || 'painting',
            createdAt: safeToMillis(data.createdAt),
        };
    });

    // In-memory filtering
    if (category) {
        return items.filter(item => item.category === category);
    }

    return items;
}

export async function getPainting(id) {
    const docRef = doc(db, "paintings", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            createdAt: safeToMillis(data.createdAt),
        };
    }
    return null;
}

// Orders
export async function createOrder(orderData) {
    const ordersCol = collection(db, "orders");
    const docRef = await addDoc(ordersCol, {
        ...orderData,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function processOrder(orderData, paintingIds) {
    // Create Order — do NOT mark items as sold yet
    // Items will be marked sold only after payment is confirmed
    const orderRef = doc(collection(db, "orders"));
    await setDoc(orderRef, {
        ...orderData,
        paintingIds, // Save IDs so we can mark them sold later
        paymentStatus: ORDER_STATUS.PAYMENT_PENDING,
        createdAt: serverTimestamp(),
    });

    return orderRef.id;
}

// Mark items as sold — called only after payment is confirmed
export async function markItemsAsSold(orderId) {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) return;

    const orderData = orderSnap.data();
    const paintingIds = orderData.paintingIds || [];

    if (paintingIds.length === 0) return;

    const batch = writeBatch(db);
    paintingIds.forEach(id => {
        const paintingRef = doc(db, "paintings", id);
        batch.update(paintingRef, { status: PAINTING_STATUS.SOLD });
    });
    await batch.commit();
}

export async function getOrders() {
    const ordersCol = collection(db, "orders");
    const q = query(ordersCol, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: safeToMillis(data.createdAt),
        };
    });
}

export async function addNotifyRequest(data) {
    await addDoc(collection(db, "notify_requests"), {
        ...data,
        createdAt: serverTimestamp(),
    });
}

// Painting Management
export async function addPainting(data, adminUser) {
    const docRef = await addDoc(collection(db, "paintings"), {
        ...data,
        createdAt: serverTimestamp(),
        status: PAINTING_STATUS.AVAILABLE, // Default
    });

    if (adminUser) {
        await logAdminAction(adminUser, "CREATE_PAINTING", docRef.id, { title: data.title });
    }

    return docRef.id;
}

export async function deletePainting(id, adminUser) {
    await deleteDoc(doc(db, "paintings", id));
    if (adminUser) {
        await logAdminAction(adminUser, "DELETE_PAINTING", id);
    }
}

export async function updatePainting(id, data, adminUser) {
    const docRef = doc(db, "paintings", id);
    await updateDoc(docRef, data);
    if (adminUser) {
        await logAdminAction(adminUser, "UPDATE_PAINTING", id, data);
    }
}

export async function updateOrderStatus(id, status, adminUser) {
    const orderRef = doc(db, "orders", id);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) return;

    const orderData = orderSnap.data();

    // Update Order Status
    await updateDoc(orderRef, { paymentStatus: status });

    if (adminUser) {
        await logAdminAction(adminUser, "UPDATE_ORDER_STATUS", id, { status });
    }

    // Handle Normal Items (Mark as Sold)
    if (status === ORDER_STATUS.PAID && !orderData.type) {
        await markItemsAsSold(id); // Original logic for normal cart orders
    }

    // Handle Auction Items
    if (status === ORDER_STATUS.PAID && orderData.type === 'auction' && orderData.auctionId) {
        const auctionRef = doc(db, "auctions", orderData.auctionId);
        await updateDoc(auctionRef, { status: 'sold' });
    }
}

export async function deleteOrder(id, adminUser) {
    await deleteDoc(doc(db, "orders", id));
    if (adminUser) {
        await logAdminAction(adminUser, "DELETE_ORDER", id);
    }
}

export async function getUserOrders(email, userId = null) {
    const ordersCol = collection(db, "orders");
    const results = new Map();

    // Query 1: By customerEmail (legacy orders + form email)
    // No orderBy — avoids composite index requirement
    try {
        const q1 = query(ordersCol, where("customerEmail", "==", email));
        const snap1 = await getDocs(q1);
        snap1.docs.forEach(d => results.set(d.id, { id: d.id, ...d.data(), createdAt: safeToMillis(d.data().createdAt) }));
    } catch (e) { console.error("getUserOrders q1:", e); }

    // Query 2: By userEmail (Google account email stored at checkout)
    try {
        const q2 = query(ordersCol, where("userEmail", "==", email));
        const snap2 = await getDocs(q2);
        snap2.docs.forEach(d => results.set(d.id, { id: d.id, ...d.data(), createdAt: safeToMillis(d.data().createdAt) }));
    } catch (e) { console.error("getUserOrders q2:", e); }

    // Query 3: By userId (most reliable for authenticated users)
    if (userId) {
        try {
            const q3 = query(ordersCol, where("userId", "==", userId));
            const snap3 = await getDocs(q3);
            snap3.docs.forEach(d => results.set(d.id, { id: d.id, ...d.data(), createdAt: safeToMillis(d.data().createdAt) }));
        } catch (e) { console.error("getUserOrders q3:", e); }
    }

    // De-duplicate and sort by date desc (client-side)
    return Array.from(results.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
