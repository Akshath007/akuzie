'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getActiveAuctions } from '@/lib/auction-data';
import { formatPrice } from '@/lib/utils';
import { Loader2, Timer, Gavel } from 'lucide-react';

export default function AuctionsListPage() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAuctions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getActiveAuctions();
            console.log("Fetched auctions:", data.length, data);
            setAuctions(data);
        } catch (err) {
            console.error("Failed to load auctions", err);
            setError(err.message || "Failed to load auctions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuctions();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pt-32 pb-20 bg-[#fafafa] min-h-screen">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">Live Auctions</h1>
                    <div className="py-20 bg-white rounded-3xl border border-dashed border-red-200">
                        <p className="text-red-500 mb-4">Error: {error}</p>
                        <button onClick={fetchAuctions} className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 bg-[#fafafa] min-h-screen">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">Live Auctions</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Bid on exclusive, one-of-a-kind artworks. The highest bidder wins.
                    </p>
                </div>

                {auctions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {auctions.map((auction) => (
                            <Link href={`/auction/${auction.id}`} key={auction.id} className="group block bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="aspect-[4/5] relative bg-gray-100">
                                    {auction.images?.[0] ? (
                                        <Image
                                            src={auction.images[0]}
                                            alt={auction.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-300"><Gavel size={32} /></div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span> Live
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-serif text-xl text-gray-900 mb-2 truncate">{auction.title}</h3>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Current Bid</p>
                                            <p className="text-2xl font-serif text-violet-600 font-bold">
                                                {formatPrice(auction.currentHighestBid)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1 flex items-center justify-end gap-1">
                                                <Timer size={12} /> Time Left
                                            </p>
                                            <AuctionTimer endTime={auction.endTime} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <Gavel size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-serif text-gray-900 mb-2">No Live Auctions</h3>
                        <p className="text-gray-500">Check back later for new drops.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function AuctionTimer({ endTime }) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!endTime) return;

        // Handle Firestore Timestamp or Date object
        const end = endTime.toDate ? endTime.toDate() : new Date(endTime);

        const update = () => {
            const now = new Date();
            const diff = end - now;
            if (diff <= 0) {
                setTimeLeft("Ended");
                return;
            }
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${hours}h ${minutes}m`);
        };

        update();
        const interval = setInterval(update, 60000); // Mins update is enough for list view
        return () => clearInterval(interval);
    }, [endTime]);

    return <p className="font-mono text-gray-700 font-bold">{timeLeft}</p>;
}
