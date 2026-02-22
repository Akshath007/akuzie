import { adminDb } from './firebase-admin';
import { LRUCache } from 'lru-cache';

// In-memory cache for server-side data
// This cache is shared across all requests in the same server process
const dataCache = new LRUCache({
    max: 50, // max 50 cached queries
    ttl: 60 * 1000, // 60 second TTL — fresh enough for an art gallery
});

/**
 * Fetches paintings from Firestore via admin SDK (server-side).
 * Results are cached for 60 seconds so 100+ concurrent users share a single DB read.
 * 
 * @param {string|null} category - 'painting', 'crochet', or null for all
 * @param {number} limitCount - max items to return (default 50)
 * @returns {Promise<Array>} paintings
 */
export async function getServerPaintings(category = null, limitCount = 50) {
    const cacheKey = `paintings_${category || 'all'}_${limitCount}`;
    const cached = dataCache.get(cacheKey);
    if (cached) return cached;

    try {
        let ref = adminDb.collection('paintings').orderBy('createdAt', 'desc');

        // Use Firestore where() filter — avoids downloading unnecessary docs
        if (category) {
            ref = ref.where('category', '==', category);
        }

        ref = ref.limit(limitCount);

        const snapshot = await ref.get();
        const items = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                category: data.category || 'painting',
                createdAt: data.createdAt?.toMillis?.() || data.createdAt?._seconds * 1000 || null,
            };
        });

        dataCache.set(cacheKey, items);
        return items;
    } catch (error) {
        console.error('getServerPaintings error:', error);
        return [];
    }
}

/**
 * Fetches a single painting by ID (server-side, cached).
 */
export async function getServerPainting(id) {
    const cacheKey = `painting_${id}`;
    const cached = dataCache.get(cacheKey);
    if (cached) return cached;

    try {
        const docRef = adminDb.collection('paintings').doc(id);
        const docSnap = await docRef.get();
        if (!docSnap.exists) return null;

        const data = docSnap.data();
        const item = {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toMillis?.() || data.createdAt?._seconds * 1000 || null,
        };

        dataCache.set(cacheKey, item);
        return item;
    } catch (error) {
        console.error('getServerPainting error:', error);
        return null;
    }
}

/**
 * Invalidate cache for a specific key or all keys.
 * Call this after admin creates/updates/deletes paintings.
 */
export function invalidateCache(key = null) {
    if (key) {
        // Invalidate specific and related keys
        dataCache.delete(key);
        // Also clear list caches since they may contain stale data
        for (const k of dataCache.keys()) {
            if (k.startsWith('paintings_')) dataCache.delete(k);
        }
    } else {
        dataCache.clear();
    }
}
