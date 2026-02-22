'use client';

import dynamic from 'next/dynamic';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { WishlistProvider } from '@/context/WishlistContext';

// Lazy-load LiveBidNotif — it's not critical for initial page render
const LiveBidNotif = dynamic(() => import('@/components/LiveBidNotif'), {
    ssr: false,
    loading: () => null,
});

export function Providers({ children }) {
    return (
        <AuthProvider>
            <CartProvider>
                <WishlistProvider>
                    {children}
                    <LiveBidNotif />
                </WishlistProvider>
            </CartProvider>
        </AuthProvider>
    );
}
