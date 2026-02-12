'use client';

import { Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, LogOut, Mail, User, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getUserOrders } from '@/lib/data';

function ProfileContent() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (user?.email) {
                try {
                    const userOrders = await getUserOrders(user.email, user.uid);
                    setOrders(userOrders);
                } catch (error) {
                    console.error("Error fetching orders:", error);
                } finally {
                    setOrdersLoading(false);
                }
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen pt-32 flex justify-center">
                <Loader2 size={32} className="animate-spin text-stone-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 max-w-4xl mx-auto">

            {/* Header: User Info */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-stone-100 border border-stone-200">
                    {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <User size={40} />
                        </div>
                    )}
                </div>
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-serif text-gray-900 mb-1">{user.displayName}</h1>
                    <p className="text-gray-500 mb-4">{user.email}</p>
                    <button
                        onClick={handleLogout}
                        className="text-xs uppercase tracking-widest text-red-500 hover:text-red-700 flex items-center justify-center md:justify-start gap-2 transition-colors"
                    >
                        <LogOut size={14} />
                        Log Out
                    </button>
                </div>
            </div>

            {/* Section 1: Order History */}
            <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <h2 className="text-xl font-serif text-gray-900 mb-6 flex items-center gap-2">
                    <ShoppingBag size={20} className="text-stone-400" />
                    Order History
                </h2>

                {ordersLoading ? (
                    <div className="text-center py-12 text-stone-400">Loading orders...</div>
                ) : orders.length > 0 ? (
                    <div className="bg-white border border-stone-100 rounded-lg divide-y divide-stone-100">
                        {orders.map((order) => (
                            <Link key={order.id} href={`/orders/${order.id}`} className="block p-6 hover:bg-stone-50 transition-colors group">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1 group-hover:text-gray-900 transition-colors">
                                            Order #{order.id.slice(0, 8).toUpperCase()} • {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                        <div className="flex gap-2">
                                            <span className={`text-xs px-2 py-1 rounded bg-stone-100 text-stone-600 uppercase tracking-wider`}>
                                                {order.paymentStatus || 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-xl font-medium text-gray-900">
                                        {formatPrice(order.totalAmount)}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {/* Handle both parsing string items and array items */}
                                    {(() => {
                                        let items = [];
                                        try {
                                            items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                                        } catch (e) {
                                            items = [];
                                        }
                                        return Array.isArray(items) ? items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm text-gray-600">
                                                <span>{item.title || item.name}</span>
                                                <span>{formatPrice(item.price)}</span>
                                            </div>
                                        )) : null;
                                    })()}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-stone-50 rounded-lg border border-stone-100">
                        <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 bg-gray-900 text-white text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors"
                        >
                            Browse Collection
                        </Link>
                    </div>
                )}
            </div>

            {/* Section 2: Contact Us */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <h2 className="text-xl font-serif text-gray-900 mb-6 flex items-center gap-2">
                    <Mail size={20} className="text-stone-400" />
                    Support
                </h2>
                <div className="bg-stone-50 p-8 rounded-lg border border-stone-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Need help with an order?</h3>
                        <p className="text-gray-600">Our support team is here to assist you with any questions.</p>
                    </div>
                    <a
                        href="mailto:akuzie27@gmail.com"
                        className="px-6 py-3 bg-white border border-stone-200 text-gray-900 text-sm uppercase tracking-widest hover:bg-stone-50 transition-colors whitespace-nowrap"
                    >
                        Contact Us
                    </a>
                </div>
            </div>

        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-32 flex justify-center"><Loader2 className="animate-spin" /></div>}>
            <ProfileContent />
        </Suspense>
    );
}
