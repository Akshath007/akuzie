'use client';

import { useEffect, useState } from 'react';
import { getPaintings, deletePainting, updatePainting } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, PAINTING_STATUS, cn } from '@/lib/utils';
import { Trash2, Edit, TrendingUp, ImageIcon, Plus, Package, ShoppingBag } from 'lucide-react';
import StatCard from '@/components/StatCard';

export default function DashboardPage() {
    const [paintings, setPaintings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, painting, crochet

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

    // Filter logic
    const filteredItems = paintings.filter(p => {
        if (filter === 'all') return true;
        // Handle legacy items without category as 'painting'
        const cat = p.category || 'painting';
        return cat === filter;
    });

    // Computed Stats
    const totalValue = paintings.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
    const soldCount = paintings.filter(p => p.status === PAINTING_STATUS.SOLD).length;

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
                    <h1 className="text-3xl font-serif text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500">Manage your gallery and orders.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/akshath/orders" className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 text-gray-900 rounded-full hover:bg-gray-50 transition-colors">
                        <ShoppingBag size={18} />
                        View Orders
                    </Link>
                    <Link href="/akshath/add" className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200">
                        <Plus size={18} />
                        Add New Painting
                    </Link>
                </div>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Total Revenue"
                    value={formatPrice(totalValue)}
                    icon={TrendingUp}
                    variant="violet"
                />
                <StatCard
                    label="Total Artworks"
                    value={paintings.length}
                    icon={ImageIcon}
                    variant="blue"
                />
                <StatCard
                    label="Paintings Sold"
                    value={soldCount}
                    icon={Package}
                    variant="amber"
                />
            </div>

            {/* INVENTORY SECTION */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-serif text-gray-900">Inventory</h2>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {['all', 'painting', 'crochet'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-all",
                                    filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                {f}
                            </button>
                        ))}
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
                            {filteredItems.map((painting) => (
                                <tr key={painting.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0 white-space-nowrap">
                                    <td className="py-4 pl-4 min-w-[200px]">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-gray-100 shadow-sm flex-shrink-0">
                                                {painting.images?.[0] ? (
                                                    <Image src={painting.images[0]} alt="" fill className="object-cover" />
                                                ) : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={16} /></div>}
                                            </div>
                                            <div>
                                                <p className="font-serif text-gray-900 font-medium truncate max-w-[150px]">{painting.title}</p>
                                                <p className="text-xs text-gray-400 truncate">{painting.category === 'crochet' ? 'Crochet' : painting.medium}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <button
                                            onClick={() => toggleStatus(painting)}
                                            className={cn(
                                                "px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all hover:scale-105 whitespace-nowrap",
                                                painting.status === PAINTING_STATUS.AVAILABLE
                                                    ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                            )}
                                        >
                                            {painting.status}
                                        </button>
                                    </td>
                                    <td className="py-4 font-medium text-gray-600 font-sans whitespace-nowrap">
                                        {formatPrice(painting.price)}
                                    </td>
                                    <td className="py-4 pr-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-2">
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
