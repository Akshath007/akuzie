'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { doc, onSnapshot, updateDoc, Timestamp, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { placeBid } from '@/lib/auction-data';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Timer, Gavel, ArrowRight, AlertCircle, ShieldCheck, Clock } from 'lucide-react';

export default function AuctionDetailPage() {
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState('');
    const [placingBid, setPlacingBid] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const [error, setError] = useState(null);

    // Fetch Auction Data (Realtime)
    useEffect(() => {
        if (!id) return;
        const unsubscribe = onSnapshot(doc(db, "auctions", id), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setAuction({ id: doc.id, ...data });

                // Calculate initial time left immediately
                if (data.endTime) {
                    const end = data.endTime.toDate();
                    const now = new Date();
                    updateTimer(end);
                }
            } else {
                setError("Auction not found");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id]);

    // Timer Logic
    useEffect(() => {
        if (!auction?.endTime) return;
        const interval = setInterval(() => {
            updateTimer(auction.endTime.toDate());
        }, 1000);
        return () => clearInterval(interval);
    }, [auction]);

    const updateTimer = (endTime) => {
        const now = new Date();
        const diff = endTime - now;

        if (diff <= 0) {
            setTimeLeft("Ended");
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (days > 0) {
            setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else {
            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
    };

    const handlePlaceBid = async (e) => {
        e.preventDefault();
        setError(null);

        if (!user) {
            router.push(`/login?redirect=/auction/${id}`);
            return;
        }

        const amount = Number(bidAmount);
        const minNextBid = (auction.currentHighestBid || 0) + (auction.minBidIncrement || 0);

        if (amount < minNextBid) {
            setError(`Bid must be at least ${formatPrice(minNextBid)}`);
            return;
        }

        setPlacingBid(true);
        try {
            await placeBid(id, user.uid, amount);
            setBidAmount(''); // Clear input on success
            alert("Bid placed successfully!");
        } catch (err) {
            setError("Failed to place bid: " + (err.message || err));
        } finally {
            setPlacingBid(false);
        }
    };

    if (loading || authLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!auction) return <div className="p-20 text-center">Auction not found.</div>;

    const isEnded = auction.status === 'ended' || auction.status === 'awaiting_payment' || auction.status === 'unsold' || new Date() > auction.endTime.toDate();
    // Cascading winner: currentWinnerId (set by admin pass-to-next) takes priority over highestBidderId
    const currentWinner = auction.currentWinnerId || auction.highestBidderId;
    const isWinner = isEnded && user && currentWinner === user.uid && auction.status !== 'unsold';
    const minNextBid = (auction.currentHighestBid || 0) + (auction.minBidIncrement || 0);

    return (
        <div className="pt-32 pb-20 bg-[#fafafa] min-h-screen">
            <div className="max-w-7xl mx-auto px-6">

                {/* Back Link */}
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
                    <ArrowRight className="rotate-180" size={16} /> Back to Gallery
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

                    {/* Left: Images */}
                    <div className="space-y-6">
                        <div className="aspect-[4/5] bg-gray-100 rounded-3xl overflow-hidden relative shadow-2xl shadow-violet-100/50">
                            {auction.images?.[0] ? (
                                <Image
                                    src={auction.images[0]}
                                    alt={auction.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 font-serif italic">No Preview</div>
                            )}

                            {/* Live Badge */}
                            {!isEnded && (
                                <div className="absolute top-6 left-6 bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full animate-pulse flex items-center gap-2">
                                    <span className="w-2 h-2 bg-white rounded-full"></span> Live
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Info & Bidding */}
                    <div className="flex flex-col h-full">
                        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4 leading-tight">{auction.title}</h1>
                        <p className="text-gray-500 mb-8 leading-relaxed font-light">{auction.description}</p>

                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">

                            {/* Timer & Current Bid */}
                            <div className="flex items-start justify-between border-b border-gray-100 pb-8">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                                        Current Bid
                                    </p>
                                    <p className="text-4xl font-serif text-gray-900">{formatPrice(auction.currentHighestBid)}</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {auction.bidCount || 0} bids placed
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center justify-end gap-2">
                                        <Clock size={14} /> Time Left
                                    </p>
                                    <p className={`text-2xl font-mono font-bold ${timeLeft === 'Ended' ? 'text-red-500' : 'text-gray-900'}`}>
                                        {timeLeft}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Ends {auction.endTime.toDate().toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Bidding Controls */}
                            {!isEnded ? (
                                <form onSubmit={handlePlaceBid} className="space-y-4">
                                    {user ? (
                                        <>
                                            <div>
                                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">
                                                    Your Bid (Min {formatPrice(minNextBid)})
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-serif">₹</span>
                                                    <input
                                                        type="number"
                                                        value={bidAmount}
                                                        onChange={(e) => setBidAmount(e.target.value)}
                                                        min={minNextBid}
                                                        required
                                                        className="w-full p-4 pl-8 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-violet-500 font-mono text-lg transition-all"
                                                        placeholder={minNextBid.toString()}
                                                    />
                                                </div>
                                            </div>

                                            {error && (
                                                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl">
                                                    <AlertCircle size={16} /> {error}
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={placingBid}
                                                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {placingBid ? 'Placing Bid...' : 'Place Bid'} <Gavel size={18} />
                                            </button>
                                            <p className="text-xs text-center text-gray-400">
                                                By placing a bid, you agree to our auction terms.
                                                If you win, you must pay within 24 hours.
                                            </p>
                                        </>
                                    ) : (
                                        <div className="text-center py-6 bg-gray-50 rounded-2xl">
                                            <p className="text-sm text-gray-500 mb-4">You must be logged in to place a bid.</p>
                                            <Link
                                                href={`/login?redirect=/auction/${id}`}
                                                className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                                            >
                                                Login / Register
                                            </Link>
                                        </div>
                                    )}
                                </form>
                            ) : (
                                <div className="bg-gray-100 p-8 rounded-2xl text-center">
                                    <h3 className="text-xl font-serif text-gray-900 mb-2">Auction Ended</h3>
                                    {auction.status === 'unsold' ? (
                                        <p className="text-gray-500">
                                            This auction ended with no buyer. All bidders have been passed.
                                        </p>
                                    ) : isWinner ? (
                                        <div className="animate-in fade-in zoom-in duration-500">
                                            <p className="text-green-600 font-bold mb-2 flex items-center justify-center gap-2">
                                                <ShieldCheck /> You won this auction!
                                            </p>
                                            <p className="text-sm text-gray-500 mb-6">
                                                Your winning bid: <span className="font-bold text-gray-900">{formatPrice(auction.currentWinningBid || auction.currentHighestBid)}</span>
                                            </p>
                                            <Link
                                                href={`/checkout/auction/${auction.id}`}
                                                className="inline-block w-full bg-green-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                                            >
                                                Claim & Pay Now
                                            </Link>
                                            <p className="text-xs text-gray-400 mt-4">
                                                Please complete payment within 24 hours or it may be passed to the next bidder.
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">
                                            Winning Bid: <span className="font-bold text-gray-900">{formatPrice(auction.currentWinningBid || auction.currentHighestBid)}</span>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Bids Section */}
                <div className="mt-24 max-w-3xl mx-auto">
                    <h3 className="text-2xl font-serif text-gray-900 mb-8 text-center">Recent Activity</h3>
                    <BidHistory auctionId={id} />
                </div>
            </div>
        </div>
    );
}

function BidHistory({ auctionId }) {
    const [bids, setBids] = useState([]);

    useEffect(() => {
        if (!auctionId) return;
        const q = query(
            collection(db, "bids"),
            where("auctionId", "==", auctionId),
            orderBy("timestamp", "desc"),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBids(data);
        });
        return () => unsubscribe();
    }, [auctionId]);

    if (bids.length === 0) return <p className="text-gray-400 text-center italic">No bids yet. Be the first!</p>;

    return (
        <div className="space-y-4">
            {bids.map((bid) => (
                <div key={bid.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs">
                            {bid.userId.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">User {bid.userId.slice(0, 6)}...</p>
                            <p className="text-xs text-gray-400">
                                {bid.timestamp?.toDate().toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                    <p className="font-mono font-bold text-violet-600">{formatPrice(bid.amount)}</p>
                </div>
            ))}
        </div>
    );
}
