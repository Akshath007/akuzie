'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const storedCart = localStorage.getItem('akuzie_cart');
        if (storedCart) {
            const parsedCart = JSON.parse(storedCart);
            setCart(parsedCart);

            // Defer sync to after initial render — use idle callback for non-blocking behavior
            if (parsedCart.length > 0) {
                const scheduleSync = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500));
                scheduleSync(() => syncCartWithStore(parsedCart));
            }
        }

        // Check if there's a completed pending order (user closed browser before redirect)
        const pendingOrder = localStorage.getItem('akuzie_pending_order');
        if (pendingOrder) {
            checkPendingOrder(pendingOrder);
        }

        setIsLoaded(true);
    }, []);

    // Check each cart item's status in Firestore; remove sold items
    const syncCartWithStore = async (cartItems) => {
        try {
            const soldIds = [];
            await Promise.all(
                cartItems.map(async (item) => {
                    try {
                        const paintingRef = doc(db, 'paintings', item.id);
                        const snap = await getDoc(paintingRef);
                        if (snap.exists() && snap.data().status === 'sold') {
                            soldIds.push(item.id);
                        }
                    } catch (e) {
                        // Ignore individual fetch errors
                    }
                })
            );

            if (soldIds.length > 0) {
                setCart(prev => {
                    const filtered = prev.filter(item => !soldIds.includes(item.id));
                    localStorage.setItem('akuzie_cart', JSON.stringify(filtered));
                    return filtered;
                });
            }
        } catch (e) {
            console.error('Cart sync error:', e);
        }
    };

    // Check if a pending order was successfully paid (user closed before redirect)
    const checkPendingOrder = async (orderId) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            const snap = await getDoc(orderRef);
            if (snap.exists()) {
                const data = snap.data();
                if (data.paymentStatus === 'paid') {
                    // Order was paid — clear the cart and pending flag
                    setCart([]);
                    localStorage.setItem('akuzie_cart', JSON.stringify([]));
                    localStorage.removeItem('akuzie_pending_order');
                }
            }
        } catch (e) {
            console.error('Pending order check error:', e);
        }
    };

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

    // Update a cart item with fresh data from Firestore (e.g. price changes)
    const updateCartItem = (id, newData) => {
        setCart((prev) => prev.map(item =>
            item.id === id ? { ...item, ...newData } : item
        ));
    };

    const clearCart = useCallback(() => {
        setCart([]);
        localStorage.removeItem('akuzie_pending_order');
    }, []);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCartItem, clearCart, isLoaded }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
