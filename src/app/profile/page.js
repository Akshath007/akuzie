'use client';

import { Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, LogOut, Mail, User, Loader2, Package, ChevronRight, Clock, CheckCircle2, AlertCircle, Heart, Calendar } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getUserOrders } from '@/lib/data';

function ProfileContent() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');

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
                <Loader2 size={32} className="animate-spin text-violet-500" />
            </div>
        );
    }

    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return { icon: CheckCircle2, color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', label: 'Paid' };
            case 'shipped':
                return { icon: Package, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', label: 'Shipped' };
            case 'delivered':
                return { icon: CheckCircle2, color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', label: 'Delivered' };
            case 'failed':
                return { icon: AlertCircle, color: 'red', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', label: 'Failed' };
            default:
                return { icon: Clock, color: 'amber', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', label: 'Pending' };
        }
    };

    const paidOrders = orders.filter(o => o.paymentStatus === 'paid' || o.paymentStatus === 'delivered' || o.paymentStatus === 'shipped');
    const totalSpent = paidOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-white to-rose-50/30">
            {/* Hero Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700" />
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-20 w-40 h-40 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-20 w-60 h-60 bg-white rounded-full blur-3xl" />
                </div>

                <div className="relative pt-32 pb-20 px-6">
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl shadow-black/20 transition-transform group-hover:scale-105">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-white/20 backdrop-blur flex items-center justify-center">
                                        <span className="text-4xl font-serif text-white">
                                            {user.displayName?.charAt(0)?.toUpperCase() || '?'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-400 rounded-xl border-3 border-white flex items-center justify-center shadow-lg">
                                <CheckCircle2 size={14} className="text-white" />
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl md:text-4xl font-serif text-white mb-1">
                                {user.displayName || 'Art Collector'}
                            </h1>
                            <p className="text-white/60 text-sm mb-5">{user.email}</p>

                            {/* Stats */}
                            <div className="flex items-center justify-center md:justify-start gap-6">
                                <div className="text-center md:text-left">
                                    <p className="text-2xl font-bold text-white">{orders.length}</p>
                                    <p className="text-white/50 text-xs uppercase tracking-widest">Orders</p>
                                </div>
                                <div className="w-px h-10 bg-white/20" />
                                <div className="text-center md:text-left">
                                    <p className="text-2xl font-bold text-white">{paidOrders.length}</p>
                                    <p className="text-white/50 text-xs uppercase tracking-widest">Artworks</p>
                                </div>
                                <div className="w-px h-10 bg-white/20" />
                                <div className="text-center md:text-left">
                                    <p className="text-2xl font-bold text-white">{formatPrice(totalSpent)}</p>
                                    <p className="text-white/50 text-xs uppercase tracking-widest">Invested</p>
                                </div>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="px-5 py-2.5 bg-white/10 backdrop-blur border border-white/20 text-white text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-white/20 transition-all flex items-center gap-2"
                        >
                            <LogOut size={14} />
                            Log Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 -mt-6">
                {/* Tab Switcher */}
                <div className="flex gap-2 mb-8 bg-white rounded-2xl p-1.5 shadow-lg shadow-gray-100/50 border border-gray-100 w-fit">
                    {[
                        { id: 'orders', label: 'My Orders', icon: ShoppingBag },
                        { id: 'support', label: 'Support', icon: Mail },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-[0.15em] transition-all ${activeTab === tab.id
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="pb-24">
                        {ordersLoading ? (
                            <div className="text-center py-20">
                                <Loader2 size={32} className="animate-spin text-violet-400 mx-auto mb-4" />
                                <p className="text-gray-400 text-sm">Loading your orders...</p>
                            </div>
                        ) : orders.length > 0 ? (
                            <div className="space-y-4">
                                {orders.map((order, index) => {
                                    const statusConfig = getStatusConfig(order.paymentStatus);
                                    const StatusIcon = statusConfig.icon;

                                    let items = [];
                                    try {
                                        items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                                    } catch (e) {
                                        items = [];
                                    }
                                    if (!Array.isArray(items)) items = [];

                                    const orderDate = order.createdAt
                                        ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                        : 'Recent';

                                    return (
                                        <Link
                                            key={order.id}
                                            href={`/orders/${order.id}`}
                                            className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100/50 hover:border-gray-200 transition-all duration-300 group overflow-hidden"
                                            style={{ animationDelay: `${index * 80}ms` }}
                                        >
                                            <div className="p-6">
                                                {/* Top row: Order ID, Date, Status */}
                                                <div className="flex items-center justify-between mb-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                                                            <Package size={18} className="text-violet-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">
                                                                #{order.id.slice(0, 8).toUpperCase()}
                                                            </p>
                                                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                                                                <Calendar size={11} />
                                                                {orderDate}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                                                            <StatusIcon size={12} />
                                                            {statusConfig.label}
                                                        </span>
                                                        <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                </div>

                                                {/* Items */}
                                                <div className="space-y-3 mb-5">
                                                    {items.slice(0, 3).map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-4">
                                                            {/* Thumbnail */}
                                                            <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                                                                {(item.images?.[0] || item.image) ? (
                                                                    <img
                                                                        src={item.images?.[0] || item.image}
                                                                        alt={item.title || item.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                        <Heart size={18} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                    {item.title || item.name}
                                                                </p>
                                                                {item.medium && (
                                                                    <p className="text-xs text-gray-400 mt-0.5">{item.medium}</p>
                                                                )}
                                                            </div>
                                                            <p className="text-sm font-bold text-gray-900 shrink-0">
                                                                {formatPrice(item.price)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                    {items.length > 3 && (
                                                        <p className="text-xs text-gray-400 pl-18">+{items.length - 3} more items</p>
                                                    )}
                                                </div>

                                                {/* Bottom: Total */}
                                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                                    <span className="text-xs text-gray-400 uppercase tracking-widest">Total</span>
                                                    <span className="text-lg font-bold text-gray-900">{formatPrice(order.totalAmount)}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <div className="w-20 h-20 bg-violet-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <ShoppingBag size={32} className="text-violet-400" />
                                </div>
                                <h3 className="text-xl font-serif text-gray-900 mb-2">No orders yet</h3>
                                <p className="text-gray-400 mb-8 text-sm">Your art collection journey starts here</p>
                                <Link
                                    href="/gallery"
                                    className="inline-block px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:scale-[1.02] transition-all"
                                >
                                    Explore Gallery
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Support Tab */}
                {activeTab === 'support' && (
                    <div className="pb-24">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
                            <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Mail size={28} className="text-violet-500" />
                            </div>
                            <h3 className="text-2xl font-serif text-gray-900 mb-3">How can we help?</h3>
                            <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                                Whether it&apos;s about an order, shipping, or just to say hello — we&apos;re here for you.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="mailto:akuzie27@gmail.com"
                                    className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:scale-[1.02] transition-all inline-flex items-center justify-center gap-2"
                                >
                                    <Mail size={16} />
                                    Email Us
                                </a>
                                <a
                                    href="tel:+918217262053"
                                    className="px-8 py-4 bg-white text-gray-900 border border-gray-200 text-sm font-bold uppercase tracking-[0.2em] rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all inline-flex items-center justify-center gap-2"
                                >
                                    📞 Call Us
                                </a>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-400">
                                <span>akuzie27@gmail.com</span>
                                <span className="hidden sm:inline">·</span>
                                <span>+91 82172 62053</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen pt-32 flex justify-center">
                <Loader2 size={32} className="animate-spin text-violet-500" />
            </div>
        }>
            <ProfileContent />
        </Suspense>
    );
}
