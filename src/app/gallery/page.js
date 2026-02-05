'use client';

import { useEffect, useState } from 'react';
import { getPaintings } from '@/lib/data';
import PaintingCard from '@/components/PaintingCard';

export default function GalleryPage() {
    const [paintings, setPaintings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPaintings() {
            const data = await getPaintings();
            setPaintings(data);
            setLoading(false);
        }
        fetchPaintings();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-24">
            <h1 className="text-3xl font-light text-gray-900 mb-4 text-center">Collection</h1>
            <p className="text-center text-gray-500 mb-16 max-w-2xl mx-auto font-light">
                Explore our curated selection of original acrylic paintings.
            </p>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-[3/4] bg-gray-100"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                    {paintings.map((painting) => (
                        <PaintingCard key={painting.id} painting={painting} />
                    ))}
                </div>
            )}

            {!loading && paintings.length === 0 && (
                <div className="text-center py-24 text-gray-400 font-light">
                    No paintings found.
                </div>
            )}
        </div>
    );
}
