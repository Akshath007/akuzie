'use client';

import { useEffect, useState } from 'react';
import { getPaintings, deletePainting, updatePainting } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, PAINTING_STATUS, cn } from '@/lib/utils';
import { Trash2, Edit, ImageIcon, Package, Plus, AlertCircle } from 'lucide-react';

export default function InventoryPage() {
    const { user, isSuperAdmin } = useAuth();
    const { activeWorkspace, workspaceConfig } = useWorkspace();
    const [paintings, setPaintings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

        const fetchPaintings = async () => {
        if (!isSuperAdmin && !workspaceConfig) return;

        setLoading(true);
        setError(null);

        try {
            // Fetch only items matching this workspace's category (or all if superadmin)
            const fetchCat = isSuperAdmin ? undefined : workspaceConfig.category;
            const data = await getPaintings(fetchCat);
            setPaintings(data || []);
        } catch (err) {
            console.error('Inventory fetch error:', err);
            setError(err.message || 'Failed to load inventory.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaintings();
    }, [activeWorkspace, workspaceConfig, isSuperAdmin]);

    const handleDelete = async (id) => {
        if (confirm("Delete this masterpiece?")) {
            await deletePainting(id, user);
            fetchPaintings();
        }
    };

    const toggleStatus = async (painting) => {
        const newStatus = painting.status === PAINTING_STATUS.AVAILABLE
            ? PAINTING_STATUS.SOLD
            : PAINTING_STATUS.AVAILABLE;
        await updatePainting(painting.id, { status: newStatus }, user);
        fetchPaintings();
    };

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
                <button onClick={fetchPaintings} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs uppercase tracking-widest">
                    Retry
                </button>
            </div>
        </div>
    );

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-serif text-gray-900 flex items-center gap-3">
                        {!isSuperAdmin && workspaceConfig && <span className="text-2xl">{workspaceConfig.icon}</span>}
                        {isSuperAdmin ? 'Global' : workspaceConfig?.label} Inventory
                    </h1>
                    <p className="text-gray-500">Manage {isSuperAdmin ? 'all your collections' : `your ${workspaceConfig?.label?.toLowerCase()} collection`}.</p>
                </div>

                <Link
                    href="/akshath/add"
                    className={cn(
                        "flex items-center gap-2 px-5 py-3 rounded-xl text-white text-xs font-bold uppercase tracking-wider shadow-lg transition-all hover:opacity-90 active:scale-95",
                        isSuperAdmin ? "bg-gray-900 hover:bg-gray-800" : `bg-gradient-to-r ${workspaceConfig?.bgGradient}`
                    )}
                >
                    <Plus size={16} /> Add {isSuperAdmin ? 'Item' : workspaceConfig?.label}
                </Link>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
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
                            {paintings.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="py-16 text-center text-gray-400 italic">
                                        No {isSuperAdmin ? '' : workspaceConfig?.label?.toLowerCase()} items yet. Add your first one!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
