'use client';

import { useEffect, useState } from 'react';
import { getPaintings, deletePainting, updatePainting } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, PAINTING_STATUS, cn } from '@/lib/utils';
import { Trash2, Edit, TrendingUp, ImageIcon, Plus, Package, ShoppingBag, Users, ClipboardList } from 'lucide-react';
import StatCard from '@/components/StatCard';

export default function DashboardPage() {
    const { user } = useAuth();
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
                    <p className="text-gray-500">Overview of your gallery performance.</p>
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

            {/* Recent Activity or Empty State could go here, but for now just Stats as requested */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center">
                <p className="text-gray-400 italic">Select "Inventory" or "Orders" from the sidebar to manage content.</p>
            </div>
        </div>
    );
}
