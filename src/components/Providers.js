'use client';

import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { WishlistProvider } from '@/context/WishlistContext';
import LiveBidNotif from '@/components/LiveBidNotif';

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
