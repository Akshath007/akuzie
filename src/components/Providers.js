'use client';

import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';

export function Providers({ children }) {
    return (
        <AuthProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </AuthProvider>
    );
}
