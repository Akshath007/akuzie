'use client';

import { useEffect, useState } from 'react';
import { getPaintings, getOrders } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { formatPrice, PAINTING_STATUS, cn } from '@/lib/utils';
import { TrendingUp, ImageIcon, Package, ShoppingBag } from 'lucide-react';
import StatCard from '@/components/StatCard';

export default function DashboardPage() {
    const { user } = useAuth();
    const { activeWorkspace, workspaceConfig } = useWorkspace();
    const [paintings, setPaintings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!activeWorkspace || !workspaceConfig) return;

            setLoading(true);
            const [paintingsData, ordersData] = await Promise.all([
                getPaintings(workspaceConfig.category),
                getOrders(),
            ]);

            setPaintings(paintingsData);

            // Filter orders by workspace category
            const filteredOrders = ordersData.filter(order => {
                // Check if order belongs to this workspace
                if (order.workspace) return order.workspace === activeWorkspace;
                // Legacy orders: check item categories
                if (order.items?.length > 0) {
                    return order.items.some(item =>
                        (item.category || 'painting') === workspaceConfig.category
                    );
                }
                return false;
            });

            setOrders(filteredOrders);
            setLoading(false);
        }

        fetchData();
    }, [activeWorkspace, workspaceConfig]);

    // Computed Stats
    const totalValue = paintings
        .filter(p => p.status === PAINTING_STATUS.SOLD)
        .reduce((acc, p) => acc + (Number(p.price) || 0), 0);
    const totalProducts = paintings.length;
    const soldCount = paintings.filter(p => p.status === PAINTING_STATUS.SOLD).length;
    const ordersCount = orders.length;
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    const totalRevenue = paidOrders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-gray-50/50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-gray-900 flex items-center gap-3">
                        <span className="text-3xl">{workspaceConfig?.icon}</span>
                        {workspaceConfig?.label} Dashboard
                    </h1>
                    <p className="text-gray-500">Overview of your {workspaceConfig?.label?.toLowerCase()} workspace.</p>
                </div>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Revenue (Paid)"
                    value={formatPrice(totalRevenue)}
                    icon={TrendingUp}
                    variant="violet"
                />
                <StatCard
                    label="Total Products"
                    value={totalProducts}
                    icon={ImageIcon}
                    variant="blue"
                />
                <StatCard
                    label="Items Sold"
                    value={soldCount}
                    icon={Package}
                    variant="amber"
                />
                <StatCard
                    label="Total Orders"
                    value={ordersCount}
                    icon={ShoppingBag}
                    variant="violet"
                />
            </div>

            {/* Quick Summary */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Quick Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-gray-400 text-xs mb-1">Available</p>
                        <p className="text-gray-900 font-bold text-lg">{paintings.filter(p => p.status === PAINTING_STATUS.AVAILABLE).length}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-gray-400 text-xs mb-1">Sold Out</p>
                        <p className="text-gray-900 font-bold text-lg">{soldCount}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-gray-400 text-xs mb-1">Pending Orders</p>
                        <p className="text-gray-900 font-bold text-lg">{orders.filter(o => o.paymentStatus === 'payment_pending').length}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-gray-400 text-xs mb-1">Portfolio Value</p>
                        <p className="text-gray-900 font-bold text-lg">{formatPrice(paintings.reduce((acc, p) => acc + (Number(p.price) || 0), 0))}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center">
                <p className="text-gray-400 italic">Select "Inventory" or "Orders" from the sidebar to manage content.</p>
            </div>
        </div>
    );
}
