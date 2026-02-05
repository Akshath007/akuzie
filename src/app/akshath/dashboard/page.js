'use client';

import { useEffect, useState } from 'react';
import { getPaintings, deletePainting, updatePainting } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, PAINTING_STATUS, cn } from '@/lib/utils';
import { Trash2, Edit, ExternalLink, Image as ImageIcon, TrendingUp, Users, ShoppingCart, Eye, ArrowUp, ArrowDown, Sparkles, Activity, Clock } from 'lucide-react';
import StatCard from '@/components/StatCard';
import GradientGraph from '@/components/GradientGraph';

// --- BENTO COMPONENTS ---

const WelcomeCard = ({ count }) => (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm col-span-1 md:col-span-2 relative overflow-hidden group">
        <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-600 text-xs font-medium mb-4">
                <Sparkles size={12} />
                <span>Pro Admin</span>
            </div>
            <h1 className="text-4xl font-serif text-gray-900 mb-2">
                Good Afternoon, <span className="italic text-violet-500">Akshath.</span>
            </h1>
            <p className="text-gray-500 max-w-md">
                Your gallery is live. You have <strong className="text-gray-900">{count} active paintings</strong> drawing attention today.
            </p>
            <div className="mt-8 flex gap-3">
                <Link href="/akshath/add" className="bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:scale-105 transition-transform shadow-lg shadow-gray-200">
                    + Create New
                </Link>
                <Link href="/" target="_blank" className="bg-white text-gray-900 border border-gray-200 px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                    View Gallery
                </Link>
            </div>
        </div>
        {/* Decorative Abstract Blobs */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-violet-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-violet-200/50 transition-colors duration-700"></div>
        <div className="absolute right-20 bottom-0 w-40 h-40 bg-cyan-100/50 rounded-full blur-3xl translate-y-1/2 group-hover:bg-cyan-200/50 transition-colors duration-700"></div>
    </div>
);

const ActivityFeed = () => (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-lg">Live Activity</h3>
            <div className="p-2 bg-green-50 rounded-full text-green-600 animate-pulse">
                <Activity size={16} />
            </div>
        </div>
        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {[
                { text: "Order #1240 confirmed", time: "2m ago", icon: "💰", color: "bg-emerald-100" },
                { text: "New visitor from London", time: "12m ago", icon: "🌍", color: "bg-blue-100" },
                { text: "'Cosmic Dance' viewed", time: "24m ago", icon: "👁️", color: "bg-violet-100" },
                { text: "System backup complete", time: "1h ago", icon: "⚙️", color: "bg-gray-100" },
                { text: "New inquiry received", time: "3h ago", icon: "📩", color: "bg-amber-100" },
            ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start group">
                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform", item.color)}>
                        {item.icon}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900 leading-tight">{item.text}</p>
                        <p className="text-[10px] text-gray-400 mt-1 font-medium">{item.time}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const QuickStat = ({ label, value, color }) => (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
        <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-widest text-gray-400 font-medium">{label}</span>
            <div className={cn("w-2 h-2 rounded-full group-hover:scale-150 transition-all", color)}></div>
        </div>
        <div className="mt-4">
            <div className="text-3xl font-serif text-gray-900 group-hover:translate-x-1 transition-transform">{value}</div>
            <div className="mt-2 h-10">
                <GradientGraph data={[10, 40, 30, 70, 50, 90, 80]} color={color.replace('bg-', '').replace('-500', '')} height={40} />
            </div>
        </div>
    </div>
);

// --- MAIN PAGE ---

export default function DashboardPage() {
    const [paintings, setPaintings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPaintings = async () => {
        const data = await getPaintings();
        setPaintings(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchPaintings();
    }, []);

    const handleDelete = async (id) => {
        if (confirm("Delete this masterpiece?")) {
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
        <div className="flex h-screen items-center justify-center bg-gray-50/50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-serif text-xl animate-pulse text-gray-400">Loading Studio...</p>
            </div>
        </div>
    );

    return (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* BENTO GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* 1. Welcome Hero (Spans 2 cols) */}
                <WelcomeCard count={paintings.length} />

                {/* 2. Activity Feed (Spans 1 col, 2 rows height ideally, but here fits in grid) */}
                <div className="row-span-2 hidden lg:block">
                    <ActivityFeed />
                </div>

                {/* 3. Main Revenue Card (Colorful Gradient) */}
                <StatCard
                    label="Total Revenue"
                    value={formatPrice(totalValue)}
                    subtext="+24% this month"
                    icon={TrendingUp}
                    variant="violet"
                />

                {/* 4. Quick Stats (Small Bento Cells) */}
                <QuickStat label="Views" value="2.4k" color="bg-blue-500" />
                <QuickStat label="Interest" value="142" color="bg-amber-500" />

                {/* 5. Mobile Activity Feed (Visible only on mobile/tablet) */}
                <div className="lg:hidden col-span-1 md:col-span-2">
                    <ActivityFeed />
                </div>

            </div>

            {/* INVENTORY SECTION */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-serif text-gray-900">Collection Inventory</h2>
                        <p className="text-gray-400 text-sm mt-1">Manage your artwork details and status.</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-full border border-gray-200 text-xs font-medium hover:bg-gray-50 transition-colors">Filter</button>
                        <button className="px-4 py-2 rounded-full border border-gray-200 text-xs font-medium hover:bg-gray-50 transition-colors">Export</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100">
                                <th className="pb-4 pl-4 font-medium">Artwork</th>
                                <th className="pb-4 font-medium">Status</th>
                                <th className="pb-4 font-medium">Price</th>
                                <th className="pb-4 pr-4 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {paintings.map((painting) => (
                                <tr key={painting.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                                    <td className="py-4 pl-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-gray-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                                {painting.images?.[0] ? (
                                                    <Image src={painting.images[0]} alt="" fill className="object-cover" />
                                                ) : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={16} /></div>}
                                            </div>
                                            <div>
                                                <p className="font-serif text-gray-900 font-medium">{painting.title}</p>
                                                <p className="text-xs text-gray-400">{painting.medium}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <button
                                            onClick={() => toggleStatus(painting)}
                                            className={cn(
                                                "px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all hover:scale-105",
                                                painting.status === PAINTING_STATUS.AVAILABLE
                                                    ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                            )}
                                        >
                                            {painting.status}
                                        </button>
                                    </td>
                                    <td className="py-4 font-medium text-gray-600 font-sans">
                                        {formatPrice(painting.price)}
                                    </td>
                                    <td className="py-4 pr-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                                            <Link href={`/akshath/edit/${painting.id}`} className="p-2 bg-white border border-gray-200 rounded-full hover:border-violet-300 hover:text-violet-600 transition-colors shadow-sm">
                                                <Edit size={14} />
                                            </Link>
                                            <button onClick={() => handleDelete(painting.id)} className="p-2 bg-white border border-gray-200 rounded-full hover:border-red-300 hover:text-red-500 transition-colors shadow-sm">
                                                <Trash2 size={14} />
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
    );
}
