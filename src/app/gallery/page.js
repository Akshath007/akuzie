'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPaintings } from '@/lib/data';
import PaintingCard from '@/components/PaintingCard';

function GalleryContent() {
    const [paintings, setPaintings] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || 'painting'; // Default to painting if no category

    useEffect(() => {
        async function fetchPaintings() {
            setLoading(true);
            const data = await getPaintings(category);
            setPaintings(data);
            setLoading(false);
        }
        fetchPaintings();
    }, [category]);

    const filteredPaintings = useMemo(() => {
        if (!query) return paintings;
        const lowerQ = query.toLowerCase();
        return paintings.filter(p =>
            p.title.toLowerCase().includes(lowerQ) ||
            p.description?.toLowerCase().includes(lowerQ) ||
            p.medium?.toLowerCase().includes(lowerQ)
        );
    }, [paintings, query]);

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 lg:px-12 bg-[#fafafa]">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-20 text-center max-w-2xl mx-auto fade-in">
                    <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">
                        {category === 'crochet' ? 'Cozy Crochet' : 'Art Collection'}
                    </h1>
                    {query && (
                        <p className="text-gray-500 font-light mb-4">Search results for "{query}"</p>
                    )}
                    <div className="w-12 h-px bg-gray-300 mx-auto"></div>
                </div>

                {/* 
           GRID: 
           - Mobile: 1 col
           - Tablet: 2 col
           - Desktop: 3 col
           - Strict Grid (no masonry) for cleaner alignment
        */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-12">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="space-y-4 animate-pulse">
                                <div className="aspect-[4/5] bg-gray-200"></div>
                                <div className="h-4 bg-gray-200 w-2/3 mx-auto"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-20 gap-x-12 min-h-[50vh]">
                        {filteredPaintings.length > 0 ? (
                            filteredPaintings.map((painting, idx) => (
                                <div key={painting.id} className="fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                                    <PaintingCard painting={painting} />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <p className="text-gray-400 font-serif italic text-xl">No works found matching "{query}".</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function GalleryPage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-32 text-center">Loading...</div>}>
            <GalleryContent />
        </Suspense>
    );
}
