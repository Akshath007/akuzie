'use client';

import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus } from '@/lib/data';
import { formatPrice, ORDER_STATUS } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        const data = await getOrders();
        setOrders(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (id, status) => {
        await updateOrderStatus(id, status);
        fetchOrders();
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-light mb-8">Orders</h1>

            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white p-6 border border-gray-100 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-1">Order ID</h3>
                                <p className="font-mono text-sm">{order.id}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-400">{new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-50 pt-4">
                            <div>
                                <h4 className="text-xs uppercase tracking-wide text-gray-400 mb-2">Customer</h4>
                                <p className="text-sm font-medium">{order.customerName}</p>
                                <p className="text-sm text-gray-500">{order.phone}</p>
                                <p className="text-sm text-gray-500 mt-1">{order.address}</p>
                            </div>

                            <div>
                                <h4 className="text-xs uppercase tracking-wide text-gray-400 mb-2">Items</h4>
                                <div className="space-y-1">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="text-sm flex justify-between">
                                            <span>{item.title}</span>
                                            <span className="text-gray-500">{formatPrice(item.price)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between font-medium">
                                    <span>Total</span>
                                    <span>{formatPrice(order.totalAmount)}</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs uppercase tracking-wide text-gray-400 mb-2">Status</h4>
                                <select
                                    className="w-full p-2 text-sm border border-gray-200 rounded bg-gray-50"
                                    value={order.paymentStatus}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                >
                                    {Object.values(ORDER_STATUS).map(status => (
                                        <option key={status} value={status}>{status.replace('_', ' ').toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                ))}

                {orders.length === 0 && <div className="text-center text-gray-400 py-12">No orders found.</div>}
            </div>
        </div>
    );
}
