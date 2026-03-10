'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, PAINTING_STATUS } from '@/lib/utils';
import { Trash2, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getPainting } from '@/lib/data';

export default function CartPage() {
    const { cart, removeFromCart, updateCartItem, isLoaded } = useCart();
    const { user, loginWithGoogle } = useAuth();
    const [availability, setAvailability] = useState({});
    const [verifying, setVerifying] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const verifyAndSyncCartItems = async () => {
            if (cart.length === 0) {
                setVerifying(false);
                return;
            }

            const statusMap = {};
            try {
                const checks = cart.map(item => getPainting(item.id));
                const results = await Promise.all(checks);

                results.forEach((freshItem, index) => {
                    const cartItem = cart[index];
                    if (freshItem) {
                        statusMap[freshItem.id] = freshItem.status;
                        // Sync latest data (price, title, images, etc.) from Firestore
                        if (
                            freshItem.price !== cartItem.price ||
                            freshItem.title !== cartItem.title ||
                            JSON.stringify(freshItem.images) !== JSON.stringify(cartItem.images) ||
                            freshItem.medium !== cartItem.medium ||
                            freshItem.size !== cartItem.size
                        ) {
                            updateCartItem(cartItem.id, {
                                price: freshItem.price,
                                title: freshItem.title,
                                images: freshItem.images,
                                medium: freshItem.medium,
                                size: freshItem.size,
                            });
                        }
                    } else {
                        statusMap[cartItem.id] = 'unavailable';
                    }
                });
                setAvailability(statusMap);
            } catch (err) {
                console.error("Cart verification failed:", err);
            } finally {
                setVerifying(false);
            }
        };

        if (isLoaded) {
            verifyAndSyncCartItems();
        }
    }, [isLoaded]);

    if (!isLoaded) return null;

    const soldItemsInCart = cart.filter(item => availability[item.id] === PAINTING_STATUS.SOLD || availability[item.id] === 'unavailable');
    const hasSoldItems = soldItemsInCart.length > 0;
    const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

    const handleCheckout = async () => {
        if (hasSoldItems) {
            alert("Some items in your cart are no longer available. Please remove them to continue.");
            return;
        }

        if (!user) {
            if (confirm("Please login with Google to continue.")) {
                try {
                    await loginWithGoogle();
                    // If login succeeds, proceed to checkout
                    router.push('/checkout');
                } catch (e) {
                    // If user cancels or error, stay here
                    return;
                }
            }
            return;
        }

        router.push('/checkout');
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-3xl font-serif text-gray-900 mb-4">Your cart is empty</h2>
                <p className="text-stone-500 mb-8 font-light">Looks like you haven't found a piece yet.</p>
                <Link
                    href="/gallery"
                    className="bg-gray-900 text-white px-8 py-3 text-xs uppercase tracking-[0.2em] hover:bg-gray-800"
                >
                    Browse Gallery
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-24 min-h-screen">
            <h1 className="text-4xl font-serif text-gray-900 mb-12 border-b border-gray-100 pb-6">Shopping Cart</h1>

            {hasSoldItems && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm">
                    <AlertCircle size={18} />
                    <span>Some items are sold out. Remove them to proceed.</span>
                </div>
            )}

            <div className="space-y-8">
                {cart.map((item) => {
                    const isSold = availability[item.id] === PAINTING_STATUS.SOLD || availability[item.id] === 'unavailable';

                    return (
                        <div key={item.id} className={`flex gap-6 md:gap-8 py-4 transition-opacity ${isSold ? 'opacity-60' : ''}`}>
                            <div className="relative w-24 md:w-32 aspect-[3/4] bg-stone-50 flex-shrink-0 shadow-sm overflow-hidden">
                                {item.images && item.images[0] && (
                                    <Image
                                        src={item.images[0]}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                                {isSold && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">SOLD OUT</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-serif text-gray-900 mb-1">{item.title}</h3>
                                        <p className="text-xs uppercase tracking-widest text-stone-500">{item.size} — {item.medium}</p>
                                        {isSold && (
                                            <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-widest">No longer available</p>
                                        )}
                                    </div>
                                    <p className={`text-lg font-sans font-medium ${isSold ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                        {formatPrice(item.price)}
                                    </p>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-lg flex items-center gap-2 transition-colors text-xs font-bold uppercase tracking-widest"
                                    >
                                        <Trash2 size={14} /> Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-16 flex flex-col items-end space-y-8 pt-8 border-t border-gray-100">
                <div className="text-right space-y-3 w-full md:w-1/2">
                    <div className="flex justify-between text-sm text-stone-500 uppercase tracking-widest">
                        <span>Subtotal</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                    {!hasSoldItems && <p className="text-xs text-stone-400">Shipping calculated at checkout.</p>}
                    <div className="flex justify-between text-2xl font-serif text-gray-900 pt-4 border-t border-gray-100">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={hasSoldItems || (verifying && cart.length > 0)}
                    className={`flex items-center justify-center gap-4 w-full md:w-auto md:min-w-[300px] py-4 px-8 text-xs uppercase tracking-[0.2em] transition-all shadow-lg font-bold ${hasSoldItems
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                        : (verifying && cart.length > 0)
                            ? 'bg-gray-800 text-white opacity-70 animate-pulse'
                            : 'bg-gray-900 text-white hover:bg-gray-800 hover:-translate-y-1 hover:shadow-xl'
                        }`}
                >
                    {verifying && cart.length > 0 ? 'Verifying Availability...' : (
                        <>
                            {user ? 'Proceed to Checkout' : 'Login to Checkout'} <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
