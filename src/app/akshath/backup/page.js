'use client';

import { useEffect, useState } from 'react';
import { getDeletedOrders, restoreOrder, safeToMillis } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { formatPrice, cn } from '@/lib/utils';
import { RotateCcw, Trash2, Calendar, User, Package, ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

// Safe date formatter
function formatDate(dateValue, options = {}) {
    if (!dateValue) return 'N/A';
    let date;
    if (dateValue?.seconds) {
        date = new Date(dateValue.seconds * 1000);
    } else if (typeof dateValue === 'number') {
        date = new Date(dateValue);
    } else {
        date = new Date(dateValue);
    }
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...options });
}

export default function BackupPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [deletedOrders, setDeletedOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Access Control
        if (!authLoading) {
            if (!user || user.email !== 'akshathhp123@gmail.com') {
                router.push('/akshath/dashboard');
                return;
            }
        }
    }, [user, authLoading, router]);

    const fetchDeletedOrders = async () => {
        const data = await getDeletedOrders();
        setDeletedOrders(data);
        setLoading(false);
    };

    useEffect(() => {
        if (user && user.email === 'akshathhp123@gmail.com') {
            fetchDeletedOrders();
        }
    }, [user]);

    const handleRestore = async (id) => {
        if (confirm('Restore this order to the active orders list?')) {
            await restoreOrder(id, user);
            fetchDeletedOrders();
        }
    };

    if (authLoading || (loading && user?.email === 'akshathhp123@gmail.com')) return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center gap-4">
                <Link href="/akshath/dashboard" className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-100">
                    <ArrowLeft size={20} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-3xl font-serif text-gray-900 flex items-center gap-3">
                        Order Backup <ShieldAlert size={24} className="text-amber-500" />
                    </h1>
                    <p className="text-gray-500">Restore accidentally deleted orders (Exclusive to Akshath).</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50/50">
                                <th className="py-4 pl-6 font-medium">Order ID</th>
                                <th className="py-4 font-medium">Deleted On</th>
                                <th className="py-4 font-medium">Customer</th>
                                <th className="py-4 font-medium">Amount</th>
                                <th className="py-4 font-medium">Deleted By</th>
                                <th className="py-4 pr-6 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {deletedOrders.map((order) => (
                                <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                                    <td className="py-4 pl-6 font-mono text-gray-500 text-xs">
                                        #{order.id.slice(-6)}
                                    </td>
                                    <td className="py-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400" />
                                            {formatDate(order.deletedAt, { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{order.customerName}</span>
                                            <span className="text-xs text-gray-400">{order.customerEmail}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 font-medium text-gray-900">
                                        {formatPrice(order.totalAmount)}
                                    </td>
                                    <td className="py-4 text-xs text-gray-500">
                                        {order.deletedBy}
                                    </td>
                                    <td className="py-4 pr-6 text-right">
                                        <button
                                            onClick={() => handleRestore(order.id)}
                                            className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ml-auto"
                                        >
                                            <RotateCcw size={14} /> Restore
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {deletedOrders.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center text-gray-400 italic">
                                        No deleted orders found. Your trash is empty.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4 items-start">
                <ShieldAlert className="text-amber-500 shrink-0" size={20} />
                <div className="text-xs text-amber-800 space-y-1">
                    <p className="font-bold uppercase tracking-wider">How Backup Works</p>
                    <p>When you "Delete" an order from the Orders page, it is moved here instead of being erased forever. You can restore it anytime. This section is only visible to you.</p>
                </div>
            </div>
        </div>
    );
}
