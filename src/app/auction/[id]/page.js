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
import { Timer, Gavel, ArrowRight, AlertCircle, ShieldCheck, Clock, TrendingUp } from 'lucide-react';
import ShareButton from '@/components/ShareButton';

export default function AuctionDetailPage() {
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [auction, setAuction] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState('');
    const [placingBid, setPlacingBid] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const [error, setError] = useState(null);

    // Fetch Auction Data & Bids (Realtime)
    useEffect(() => {
        if (!id) return;

        // 1. Auction Details Listener
        const unsubAuction = onSnapshot(doc(db, "auctions", id), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setAuction({ id: doc.id, ...data });

                if (data.endTime) {
                    const end = data.endTime.toDate();
                    updateTimer(end);
                }
            } else {
                setError("Auction not found");
            }
            setLoading(false);
        });

        // 2. Bids History Listener (Real-time feed)
        const qBids = query(
            collection(db, "bids"),
            where("auctionId", "==", id),
            orderBy("amount", "desc"),
            limit(10) // Show last 10 highest bids
        );
        const unsubBids = onSnapshot(qBids, (snapshot) => {
            const bidsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setBids(bidsData);
        });

        return () => {
            unsubAuction();
            unsubBids();
        };
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
            await placeBid(id, user.uid, amount, user.displayName || 'Anonymous');
            setBidAmount(''); // Clear input on success
            // Removed alert for smoother experience, real-time update is enough feedback
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

    const maskName = (name) => {
        if (!name || name === 'Anonymous' || name === 'Masked User') return 'User';
        const parts = name.split(' ');
        const first = parts[0];
        if (first.length <= 2) return first + '***';
        return first.substring(0, 2) + '***' + first.substring(first.length - 1);
    };

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
                        <p className="text-gray-500 mb-6 leading-relaxed font-light">{auction.description}</p>
                        <div className="mb-8">
                            <ShareButton
                                title={`Akuzie Auction: ${auction.title}`}
                                text={`Check out this live auction on Akuzie: ${auction.title}`}
                                url={`https://akuzie.in/auction/${auction.id}`}
                            />
                        </div>

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

                            {/* Real-time Bid History Feed */}
                            <div className="pt-8 mt-8 border-t border-gray-100">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                    <TrendingUp size={14} className="text-violet-500" /> Recent Activity
                                </h4>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {bids.length > 0 ? (
                                        bids.map((bid, index) => (
                                            <div
                                                key={bid.id}
                                                className={`flex items-center justify-between animate-in fade-in slide-in-from-right-4 duration-500`}
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${index === 0 ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' : 'bg-gray-100 text-gray-500'}`}>
                                                        {index === 0 ? <Gavel size={12} /> : index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {maskName(bid.userName)}
                                                            {index === 0 && <span className="ml-2 text-[10px] text-violet-600 font-bold uppercase tracking-tighter bg-violet-50 px-1.5 py-0.5 rounded">Highest</span>}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 font-mono italic">
                                                            {bid.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className={`font-mono font-bold ${index === 0 ? 'text-violet-600 text-lg' : 'text-gray-900 text-sm'}`}>
                                                    {formatPrice(bid.amount)}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400 italic text-sm">
                                            No bids placed yet. Be the first!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #eee;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #ddd;
                }
            `}</style>
        </div>
    );
}
