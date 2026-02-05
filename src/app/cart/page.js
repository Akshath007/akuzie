'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const { cart, removeFromCart, isLoaded } = useCart();
    const { user, loginWithGoogle } = useAuth();
    const router = useRouter();

    if (!isLoaded) return null;

    const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

    const handleCheckout = async () => {
        if (!user) {
            if (confirm("Please login with Google to continue.")) {
                try {
                    await loginWithGoogle();
                    // Auth state change will be picked up, user stays on page, then can click again? 
                    // Better UX: Auto redirect? Simple for now:
                } catch (e) {
                    return;
                }
            } else {
                return;
            }
        } else {
            router.push('/checkout');
        }
    };

    // If user just logged in, we can auto redirect, but manual click is safer for "plan it" phase.

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

            <div className="space-y-8">
                {cart.map((item) => (
                    <div key={item.id} className="flex gap-6 md:gap-8 py-4">
                        <div className="relative w-24 md:w-32 aspect-[3/4] bg-stone-50 flex-shrink-0 shadow-sm">
                            {item.images && item.images[0] && (
                                <Image
                                    src={item.images[0]}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>

                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-serif text-gray-900 mb-1">{item.title}</h3>
                                    <p className="text-xs uppercase tracking-widest text-stone-500">{item.size} — {item.medium}</p>
                                </div>
                                <p className="text-lg font-sans font-medium text-gray-900">{formatPrice(item.price)}</p>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-red-500 flex items-center gap-2 transition-colors"
                                >
                                    <Trash2 size={14} /> Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-16 flex flex-col items-end space-y-8 pt-8 border-t border-gray-100">
                <div className="text-right space-y-3 w-full md:w-1/2">
                    <div className="flex justify-between text-sm text-stone-500 uppercase tracking-widest">
                        <span>Subtotal</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                    <p className="text-xs text-stone-400">Shipping calculated at checkout.</p>
                    <div className="flex justify-between text-2xl font-serif text-gray-900 pt-4 border-t border-gray-100">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                </div>

                {user ? (
                    <button
                        onClick={handleCheckout}
                        className="flex items-center justify-center gap-4 w-full md:w-auto md:min-w-[300px] bg-gray-900 text-white py-4 px-8 text-xs uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                        Proceed to Checkout <ArrowRight size={16} />
                    </button>
                ) : (
                    <div className="w-full md:w-auto flex flex-col items-end gap-3">
                        <button
                            onClick={handleCheckout}
                            className="flex items-center justify-center gap-4 w-full md:w-auto md:min-w-[300px] bg-stone-900 text-white py-4 px-8 text-xs uppercase tracking-[0.2em] hover:bg-stone-800 transition-colors shadow-lg"
                        >
                            Login to Checkout
                        </button>
                        <p className="text-xs text-stone-400">Secure logic via Google</p>
                    </div>
                )}
            </div>
        </div>
    );
}
