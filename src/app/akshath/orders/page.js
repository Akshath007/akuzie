'use client';

import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus, deleteOrder } from '@/lib/data';
import { formatPrice, ORDER_STATUS, cn } from '@/lib/utils';
import { ExternalLink, Calendar, User, Package, CreditCard, Trash2, X, MapPin } from 'lucide-react';

// Safe date formatter — handles Firestore Timestamp, ISO string, Date object, or missing
function formatDate(dateValue, options = {}) {
    if (!dateValue) return 'N/A';
    let date;
    if (dateValue?.seconds) {
        // Firestore Timestamp
        date = new Date(dateValue.seconds * 1000);
    } else if (dateValue?.toDate) {
        // Firestore Timestamp object with toDate method
        date = dateValue.toDate();
    } else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
        date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
        date = dateValue;
    } else {
        return 'N/A';
    }
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...options });
}

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        const data = await getOrders();
        // sort by date desc
        data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
        setOrders(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (id, status) => {
        // Optimistic update
        setOrders(orders.map(o => o.id === id ? { ...o, paymentStatus: status } : o));
        await updateOrderStatus(id, status);
        fetchOrders(); // Refresh to confirm
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this order? This cannot be undone.')) {
            await deleteOrder(id);
            if (selectedOrder?.id === id) setSelectedOrder(null);
            fetchOrders();
        }
    };

    if (loading) return (
        <div className="flex h-[50vh] items-center justify-center">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-gray-900">Orders</h1>
                <p className="text-gray-500">Track and manage customer orders.</p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50/50">
                                <th className="py-4 pl-6 font-medium">Order ID</th>
                                <th className="py-4 font-medium">Date</th>
                                <th className="py-4 font-medium">Customer</th>
                                <th className="py-4 font-medium">Items</th>
                                <th className="py-4 font-medium">Total</th>
                                <th className="py-4 font-medium">Status</th>
                                <th className="py-4 pr-6 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {orders.map((order) => (
                                <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                    <td className="py-4 pl-6 font-mono text-gray-500 text-xs">
                                        #{order.id.slice(-6)}
                                    </td>
                                    <td className="py-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400" />
                                            {formatDate(order.createdAt)}
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{order.customerName}</span>
                                            <span className="text-xs text-gray-400">{order.customerEmail}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col gap-1">
                                            {order.items?.map((item, idx) => (
                                                <span key={idx} className="text-xs text-gray-600 truncate max-w-[200px]" title={item.title}>
                                                    • {item.title}
                                                </span>
                                            ))}
                                            {(!order.items || order.items.length === 0) && <span className="text-gray-400 italic">No items</span>}
                                        </div>
                                    </td>
                                    <td className="py-4 font-medium text-gray-900">
                                        {formatPrice(order.totalAmount)}
                                    </td>
                                    <td className="py-4" onClick={e => e.stopPropagation()}>
                                        <select
                                            className={cn(
                                                "py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wide border-none focus:ring-2 focus:ring-violet-200 cursor-pointer transition-colors",
                                                order.paymentStatus === 'paid' ? "bg-emerald-100 text-emerald-600" :
                                                    order.paymentStatus === 'pending' ? "bg-amber-100 text-amber-600" :
                                                        "bg-gray-100 text-gray-600"
                                            )}
                                            value={order.paymentStatus}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        >
                                            {Object.values(ORDER_STATUS).map(status => (
                                                <option key={status} value={status}>{status.replace('_', ' ')}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-4 pr-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                                                className="p-2 text-gray-400 hover:text-violet-600 transition-colors"
                                                title="View Details"
                                            >
                                                <ExternalLink size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete Order"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-gray-400">
                                        No orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-8" onClick={e => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-serif text-gray-900">Order Details</h2>
                                <p className="text-gray-500 font-mono text-sm">ID: {selectedOrder.id}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                    <User size={14} /> Customer
                                </h3>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <p className="font-medium text-gray-900 text-lg">{selectedOrder.customerName}</p>
                                    <p>{selectedOrder.customerEmail}</p>
                                    <p>{selectedOrder.phone}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                    <MapPin size={14} /> Shipping Address
                                </h3>
                                <div className="space-y-1 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="whitespace-pre-wrap leading-relaxed">{selectedOrder.address || "No address provided"}</p>
                                    <p className="mt-2 text-gray-400 text-xs">Postal Code: {selectedOrder.pincode}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                <Package size={14} /> Items Ordered
                            </h3>
                            <div className="border border-gray-100 rounded-xl overflow-hidden">
                                {selectedOrder.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-white border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            {item.images && item.images[0] && (
                                                <img src={item.images[0]} alt={item.title} className="w-12 h-12 object-cover rounded-lg" />
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{item.title}</p>
                                                <p className="text-xs text-gray-500">{item.medium}</p>
                                            </div>
                                        </div>
                                        <p className="font-medium text-gray-900">{formatPrice(item.price)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Calendar size={16} />
                                <span className="text-sm">Placed on {formatDate(selectedOrder.createdAt, { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                                <p className="text-3xl font-serif text-violet-600">{formatPrice(selectedOrder.totalAmount)}</p>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                onClick={() => handleDelete(selectedOrder.id)}
                                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                            >
                                Delete Order
                            </button>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
