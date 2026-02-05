'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPaintings } from '@/lib/data';
import PaintingCard from '@/components/PaintingCard';

// Wrap content that uses searchParams in a Suspense-friendly component
function GalleryContent() {
    const [paintings, setPaintings] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    useEffect(() => {
        async function fetchPaintings() {
            const data = await getPaintings();
            setPaintings(data);
            setLoading(false);
        }
        fetchPaintings();
    }, []);

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
        <div className="min-h-screen pt-32 pb-24 px-4 md:px-8 bg-white">
            <div className="max-w-[1600px] mx-auto">

                {/* Header (Minimal) */}
                <div className="mb-16 fade-in text-center">
                    <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">Collection</h1>
                    <p className="text-stone-500 font-light max-w-md mx-auto">
                        {query ? `Search results for "${query}"` : `${paintings.length} original works.`}
                    </p>
                </div>

                {loading ? (
                    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="break-inside-avoid animate-pulse">
                                <div className="bg-stone-100 w-full mb-2" style={{ height: `${Math.floor(Math.random() * 200) + 300}px` }}></div>
                                <div className="h-3 bg-stone-100 w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8 min-h-[50vh]">
                        {filteredPaintings.length > 0 ? (
                            filteredPaintings.map((painting, idx) => (
                                <div key={painting.id} className="break-inside-avoid fade-in mb-8" style={{ animationDelay: `${idx * 50}ms` }}>
                                    <PaintingCard painting={painting} />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <p className="text-stone-400 font-serif italic text-xl">No works found matching "{query}".</p>
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
        <Suspense fallback={<div className="min-h-screen pt-32 text-center">Loading Gallery...</div>}>
            <GalleryContent />
        </Suspense>
    );
}
