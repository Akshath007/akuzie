import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const revalidate = 1; // Near-instant updates for public categories

export async function GET() {
    try {
        const snapshot = await adminDb.collection('workspaces').orderBy('createdAt', 'desc').get();
        const categories = snapshot.docs.map(doc => ({
            id: doc.id,
            category: doc.data().category || doc.id,
            label: doc.data().label || doc.id,
        })).filter((v, i, a) => a.findIndex(t => (t.category === v.category)) === i); // Unique by category

        return NextResponse.json({ categories });
    } catch (e) {
        console.error('Failed to fetch public categories:', e);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}
