import { adminDb } from './firebase-admin';

// Admin version to bypass Firestore client security rules
export async function markItemsAsSoldAdmin(orderId) {
    const orderRef = adminDb.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) return;

    const orderData = orderSnap.data();
    const paintingIds = orderData.paintingIds || [];

    if (paintingIds.length === 0) return;

    const batch = adminDb.batch();

    paintingIds.forEach(id => {
        const paintingRef = adminDb.collection("paintings").doc(id);
        batch.update(paintingRef, { status: "sold" });
    });

    await batch.commit();
}
