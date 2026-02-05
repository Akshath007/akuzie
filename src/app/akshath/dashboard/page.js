'use client';

import { useEffect, useState } from 'react';
import { getPaintings, deletePainting, updatePainting } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, PAINTING_STATUS } from '@/lib/utils';
import { Trash2, Edit, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper for Stats
const StatCard = ({ label, value, subtext }) => (
    <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
        <h3 className="text-xs uppercase tracking-widest text-stone-400 mb-2">{label}</h3>
        <p className="text-3xl font-serif text-gray-900">{value}</p>
        {subtext && <p className="text-xs text-stone-400 mt-2">{subtext}</p>}
    </div>
);

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

    if (loading) return <div className="p-8 text-center text-stone-400">Loading Dashboard...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-serif text-gray-900">Akshath</h1>
                    <p className="text-stone-500 font-light mt-1">Overview of your collection.</p>
                </div>
                <Link
                    href="/akshath/add"
                    className="bg-gray-900 text-white px-6 py-3 rounded-lg text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-lg"
                >
                    + Add New
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Paintings" value={paintings.length} />
                <StatCard label="Total Value" value={formatPrice(totalValue)} subtext="Potential revenue" />
                <StatCard label="Sold Pieces" value={soldCount} subtext={`${Math.round((soldCount / (paintings.length || 1)) * 100)}% sell-through`} />
            </div>

            {/* Table / List */}
            <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-medium border-b border-stone-100">
                            <tr>
                                <th className="p-5 pl-6">Preview</th>
                                <th className="p-5">Details</th>
                                <th className="p-5">Price</th>
                                <th className="p-5">Status</th>
                                <th className="p-5 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            {paintings.map((painting) => (
                                <tr key={painting.id} className="hover:bg-stone-50/50 transition-colors group">
                                    <td className="p-5 pl-6">
                                        <div className="relative w-16 h-20 bg-stone-100 rounded overflow-hidden border border-stone-200">
                                            {painting.images && painting.images[0] ? (
                                                <Image
                                                    src={painting.images[0]}
                                                    alt={painting.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-stone-300"><ImageIcon size={16} /></div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <p className="font-serif text-base text-gray-900 mb-1">{painting.title}</p>
                                        <p className="text-xs text-stone-400">{painting.size} • {painting.medium}</p>
                                    </td>
                                    <td className="p-5 font-medium text-gray-600">
                                        {formatPrice(painting.price)}
                                    </td>
                                    <td className="p-5">
                                        <button
                                            onClick={() => toggleStatus(painting)}
                                            className={cn(
                                                "px-3 py-1 text-[10px] rounded-full uppercase tracking-widest font-medium border transition-all",
                                                painting.status === PAINTING_STATUS.AVAILABLE
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                                                    : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200"
                                            )}
                                        >
                                            {painting.status}
                                        </button>
                                    </td>
                                    <td className="p-5 text-right pr-6">
                                        <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/painting/${painting.id}`} target="_blank" className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-gray-900">
                                                <ExternalLink size={16} />
                                            </Link>
                                            <Link href={`/akshath/edit/${painting.id}`} className="p-2 hover:bg-blue-50 rounded-full text-stone-400 hover:text-blue-600">
                                                <Edit size={16} />
                                            </Link>
                                            <button onClick={() => handleDelete(painting.id)} className="p-2 hover:bg-red-50 rounded-full text-stone-400 hover:text-red-500">
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
    );
}
