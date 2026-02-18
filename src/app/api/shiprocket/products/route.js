import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

function safeDate(val) {
    if (!val) return new Date().toISOString();
    if (val.toDate) return val.toDate().toISOString(); // Firestore Timestamp
    if (val.seconds) return new Date(val.seconds * 1000).toISOString(); // Firestore Timestamp object
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

// Shiprocket Catalog Sync API - Fetch All Products
// GET /api/shiprocket/products?page=1&limit=100
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '100');

        const paintingsCol = collection(db, 'paintings');
        const q = query(paintingsCol, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        const allItems = snapshot.docs.map(doc => {
            const data = doc.data();
            return { id: doc.id, ...data };
        });

        // Pagination
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedItems = allItems.slice(start, end);

        // Format products in Shiprocket's expected format
        const products = paginatedItems.map(item => ({
            id: item.id,
            title: item.title || 'Untitled Artwork',
            body_html: `<p>${item.description || item.medium || 'Original artwork by Akuzie'}</p>`,
            vendor: 'Akuzie',
            product_type: item.category || 'painting',
            updated_at: safeDate(item.createdAt),
            status: item.status === 'sold' ? 'draft' : 'active',
            variants: [
                {
                    id: item.id,
                    title: item.title || 'Default',
                    price: String(item.price || '0'),
                    quantity: item.status === 'sold' ? 0 : 1,
                    sku: `AKZ-${item.id}`,
                    updated_at: safeDate(item.createdAt),
                    image: {
                        src: (item.images && item.images.length > 0)
                            ? item.images[0]
                            : ''
                    },
                    weight: item.weight || 0.5
                }
            ],
            image: {
                src: (item.images && item.images.length > 0)
                    ? item.images[0]
                    : ''
            }
        }));

        return NextResponse.json({
            data: {
                products: products,
                page: page,
                limit: limit,
                total: allItems.length,
                has_more: end < allItems.length
            }
        });

    } catch (error) {
        console.error('Shiprocket Products API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
