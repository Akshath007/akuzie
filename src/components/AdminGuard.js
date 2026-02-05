'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, PlusCircle, ShoppingBag, LogOut } from 'lucide-react';

export default function AdminGuard({ children }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/akshath/login');
        }
    }, [user, loading, router]);

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!user) return null;

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-white border-r border-gray-200">
                <div className="p-6">
                    <h2 className="text-xl font-bold tracking-widest">AKUZIE</h2>
                    <p className="text-xs text-gray-400 mt-1">Akshath's Panel</p>
                </div>
                <nav className="px-4 space-y-2">
                    <Link href="/akshath/dashboard" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                        <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link href="/akshath/add" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                        <PlusCircle size={20} /> Add Painting
                    </Link>
                    <Link href="/akshath/orders" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                        <ShoppingBag size={20} /> Orders
                    </Link>
                    <button onClick={logout} className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-lg w-full text-left mt-8">
                        <LogOut size={20} /> Logout
                    </button>
                </nav>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
