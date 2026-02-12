'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { load } from '@cashfreepayments/cashfree-js';
import { formatPrice } from '@/lib/utils';
import { Loader2, ShieldCheck, CreditCard } from 'lucide-react';
import Image from 'next/image';

export default function AuctionCheckoutPage() {
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [address, setAddress] = useState('');

    useEffect(() => {
        const fetchAuction = async () => {
            if (!id || authLoading) return;

            if (!user) {
                router.push(`/login?redirect=/checkout/auction/${id}`);
                return;
            }

            try {
                const docRef = doc(db, 'auctions', id);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    setError('Auction not found');
                    setLoading(false);
                    return;
                }

                const data = { id: docSnap.id, ...docSnap.data() };

                // Validate Winner (Check currentWinnerId first for cascading support)
                const currentWinnerId = data.currentWinnerId || data.highestBidderId;
                if (currentWinnerId !== user.uid) {
                    setError('Forbidden: Only the winner can access checkout.');
                    setLoading(false);
                    return;
                }

                if (data.status !== 'ended' && data.status !== 'awaiting_payment') {
                    setError('This auction is not ready for payment yet.');
                    setLoading(false);
                    return;
                }

                setAuction(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load auction details.');
                setLoading(false);
            }
        };

        fetchAuction();
    }, [id, user, authLoading, router]);

    const handlePayment = async () => {
        setProcessing(true);
        try {
            // Initiate backend checkout
            const response = await fetch('/api/checkout/auction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auctionId: auction.id,
                    userId: user.uid,
                    customerName: user.displayName || 'Winner',
                    customerEmail: user.email,
                    customerPhone: '9999999999', // Collect if needed
                    shippingAddress: address
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Payment initialization failed');
            }

            // Launch Cashfree
            const cashfree = await load({
                mode: process.env.NEXT_PUBLIC_CASHFREE_MODE || 'sandbox',
            });

            cashfree.checkout({
                paymentSessionId: data.payment_session_id,
                redirectTarget: '_self',
            });

        } catch (err) {
            console.error(err);
            alert(`Payment Error: ${err.message}`);
            setProcessing(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4 p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p className="text-gray-600">{error}</p>
                <button
                    onClick={() => router.push('/')}
                    className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    // Determine correct price to show
    const payAmount = auction.currentWinningBid || auction.currentHighestBid;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 md:p-12">
            <div className="bg-white max-w-lg w-full rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-green-600 p-6 text-white text-center">
                    <ShieldCheck size={48} className="mx-auto mb-4 opacity-90" />
                    <h1 className="text-2xl font-bold uppercase tracking-widest">Congratulations!</h1>
                    <p className="opacity-90 mt-2 text-sm">You won the auction.</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Item Summary */}
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden relative shadow-sm">
                            {auction.images?.[0] && (
                                <Image
                                    src={auction.images[0]}
                                    alt={auction.title}
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>
                        <div>
                            <h2 className="font-serif text-lg text-gray-900 leading-tight mb-1">{auction.title}</h2>
                            <p className="text-sm text-gray-400 font-mono">ID: #{auction.id.slice(0, 6)}</p>
                        </div>
                    </div>

                    <div className="border-t border-b border-gray-100 py-6 space-y-4">
                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Winning Bid</span>
                            <span className="font-bold text-gray-900 text-lg">{formatPrice(payAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Platform Fee</span>
                            <span className="font-medium text-gray-900">₹0</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-gray-900 pt-4 border-t border-gray-50">
                            <span>Total Payable</span>
                            <span className="text-xl text-violet-600">{formatPrice(payAmount)}</span>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Shipping Address</label>
                        <textarea
                            className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-violet-500 text-sm"
                            rows={3}
                            placeholder="Full Address, City, State, Pincode"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={processing || !address.trim()}
                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-lg shadow-gray-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {processing ? (
                            <>
                                <Loader2 size={20} className="animate-spin" /> Processing...
                            </>
                        ) : (
                            <>
                                Pay Now <CreditCard size={20} />
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-400">
                        Secure payment powered by Cashfree.
                    </p>
                </div>
            </div>
        </div>
    );
}
