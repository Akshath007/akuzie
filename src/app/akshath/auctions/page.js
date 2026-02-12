'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { deleteAuction, passToNextBidder } from '@/lib/auction-data';
import { formatPrice } from '@/lib/utils';
import { Plus, Gavel, Timer, Trash2, ArrowDownCircle, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';

export default function AuctionsPage() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedAuctionId, setExpandedAuctionId] = useState(null);

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

    const handleDeleteAuction = async (id, title) => {
        if (!confirm(`Are you sure you want to permanently delete "${title}"? This will also delete all associated bids. This action cannot be undone.`)) return;
        try {
            await deleteAuction(id);
        } catch (error) {
            alert("Error deleting auction: " + error.message);
        }
    };

    const handlePassToNext = async (id, title) => {
        if (!confirm(`Pass "${title}" to the next highest bidder? The current winner will lose their purchase rights.`)) return;
        try {
            const result = await passToNextBidder(id);
            alert(result.message);
        } catch (error) {
            alert("Error: " + error.message);
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
                                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${auction.status === 'active' && !isEnded ? 'bg-green-100 text-green-700' :
                                            auction.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                                                auction.status === 'awaiting_payment' ? 'bg-amber-100 text-amber-700' :
                                                    auction.status === 'unsold' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-600'
                                            }`}>
                                            {isEnded && auction.status === 'active' ? 'Ended' : auction.status === 'awaiting_payment' ? 'Awaiting Payment' : auction.status}
                                        </span>
                                        <span>•</span>
                                        <span>Bids: {auction.bidCount || 0}</span>
                                        {(auction.currentWinnerId || (isEnded && auction.highestBidderId)) && auction.status !== 'unsold' && (
                                            <>
                                                <span>•</span>
                                                <span className="text-xs text-violet-600 font-medium">
                                                    Winner: {auction.highestBidderName || (auction.currentWinnerId || auction.highestBidderId).slice(0, 8) + '...'}
                                                </span>
                                            </>
                                        )}
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
                                            By: {auction.highestBidderName || auction.highestBidderId.slice(0, 8) + '...'}
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

                            <div className="flex items-center gap-2 flex-wrap">
                                {auction.status === 'active' && !isEnded && (
                                    <button
                                        onClick={() => handleEndAuction(auction.id)}
                                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                                    >
                                        End Now
                                    </button>
                                )}
                                {(isEnded || auction.status === 'awaiting_payment') && auction.status !== 'sold' && auction.status !== 'unsold' && (auction.highestBidderId || auction.currentWinnerId) && (
                                    <button
                                        onClick={() => handlePassToNext(auction.id, auction.title)}
                                        className="flex items-center gap-1.5 text-amber-600 hover:bg-amber-50 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                                        title="Current winner didn't pay? Pass to the next highest bidder."
                                    >
                                        <ArrowDownCircle size={14} /> Pass to Next
                                    </button>
                                )}
                                {isEnded && auction.status !== 'sold' && (auction.highestBidderId || auction.currentWinnerId) && auction.status !== 'unsold' && (
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">Awaiting Payment</span>
                                    </div>
                                )}
                                {auction.status === 'unsold' && (
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">No Buyers Left</span>
                                    </div>
                                )}
                                <button
                                    onClick={() => setExpandedAuctionId(expandedAuctionId === auction.id ? null : auction.id)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${expandedAuctionId === auction.id ? 'bg-violet-600 text-white shadow-md' : 'bg-violet-50 text-violet-600 hover:bg-violet-100'}`}
                                >
                                    <Gavel size={14} /> Bids
                                </button>

                                <button
                                    onClick={() => handleDeleteAuction(auction.id, auction.title)}
                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                    title="Delete auction"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* EXPANDE BIDS SECTION */}
                            {expandedAuctionId === auction.id && (
                                <div className="w-full mt-6 pt-6 border-t border-gray-100 animate-in slide-in-from-top-4 duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                            <TrendingUp size={14} /> Detailed Bid History
                                        </h4>
                                        <span className="text-[10px] text-gray-400 uppercase font-mono">Real-time Feed</span>
                                    </div>
                                    <BidHistoryTable auctionId={auction.id} />
                                </div>
                            )}
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

// Internal component for real-time bid history in Admin
function BidHistoryTable({ auctionId }) {
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, "bids"),
            where("auctionId", "==", auctionId),
            orderBy("amount", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setBids(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [auctionId]);

    if (loading) return <div className="text-center py-4 text-xs text-gray-400 animate-pulse">Updating bid history...</div>;
    if (bids.length === 0) return <div className="text-center py-4 text-xs text-gray-400 italic">No bids placed for this auction yet.</div>;

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-50 bg-gray-50/30">
            <table className="w-full text-left text-xs">
                <thead>
                    <tr className="text-gray-400 uppercase tracking-tighter">
                        <th className="p-3 font-medium">Rank</th>
                        <th className="p-3 font-medium">Bidder</th>
                        <th className="p-3 font-medium">User ID</th>
                        <th className="p-3 font-medium">Time</th>
                        <th className="p-3 font-medium text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {bids.map((bid, index) => (
                        <tr key={bid.id} className={`${index === 0 ? 'bg-violet-50/50' : ''} hover:bg-gray-100/50 transition-colors`}>
                            <td className="p-3 font-bold text-gray-400">
                                {index === 0 ? <span className="text-violet-600">★ 1</span> : index + 1}
                            </td>
                            <td className="p-3">
                                <span className={`font-bold ${index === 0 ? 'text-violet-700' : 'text-gray-900'}`}>
                                    {bid.userName || 'Anonymous'}
                                </span>
                            </td>
                            <td className="p-3 text-gray-400 font-mono text-[10px]" title={bid.userId}>
                                {bid.userId.slice(0, 10)}...
                            </td>
                            <td className="p-3 text-gray-500">
                                {bid.timestamp?.toDate().toLocaleString([], {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </td>
                            <td className={`p-3 text-right font-mono font-bold ${index === 0 ? 'text-violet-700 text-sm' : 'text-gray-700'}`}>
                                {formatPrice(bid.amount)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
