'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatPrice } from '@/lib/utils';
import { Plus, Gavel, Timer, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function AuctionsPage() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "auctions"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                startTime: doc.data().startTime?.toDate(),
                endTime: doc.data().endTime?.toDate(),
            }));
            setAuctions(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleEndAuction = async (id) => {
        if (!confirm("Are you sure you want to end this auction manually?")) return;
        try {
            await updateDoc(doc(db, "auctions", id), {
                status: 'ended',
                endTime: Timestamp.now()
            });
        } catch (error) {
            alert("Error ending auction: " + error.message);
        }
    };

    if (loading) return <div className="p-8">Loading auctions...</div>;

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif text-gray-900">Auctions</h1>
                    <p className="text-gray-500">Manage live and past auctions.</p>
                </div>
                <Link
                    href="/akshath/auctions/new"
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <Plus size={18} /> New Auction
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {auctions.map((auction) => {
                    const isEnded = new Date() > auction.endTime || auction.status === 'ended';
                    const timeRemaining = Math.max(0, auction.endTime - new Date());

                    return (
                        <div key={auction.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative">
                                    {auction.images?.[0] ? (
                                        <img src={auction.images[0]} alt={auction.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400"><Gavel size={20} /></div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg text-gray-900">{auction.title}</h3>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${auction.status === 'active' && !isEnded ? 'bg-green-100 text-green-700' :
                                                auction.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            {isEnded && auction.status === 'active' ? 'Ended' : auction.status}
                                        </span>
                                        <span>•</span>
                                        <span>Bids: {auction.bidCount || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 text-sm">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Current Bid</p>
                                    <p className="font-mono font-bold text-lg text-violet-600">
                                        {formatPrice(auction.currentHighestBid)}
                                    </p>
                                    {auction.highestBidderId && (
                                        <p className="text-xs text-gray-500 truncate max-w-[100px]" title={auction.highestBidderId}>
                                            By: {auction.highestBidderId.slice(0, 8)}...
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Ends In</p>
                                    <div className="flex items-center gap-2 font-mono text-gray-700">
                                        <Timer size={14} />
                                        {isEnded ? (
                                            <span>Ended {auction.endTime.toLocaleDateString()}</span>
                                        ) : (
                                            <span>
                                                {Math.floor(timeRemaining / (1000 * 60 * 60))}h {Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))}m
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {auction.status === 'active' && !isEnded && (
                                    <button
                                        onClick={() => handleEndAuction(auction.id)}
                                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                                    >
                                        End Now
                                    </button>
                                )}
                                {isEnded && auction.status !== 'sold' && auction.highestBidderId && (
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">Awaiting Payment</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {auctions.length === 0 && (
                    <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                        No auctions found. Start one!
                    </div>
                )}
            </div>
        </div>
    );
}
