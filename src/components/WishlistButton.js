'use client';

import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function WishlistButton({ painting, variant = "default" }) {
    const { isInWishlist, toggleWishlist } = useWishlist();
    const active = isInWishlist(painting.id);

    if (variant === "icon") {
        return (
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist(painting);
                }}
                className="p-3 rounded-full bg-white/50 backdrop-blur-md hover:bg-white transition-all shadow-sm"
            >
                <Heart
                    size={20}
                    className={cn(
                        "transition-colors duration-300",
                        active ? "fill-red-500 text-red-500" : "text-gray-900"
                    )}
                />
            </button>
        );
    }

    return (
        <button
            onClick={() => toggleWishlist(painting)}
            className={cn(
                "flex items-center gap-2 px-6 py-4 rounded-full border transition-all duration-300 font-bold text-xs uppercase tracking-widest",
                active
                    ? "bg-red-50 border-red-100 text-red-600 shadow-sm"
                    : "bg-white border-gray-100 text-gray-900 hover:border-gray-300"
            )}
        >
            <Heart size={16} className={active ? "fill-red-500" : ""} />
            {active ? "In Wishlist" : "Save to Wishlist"}
        </button>
    );
}
