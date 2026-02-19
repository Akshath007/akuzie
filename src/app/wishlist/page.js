'use client';

import { useWishlist } from '@/context/WishlistContext';
import PaintingCard from '@/components/PaintingCard';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
    const { wishlist } = useWishlist();

    return (
        <div className="min-h-screen pt-32 pb-24 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div>
                    <h1 className="text-4xl md:text-6xl font-serif text-gray-900 mb-4">Your <span className="text-gray-300 italic">Wishlist.</span></h1>
                    <p className="text-gray-500 font-light tracking-wide uppercase text-[10px]">Saved Artworks & Collectibles</p>
                </div>
                {wishlist.length > 0 && (
                    <Link href="/gallery" className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold text-gray-900 hover:text-violet-600 transition-colors">
                        Continue Shopping <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                )}
            </div>

            {wishlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-8 border border-gray-100">
                        <Heart size={32} />
                    </div>
                    <h2 className="text-2xl font-serif text-gray-900 mb-4">No artworks saved yet</h2>
                    <p className="text-gray-500 max-w-xs mb-10 font-light">Explore our gallery and heart the pieces that speak to you most.</p>
                    <Link href="/gallery" className="px-10 py-4 bg-gray-900 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-violet-600 transition-all shadow-xl shadow-gray-200">
                        Browse Gallery
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-12 md:gap-y-20">
                    {wishlist.map((p) => (
                        <div key={p.id}>
                            <PaintingCard painting={p} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
