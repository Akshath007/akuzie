import { NextResponse } from 'next/server';
import { getServerPaintings } from '@/lib/data-server';

/**
 * GET /api/paintings?category=painting&limit=6
 * 
 * Cached server-side endpoint for painting data.
 * Uses the in-memory LRU cache so 100+ users share a single Firestore read.
 * 
 * Responses include Cache-Control headers for browser/CDN caching.
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || null;
        const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

        const paintings = await getServerPaintings(category, limit);

        return NextResponse.json(
            { paintings, timestamp: Date.now() },
            {
                status: 200,
                headers: {
                    // Serve stale data instantly, revalidate  in background
                    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
                },
            }
        );
    } catch (error) {
        console.error('API /paintings error:', error);
        return NextResponse.json({ error: 'Failed to fetch paintings' }, { status: 500 });
    }
}
