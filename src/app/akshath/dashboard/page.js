'use client';

import { useEffect, useState } from 'react';
import { getPaintings, getOrders } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { formatPrice, PAINTING_STATUS, cn } from '@/lib/utils';
import { TrendingUp, ImageIcon, Package, ShoppingBag, AlertCircle, Settings, ArrowRight } from 'lucide-react';
import StatCard from '@/components/StatCard';
import Link from 'next/link';

export default function DashboardPage() {
    const { user, isSuperAdmin } = useAuth();
    const { activeWorkspace, workspaceConfig, workspaces, loading: wsLoading } = useWorkspace();

    // For super admin: which workspace tab is selected. null = "All"
    const [selectedTab, setSelectedTab] = useState(null);

    const [paintings, setPaintings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!isSuperAdmin && !workspaceConfig) return;
            // Wait for workspaces to be fetched before rendering anything
            if (isSuperAdmin && wsLoading) return;


            setLoading(true);
            setError(null);

            try {
                // For super admin: filter by selected tab; else filter by workspace category
                let fetchCat;
                if (isSuperAdmin) {
                    if (selectedTab) {
                        const tabWs = workspaces.find(w => w.id === selectedTab);
                        fetchCat = tabWs?.category;
                    }
                } else {
                    fetchCat = workspaceConfig?.category;
                }

                const [paintingsData, ordersData] = await Promise.all([
                    getPaintings(fetchCat),
                    getOrders(),
                ]);

                setPaintings(paintingsData || []);

                let filteredOrders = ordersData || [];
                if (!isSuperAdmin && activeWorkspace) {
                    filteredOrders = filteredOrders.filter(order => {
                        if (order.workspace) return order.workspace === activeWorkspace;
                        if (order.items?.length > 0) {
                            return order.items.some(item =>
                                (item.category || 'painting') === workspaceConfig.category
                            );
                        }
                        return activeWorkspace === 'art';
                    });
                } else if (isSuperAdmin && selectedTab) {
                    const tabWs = workspaces.find(w => w.id === selectedTab);
                    filteredOrders = filteredOrders.filter(order => {
                        if (order.workspace) return order.workspace === selectedTab;
                        return order.items?.some(item => (item.category || '') === (tabWs?.category || ''));
                    });
                }

                setOrders(filteredOrders);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
                setError(err.message || 'Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeWorkspace, workspaceConfig, user, isSuperAdmin, selectedTab, workspaces, wsLoading]);


    const totalValue = paintings
        .filter(p => p.status === PAINTING_STATUS.SOLD)
        .reduce((acc, p) => acc + (Number(p.price) || 0), 0);
    const totalProducts = paintings.length;
    const soldCount = paintings.filter(p => p.status === PAINTING_STATUS.SOLD).length;
    const ordersCount = orders.length;
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    const totalRevenue = paidOrders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);

    // Per-workspace stats for the workspace cards (super admin only)
    const [wsStats, setWsStats] = useState({});
    useEffect(() => {
        if (!isSuperAdmin || workspaces.length === 0) return;
        const fetchWsStats = async () => {
            const stats = {};
            await Promise.all(workspaces.map(async (ws) => {
                try {
                    const items = await getPaintings(ws.category);
                    stats[ws.id] = { count: items?.length || 0 };
                } catch { stats[ws.id] = { count: 0 }; }
            }));
            setWsStats(stats);
        };
        fetchWsStats();
    }, [isSuperAdmin, workspaces]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-gray-50/50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex h-screen items-center justify-center bg-gray-50/50">
            <div className="flex flex-col items-center gap-4 text-center max-w-md">
                <AlertCircle size={48} className="text-red-400" />
                <p className="text-gray-600 text-sm">{error}</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs uppercase tracking-widest">
                    Retry
                </button>
            </div>
        </div>
    );

    const activeTabWs = selectedTab ? workspaces.find(w => w.id === selectedTab) : null;

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-gray-900 flex items-center gap-3">
                        {!isSuperAdmin && workspaceConfig && (
                            <span className="text-3xl">{workspaceConfig.icon}</span>
                        )}
                        {isSuperAdmin
                            ? (activeTabWs ? `${activeTabWs.icon} ${activeTabWs.label}` : 'Global')
                            : workspaceConfig?.label} Dashboard
                    </h1>
                    <p className="text-gray-500">
                        {isSuperAdmin
                            ? activeTabWs ? `Viewing ${activeTabWs.label} workspace` : 'Overview of all workspaces'
                            : `Overview of your ${workspaceConfig?.label?.toLowerCase()} workspace`}
                    </p>
                </div>
            </div>

            {/* Workspace Tab Bar — Super Admin Only */}
            {isSuperAdmin && workspaces.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setSelectedTab(null)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                            selectedTab === null
                                ? "bg-gray-900 text-white border-gray-900 shadow-md"
                                : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700"
                        )}
                    >
                        🌐 All Workspaces
                    </button>
                    {workspaces.map(ws => (
                        <button
                            key={ws.id}
                            onClick={() => setSelectedTab(ws.id)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-semibold border transition-all flex items-center gap-2",
                                selectedTab === ws.id
                                    ? `bg-gradient-to-r ${ws.bgGradient} text-white border-transparent shadow-md`
                                    : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700"
                            )}
                        >
                            {ws.icon} {ws.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Workspace Cards — Super Admin "All" view only */}
            {isSuperAdmin && !selectedTab && workspaces.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {workspaces.map(ws => (
                        <div key={ws.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Card Header with gradient */}
                            <div className={cn("p-6 text-white bg-gradient-to-r", ws.bgGradient)}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                                            {ws.icon}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">{ws.label}</h2>
                                            <p className="text-white/70 text-sm">{ws.category} Workspace</p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/akshath/workspaces"
                                        className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                                        title="Edit Workspace"
                                    >
                                        <Settings size={18} />
                                    </Link>
                                </div>
                            </div>
                            {/* Card Stats */}
                            <div className="p-6 grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Items</p>
                                    <p className="text-2xl font-bold text-gray-900">{wsStats[ws.id]?.count ?? '—'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Allowed Users</p>
                                    <p className="text-2xl font-bold text-gray-900">{ws.allowedEmails?.length ?? 0}</p>
                                </div>
                            </div>
                            {/* Card Actions */}
                            <div className="px-6 pb-6 flex gap-3">
                                <button
                                    onClick={() => setSelectedTab(ws.id)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 bg-gradient-to-r",
                                        ws.bgGradient
                                    )}
                                >
                                    View Stats <ArrowRight size={15} />
                                </button>
                                <Link
                                    href="/akshath/inventory"
                                    onClick={() => setSelectedTab(ws.id)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-all"
                                >
                                    <Package size={15} /> Inventory
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
