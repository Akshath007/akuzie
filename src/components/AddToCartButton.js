'use client';

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AddToCartButton({ painting }) {
    const { addToCart, cart, isLoaded } = useCart();
    const { user, loginWithGoogle } = useAuth(); // We might not force login to ADD, but to CHECKOUT.
    const router = useRouter();
    const [isInCart, setIsInCart] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isLoaded) {
            setIsInCart(cart.some(item => item.id === painting.id));
        }
    }, [cart, isLoaded, painting.id]);

    const handleAdd = () => {
        addToCart(painting);
        router.push('/cart');
    };

    if (isInCart) {
        return (
            <button
                onClick={() => router.push('/cart')}
                className="w-full bg-stone-100 text-stone-900 border border-stone-200 py-4 text-xs uppercase tracking-[0.2em] hover:bg-stone-200 transition-colors"
            >
                View in Cart
            </button>
        );
    }

    return (
        <button
            onClick={handleAdd}
            className="w-full bg-gray-900 text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors"
        >
            Add to Cart
        </button>
    );
}
