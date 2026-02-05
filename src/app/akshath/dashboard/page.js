'use client';

import { useEffect, useState } from 'react';
import { getPaintings, deletePainting, updatePainting } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, PAINTING_STATUS, cn } from '@/lib/utils';
import { Trash2, Edit, ExternalLink, Image as ImageIcon, TrendingUp, Users, ShoppingCart, Eye, ArrowUp, ArrowDown } from 'lucide-react';

// --- COMPONENTS ---

import StatCard from '@/components/StatCard';

const ActivityItem = ({ title, time, type }) => (
    <div className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
        <div className={cn("w-2 h-2 rounded-full",
            type === 'sale' ? "bg-emerald-400" :
                type === 'view' ? "bg-blue-400" : "bg-gray-300"
        )}></div>
        <div className="flex-1">
            <p className="text-sm text-gray-700">{title}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{time}</p>
        </div>
    </div>
);

export default function DashboardPage() {
    const [paintings, setPaintings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock Analytics Data (Since we don't have a real backend for analytics yet)
    // In a real app, this would come from an API
    const analytics = {
        totalVisits: 1240,
        uniqueVisitors: 856,
        bounceRate: "42%",
        conversionRate: "2.4%",
        funnel: [
            { label: 'Visits', value: 1240, color: 'bg-blue-200' },
            { label: 'Viewed Product', value: 850, color: 'bg-blue-300' },
            { label: 'Added to Cart', value: 120, color: 'bg-blue-400' },
            { label: 'Purchased', value: 24, color: 'bg-emerald-400' },
        ]
    };

    const fetchPaintings = async () => {
        const data = await getPaintings();
        setPaintings(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchPaintings();
    }, []);

    const handleDelete = async (id) => {
        if (confirm("Are you sure? This action cannot be undone.")) {
            await deletePainting(id);
            fetchPaintings();
        }
    };

    const toggleStatus = async (painting) => {
        const newStatus = painting.status === PAINTING_STATUS.AVAILABLE
            ? PAINTING_STATUS.SOLD
            : PAINTING_STATUS.AVAILABLE;

        await updatePainting(painting.id, { status: newStatus });
        fetchPaintings();
    };

    // Computed Stats
    const totalValue = paintings.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
    const soldCount = paintings.filter(p => p.status === PAINTING_STATUS.SOLD).length;

    if (loading) return (
        <div className="flex h-[50vh] items-center justify-center text-gray-300">
            <div className="animate-pulse flex flex-col items-center gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                <span className="text-xs uppercase tracking-widest">Loading Dashboard...</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 font-light mt-1 text-sm">Welcome back, Akshath.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/"
                        target="_blank"
                        className="bg-white border border-gray-200 text-gray-600 px-6 py-3 rounded-lg text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
                    >
                        View Site
                    </Link>
                    <Link
                        href="/akshath/add"
                        className="bg-gray-900 text-white px-6 py-3 rounded-lg text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2"
                    >
                        + Add Painting
                    </Link>
                </div>
            </div>

            {/* 1. TOP SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Revenue"
                    value={formatPrice(totalValue)}
                    subtext="+12% from last month"
                    icon={TrendingUp}
                    trend="up"
                    variant="violet"
                />
                <StatCard
                    label="Active Paintings"
                    value={paintings.length}
                    subtext={`${soldCount} sold so far`}
                    icon={ImageIcon}
                    variant="blue"
                />
                <StatCard
                    label="Website Visits"
                    value="1.2k"
                    subtext="Last 30 days"
                    icon={Users}
                    trend="up"
                    variant="amber"
                />
                <StatCard
                    label="Interested Users"
                    value="24"
                    subtext="Carts & Inquiries"
                    icon={ShoppingCart}
                    trend="up"
                    variant="emerald"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 2. ANALYTICS & SENTIMENT (Left - 2 Cols) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Traffic Overview */}
                    <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-sm font-serif text-gray-900 text-lg">Traffic Overview</h3>
                            <select className="text-xs border-none bg-gray-50 rounded px-2 py-1 text-gray-500 focus:ring-0 cursor-pointer">
                                <option>Last 30 Days</option>
                                <option>Last 7 Days</option>
                            </select>
                        </div>

                        {/* Mock Chart Area */}
                        <div className="h-48 flex items-end gap-2 border-b border-gray-100 pb-2 px-2">
                            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                                <div key={i} className="flex-1 bg-gray-900/5 hover:bg-gray-900/10 rounded-t transition-all relative group" style={{ height: `${h}%` }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {h * 12} Views
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-wider mt-4">
                            <span>Oct 1</span>
                            <span>Oct 15</span>
                            <span>Oct 30</span>
                        </div>
                    </div>

                    {/* Funnel */}
                    <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-serif text-gray-900 text-lg mb-6">Conversion Funnel</h3>
                        <div className="space-y-4">
                            {analytics.funnel.map((step, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500">{step.label}</span>
                                        <span className="font-medium text-gray-900">{step.value}</span>
                                    </div>
                                    <div className="w-full bg-gray-50 rounded-full h-2 overflow-hidden">
                                        <div className={cn("h-full rounded-full", step.color)} style={{ width: `${(step.value / analytics.funnel[0].value) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. RIGHT SIDEBAR (Activity & Top Art) */}
                <div className="space-y-8">

                    {/* Recent Activity */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-serif text-gray-900 mb-4">Recent Activity</h3>
                        <div className="space-y-1">
                            <ActivityItem title="New order #1024 confirmed" time="2 min ago" type="sale" />
                            <ActivityItem title="'Silent Chaos' added to cart" time="15 min ago" type="view" />
                            <ActivityItem title="New visitor from Mumbai" time="1 hr ago" type="view" />
                            <ActivityItem title="Price updated for 'Ethereal'" time="3 hrs ago" type="edit" />
                        </div>
                        <button className="w-full mt-6 text-xs text-center text-gray-400 hover:text-gray-900">View All Log</button>
                    </div>

                    {/* Top Performing Art */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-serif text-gray-900 mb-4">Top Interest</h3>
                        <div className="space-y-4">
                            {paintings.slice(0, 3).map((p, i) => (
                                <div key={p.id} className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden relative">
                                        {p.images?.[0] && <Image src={p.images[0]} alt="" fill className="object-cover" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{p.title}</p>
                                        <p className="text-xs text-gray-400">{p.status}</p>
                                    </div>
                                    <div className="text-xs font-mono text-gray-500">
                                        {120 - (i * 20)} views
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. PAINTINGS MANAGEMENT TABLE */}
            <div className="pt-8">
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-xl font-serif text-gray-900">Inventory</h2>
                    <div className="text-xs text-gray-400 uppercase tracking-widest">{paintings.length} Total Items</div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 text-gray-400 uppercase tracking-wider text-[10px] font-medium border-b border-gray-100">
                                <tr>
                                    <th className="p-5 pl-6">Preview</th>
                                    <th className="p-5">Details</th>
                                    <th className="p-5">Price</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5 text-right pr-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paintings.map((painting) => (
                                    <tr key={painting.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-5 pl-6">
                                            <div className="relative w-12 h-16 bg-gray-100 rounded overflow-hidden shadow-sm">
                                                {painting.images && painting.images[0] ? (
                                                    <Image
                                                        src={painting.images[0]}
                                                        alt={painting.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-300"><ImageIcon size={14} /></div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <p className="font-serif text-base text-gray-900 mb-1">{painting.title}</p>
                                            <p className="text-xs text-gray-400">{painting.size} • {painting.medium}</p>
                                        </td>
                                        <td className="p-5 font-medium text-gray-600 font-sans">
                                            {formatPrice(painting.price)}
                                        </td>
                                        <td className="p-5">
                                            <button
                                                onClick={() => toggleStatus(painting)}
                                                className={cn(
                                                    "px-3 py-1 text-[10px] rounded-full uppercase tracking-widest font-medium border transition-all",
                                                    painting.status === PAINTING_STATUS.AVAILABLE
                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                                                        : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                                                )}
                                            >
                                                {painting.status}
                                            </button>
                                        </td>
                                        <td className="p-5 text-right pr-6">
                                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/painting/${painting.id}`} target="_blank" className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors">
                                                    <Eye size={16} />
                                                </Link>
                                                <Link href={`/akshath/edit/${painting.id}`} className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors">
                                                    <Edit size={16} />
                                                </Link>
                                                <button onClick={() => handleDelete(painting.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
