'use client';

import { useEffect, useState, useMemo } from 'react';
import { getPaintings } from '@/lib/data';
import PaintingCard from '@/components/PaintingCard';
import Input from '@/components/Input';
import { Search } from 'lucide-react';

export default function GalleryPage() {
    const [paintings, setPaintings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

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
        <div className="min-h-screen pt-24 pb-24 px-6 md:px-12 bg-white">
            <div className="max-w-7xl mx-auto">

                {/* Header & Search */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 fade-in">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">Collection</h1>
                        <p className="text-stone-500 font-light max-w-md">
                            Discover unique narratives crafted in acrylics.
                            {paintings.length} works available.
                        </p>
                    </div>

                    <div className="w-full md:w-1/3 relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by title, style..."
                            className="w-full bg-stone-50 border border-transparent focus:bg-white focus:border-stone-200 rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none transition-all duration-300"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-10">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="animate-pulse space-y-4">
                                <div className="aspect-[4/5] bg-stone-100"></div>
                                <div className="h-4 bg-stone-100 w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-20 gap-x-10 min-h-[50vh]">
                        {filteredPaintings.length > 0 ? (
                            filteredPaintings.map((painting, idx) => (
                                <div key={painting.id} className="fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                                    <PaintingCard painting={painting} />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <p className="text-stone-400 font-serif italic text-xl">No works found mathcing "{query}".</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
