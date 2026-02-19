'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Bell } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function LiveBidNotif() {
    const [latestBid, setLatestBid] = useState(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Only track bids from the last 5 minutes to avoid showing old ones on load
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);

        const bidsRef = collection(db, 'bids');
        const q = query(
            bidsRef,
            orderBy('timestamp', 'desc'),
            limit(1)
        );

        let isInitial = true;

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const bid = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

                // Skip if initial load to only show NEW bids
                if (isInitial) {
                    isInitial = false;
                    return;
                }

                // Verify timestamp is recent (if it exists)
                const bidTime = bid.timestamp?.toDate?.() || new Date(bid.timestamp);
                if (bidTime > fiveMinsAgo) {
                    setLatestBid(bid);
                    setShow(true);

                    // Auto hide after 6 seconds
                    const timer = setTimeout(() => setShow(false), 6000);
                    return () => clearTimeout(timer);
                }
            }
            isInitial = false;
        });

        return () => unsubscribe();
    }, []);

    return (
        <AnimatePresence>
            {show && latestBid && (
                <motion.div
                    initial={{ opacity: 0, x: 100, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="fixed bottom-8 right-8 z-[100] max-w-sm"
                >
                    <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100 p-4 flex items-center gap-4 overflow-hidden relative">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-50/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

                        <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-violet-200">
                            <Gavel size={20} />
                        </div>

                        <div className="flex-grow">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600 flex items-center gap-1">
                                    <Bell size={10} /> New Bid Placed
                                </span>
                                <span className="text-[8px] text-gray-400 font-mono">Just now</span>
                            </div>
                            <p className="text-gray-900 text-sm font-serif">
                                Someone bid <span className="font-bold text-gray-900">{formatPrice(latestBid.amount)}</span>
                            </p>
                            <p className="text-[10px] text-gray-400 truncate">On {latestBid.auctionTitle || "an exclusive artwork"}</p>
                        </div>

                        <button
                            onClick={() => setShow(false)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
