import { db } from "@/lib/firebase";
import { collection, getDocs, getDoc, doc, query, orderBy, where, addDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { PAINTING_STATUS, ORDER_STATUS } from "./utils";

// Paintings
export async function getPaintings() {
    const paintingsCol = collection(db, "paintings");
    const q = query(paintingsCol, orderBy("createdAt", "desc"));
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
    const batch = writeBatch(db);

    // 1. Create Order
    const orderRef = doc(collection(db, "orders"));
    batch.set(orderRef, {
        ...orderData,
        paymentStatus: ORDER_STATUS.PAYMENT_PENDING,
        createdAt: serverTimestamp(),
    });

    // 2. Mark paintings as sold
    paintingIds.forEach(id => {
        const paintingRef = doc(db, "paintings", id);
        batch.update(paintingRef, { status: PAINTING_STATUS.SOLD });
    });

    await batch.commit();
    return orderRef.id;
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
}
