import { db } from "@/lib/firebase";
import { collection, getDocs, getDoc, doc, query, orderBy, where, addDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { PAINTING_STATUS, ORDER_STATUS } from "./utils";

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
            createdAt: data.createdAt?.toMillis() || null,
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
            createdAt: data.createdAt?.toMillis() || null,
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
            createdAt: data.createdAt?.toMillis() || null,
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
export async function addPainting(data) {
    const docRef = await addDoc(collection(db, "paintings"), {
        ...data,
        createdAt: serverTimestamp(),
        status: PAINTING_STATUS.AVAILABLE, // Default
    });
    return docRef.id;
}

export async function deletePainting(id) {
    await deleteDoc(doc(db, "paintings", id));
}

export async function updatePainting(id, data) {
    const docRef = doc(db, "paintings", id);
    await updateDoc(docRef, data);
}

export async function updateOrderStatus(id, status) {
    const docRef = doc(db, "orders", id);
    await updateDoc(docRef, { paymentStatus: status });

    // If marking as paid, also mark items as sold
    if (status === ORDER_STATUS.PAID) {
        await markItemsAsSold(id);
    }
}

export async function deleteOrder(id) {
    await deleteDoc(doc(db, "orders", id));
}

export async function getUserOrders(email) {
    const ordersCol = collection(db, "orders");
    const q = query(
        ordersCol,
        where("customerEmail", "==", email),
        orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toMillis() || null,
        };
    });
}
