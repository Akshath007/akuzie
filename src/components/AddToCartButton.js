'use client';

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AddToCartButton({ painting }) {
    const { addToCart, cart, isLoaded } = useCart();
    const router = useRouter();
    const [isInCart, setIsInCart] = useState(false);

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
                className="w-full bg-gray-100 text-gray-900 border border-gray-200 py-4 text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors"
            >
                View inside Cart
            </button>
        );
    }

    return (
        <button
            onClick={handleAdd}
            className="w-full bg-gray-900 text-white py-4 text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors"
        >
            Add to Cart
        </button>
    );
}
