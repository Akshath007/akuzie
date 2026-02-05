'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const storedCart = localStorage.getItem('akuzie_cart');
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('akuzie_cart', JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    const addToCart = (painting) => {
        setCart((prev) => {
            if (prev.find((item) => item.id === painting.id)) {
                return prev;
            }
            return [...prev, painting];
        });
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, isLoaded }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
