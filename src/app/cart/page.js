'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { Trash2, ArrowRight } from 'lucide-react';

export default function CartPage() {
    const { cart, removeFromCart, isLoaded } = useCart();

    if (!isLoaded) return null;

    const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-light text-gray-900 mb-4">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't found a painting yet.</p>
                <Link
                    href="/#gallery"
                    className="bg-gray-900 text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-gray-800"
                >
                    Browse Gallery
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-24">
            <h1 className="text-3xl font-light text-gray-900 mb-12">Shopping Cart</h1>

            <div className="space-y-8">
                {cart.map((item) => (
                    <div key={item.id} className="flex gap-6 py-6 border-b border-gray-100">
                        <div className="relative w-24 h-32 bg-gray-50 flex-shrink-0">
                            {item.images && item.images[0] && (
                                <Image
                                    src={item.images[0]}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-light text-gray-900">{item.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{item.size} / {item.medium}</p>
                                </div>
                                <p className="text-lg font-light text-gray-900">{formatPrice(item.price)}</p>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-xs text-gray-400 hover:text-red-500 uppercase tracking-wider flex items-center gap-1 transition-colors"
                                >
                                    <Trash2 size={14} /> Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 flex flex-col items-end space-y-6">
                <div className="text-right space-y-2">
                    <div className="flex justify-between w-64 text-sm text-gray-500">
                        <span>Subtotal</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between w-64 text-xl font-light text-gray-900 pt-4 border-t border-gray-100">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                </div>

                <Link
                    href="/checkout"
                    className="flex items-center justify-center gap-2 w-full md:w-64 bg-gray-900 text-white py-4 text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors"
                >
                    Proceed to Checkout <ArrowRight size={16} />
                </Link>
            </div>
        </div>
    );
}
