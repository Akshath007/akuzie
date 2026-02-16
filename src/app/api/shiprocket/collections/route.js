import { NextResponse } from 'next/server';

// Shiprocket Catalog Sync API - Fetch Collections/Categories
// GET /api/shiprocket/collections?page=1&limit=100
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '100');

        // Our categories/collections are fixed
        const allCollections = [
            {
                id: 'painting',
                updated_at: new Date().toISOString(),
                title: 'Paintings',
                body_html: '<p>Original paintings by Akuzie</p>',
                image: {
                    src: ''
                }
            },
            {
                id: 'crochet',
                updated_at: new Date().toISOString(),
                title: 'Crochet',
                body_html: '<p>Handmade crochet items by Akuzie</p>',
                image: {
                    src: ''
                }
            }
        ];

        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedCollections = allCollections.slice(start, end);

        return NextResponse.json({
            collections: paginatedCollections,
            page: page,
            limit: limit,
            total: allCollections.length,
            has_more: end < allCollections.length
        });

    } catch (error) {
        console.error('Shiprocket Collections API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
