'use client';

import { Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, LogOut, Mail, User, Loader2, Package, ChevronRight, Clock, CheckCircle2, AlertCircle, Heart, Calendar, Phone } from 'lucide-react';
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
        if (user) fetchOrders();
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
                <Loader2 size={32} className="animate-spin text-gray-400" />
            </div>
        );
    }

    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return { icon: CheckCircle2, bg: '#ecfdf5', text: '#059669', label: 'Paid' };
            case 'shipped': return { icon: Package, bg: '#eff6ff', text: '#2563eb', label: 'Shipped' };
            case 'delivered': return { icon: CheckCircle2, bg: '#ecfdf5', text: '#059669', label: 'Delivered' };
            case 'failed': return { icon: AlertCircle, bg: '#fef2f2', text: '#dc2626', label: 'Failed' };
            default: return { icon: Clock, bg: '#fffbeb', text: '#d97706', label: 'Pending' };
        }
    };

    const paidOrders = orders.filter(o => ['paid', 'delivered', 'shipped'].includes(o.paymentStatus));
    const totalSpent = paidOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    return (
        <div style={{ minHeight: '100vh', background: '#fafafa' }}>
            {/* Profile Header */}
            <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #6d28d9 100%)', paddingTop: '120px', paddingBottom: '40px', paddingLeft: '24px', paddingRight: '24px' }}>
                <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                    {/* Avatar + Name row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                        <div style={{ width: '72px', height: '72px', borderRadius: '20px', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.3)', flexShrink: 0 }}>
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '28px', color: 'white', fontFamily: 'serif' }}>
                                        {user.displayName?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'white', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.displayName || 'Art Collector'}
                            </h1>
                            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.email}
                            </p>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: '0', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px 0', backdropFilter: 'blur(10px)' }}>
                        {[
                            { value: orders.length, label: 'Orders' },
                            { value: paidOrders.length, label: 'Artworks' },
                            { value: formatPrice(totalSpent), label: 'Invested' },
                        ].map((stat, i) => (
                            <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
                                <p style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: '0 0 2px 0' }}>{stat.value}</p>
                                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 16px' }}>
                {/* Tab Bar */}
                <div style={{ display: 'flex', gap: '8px', margin: '-20px 0 24px 0', position: 'relative', zIndex: 10 }}>
                    {[
                        { id: 'orders', label: 'My Orders', icon: ShoppingBag },
                        { id: 'support', label: 'Support', icon: Mail },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '12px 20px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                                fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em',
                                background: activeTab === tab.id ? '#111' : 'white',
                                color: activeTab === tab.id ? 'white' : '#999',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                transition: 'all 0.2s',
                            }}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}

                    {/* Logout button on the right */}
                    <button
                        onClick={handleLogout}
                        style={{
                            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '12px 16px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                            fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em',
                            background: 'white', color: '#ef4444',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        }}
                    >
                        <LogOut size={13} />
                        Logout
                    </button>
                </div>

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div style={{ paddingBottom: '80px' }}>
                        {ordersLoading ? (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <Loader2 size={28} className="animate-spin" style={{ color: '#a78bfa', margin: '0 auto 12px' }} />
                                <p style={{ color: '#aaa', fontSize: '13px' }}>Loading orders...</p>
                            </div>
                        ) : orders.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {orders.map((order) => {
                                    const sc = getStatusConfig(order.paymentStatus);
                                    const StatusIcon = sc.icon;

                                    let items = [];
                                    try { items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items; } catch { items = []; }
                                    if (!Array.isArray(items)) items = [];

                                    const orderDate = order.createdAt
                                        ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                        : 'Recent';

                                    return (
                                        <Link
                                            key={order.id}
                                            href={`/orders/${order.id}`}
                                            style={{ textDecoration: 'none', color: 'inherit', display: 'block', background: 'white', borderRadius: '20px', border: '1px solid #f0f0f0', overflow: 'hidden', transition: 'box-shadow 0.3s' }}
                                        >
                                            {/* Order header */}
                                            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f5f5f5' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <Package size={16} style={{ color: '#7c3aed' }} />
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#111', margin: 0 }}>
                                                            #{order.id.slice(0, 8).toUpperCase()}
                                                        </p>
                                                        <p style={{ fontSize: '11px', color: '#aaa', margin: '2px 0 0' }}>
                                                            {orderDate}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: sc.bg, color: sc.text }}>
                                                        <StatusIcon size={11} />
                                                        {sc.label}
                                                    </span>
                                                    <ChevronRight size={16} style={{ color: '#ccc' }} />
                                                </div>
                                            </div>

                                            {/* Items */}
                                            <div style={{ padding: '12px 20px' }}>
                                                {items.slice(0, 2).map((item, idx) => (
                                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 0' }}>
                                                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', background: '#f5f5f5', flexShrink: 0, border: '1px solid #eee' }}>
                                                            {(item.images?.[0] || item.image) ? (
                                                                <img src={item.images?.[0] || item.image} alt={item.title || item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <Heart size={16} style={{ color: '#ddd' }} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <p style={{ fontSize: '13px', fontWeight: '500', color: '#333', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {item.title || item.name}
                                                            </p>
                                                        </div>
                                                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#111', margin: 0, flexShrink: 0 }}>
                                                            {formatPrice(item.price)}
                                                        </p>
                                                    </div>
                                                ))}
                                                {items.length > 2 && (
                                                    <p style={{ fontSize: '11px', color: '#aaa', margin: '4px 0 0 56px' }}>+{items.length - 2} more</p>
                                                )}
                                            </div>

                                            {/* Total */}
                                            <div style={{ padding: '12px 20px', borderTop: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '10px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>Total</span>
                                                <span style={{ fontSize: '16px', fontWeight: '700', color: '#111' }}>{formatPrice(order.totalAmount)}</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '24px', border: '1px solid #f0f0f0' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                    <ShoppingBag size={28} style={{ color: '#a78bfa' }} />
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111', margin: '0 0 8px' }}>No orders yet</h3>
                                <p style={{ fontSize: '13px', color: '#999', margin: '0 0 24px' }}>Your art collection journey starts here</p>
                                <Link href="/gallery" style={{ display: 'inline-block', padding: '12px 28px', background: '#111', color: 'white', borderRadius: '14px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none' }}>
                                    Explore Gallery
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Support Tab */}
                {activeTab === 'support' && (
                    <div style={{ paddingBottom: '80px' }}>
                        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #f0f0f0', padding: '40px 24px', textAlign: 'center' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <Mail size={24} style={{ color: '#7c3aed' }} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111', margin: '0 0 8px' }}>How can we help?</h3>
                            <p style={{ fontSize: '13px', color: '#999', margin: '0 0 28px', lineHeight: '1.6' }}>
                                Questions about orders, shipping, or anything else — we&apos;re here for you.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
                                <a href="mailto:akuzie27@gmail.com" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: '#111', color: 'white', borderRadius: '14px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none' }}>
                                    <Mail size={15} /> Email Us
                                </a>
                                <a href="https://wa.me/918217262053" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: 'white', color: '#111', borderRadius: '14px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none', border: '1px solid #e5e5e5' }}>
                                    <Phone size={15} /> WhatsApp
                                </a>
                            </div>

                            <p style={{ fontSize: '12px', color: '#bbb', marginTop: '24px' }}>
                                akuzie27@gmail.com · +91 82172 62053
                            </p>
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
            <div style={{ minHeight: '100vh', paddingTop: '140px', display: 'flex', justifyContent: 'center' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: '#a78bfa' }} />
            </div>
        }>
            <ProfileContent />
        </Suspense>
    );
}
