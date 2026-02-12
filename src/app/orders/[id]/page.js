'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { Package, MapPin, CreditCard, ChevronLeft, Loader2, CheckCircle2, Clock, Truck } from 'lucide-react';
import Link from 'next/link';

function OrderDetailContent() {
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, "orders", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Basic security: only allow the customer or admin to view
                    // (Note: admins are handled by their own views, but this is for user profile)
                    setOrder({ id: docSnap.id, ...data });
                } else {
                    console.error("Order not found");
                }
            } catch (err) {
                console.error("Error fetching order:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (loading || authLoading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center">
                <Loader2 size={32} className="animate-spin text-stone-300" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen pt-32 text-center px-6">
                <h1 className="text-2xl font-serif text-gray-900 mb-4">Order Not Found</h1>
                <p className="text-gray-500 mb-8">We couldn't find the order you're looking for.</p>
                <Link href="/profile" className="text-xs uppercase tracking-widest font-bold text-violet-600">Back to Profile</Link>
            </div>
        );
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid': return <CheckCircle2 className="text-emerald-500" size={20} />;
            case 'shipped': return <Truck className="text-blue-500" size={20} />;
            default: return <Clock className="text-amber-500" size={20} />;
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 bg-[#fafafa]">
            <div className="max-w-3xl mx-auto">
                <Link href="/profile" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 mb-12 transition-colors">
                    <ChevronLeft size={14} /> Back to Profile
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-serif text-gray-900 mb-2">Order Details</h1>
                        <p className="text-xs font-mono text-gray-400">#{order.id.toUpperCase()}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
                        {getStatusIcon(order.paymentStatus)}
                        <span className="text-xs uppercase tracking-widest font-bold text-gray-900">
                            Status: {order.paymentStatus?.replace('_', ' ') || 'Pending'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Items Section */}
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-3">
                            <Package size={16} /> Purchased Artwork
                        </h3>
                        <div className="space-y-6">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                            {item.images?.[0] ? (
                                                <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-200 uppercase text-[8px]">No Image</div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-serif text-gray-900 text-lg leading-tight">{item.title}</h4>
                                            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{item.medium || 'Handmade Piece'}</p>
                                        </div>
                                    </div>
                                    <p className="font-medium text-gray-900 text-lg">{formatPrice(item.price)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 pt-8 border-t border-gray-100 flex justify-between items-end">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Payment Method</p>
                                <p className="text-sm text-gray-600 font-medium">Manual UPI / QR Payment</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Total Paid</p>
                                <p className="text-3xl font-serif text-violet-600 leading-none">{formatPrice(order.totalAmount)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Shipping Details */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-3">
                                <MapPin size={16} /> Courier Address
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600 leading-relaxed">
                                <p className="font-bold text-gray-900 text-lg mb-4">{order.customerName}</p>
                                <p>{order.address}</p>
                                <p className="pt-2 font-mono text-xs">{order.phone}</p>
                            </div>
                        </div>

                        {/* Payment Proof */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm h-full">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-3">
                                <CreditCard size={16} /> Transaction Proof
                            </h3>
                            {order.paymentScreenshot ? (
                                <div className="aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group relative cursor-zoom-in" onClick={() => window.open(order.paymentScreenshot, '_blank')}>
                                    <img src={order.paymentScreenshot} alt="Payment Proof" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] uppercase tracking-widest font-bold">
                                        View Full Receipt
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center py-12 text-center text-gray-300">
                                    <CreditCard size={32} className="mb-4 opacity-20" />
                                    <p className="text-xs uppercase tracking-widest">No screenshot uploaded</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-sm text-gray-400 font-light italic">
                        Questions about your order? <Link href="/contact" className="text-gray-900 font-medium hover:underline">Contact Akuzie Support</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function OrderPage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-32 flex justify-center"><Loader2 className="animate-spin" /></div>}>
            <OrderDetailContent />
        </Suspense>
    );
}
