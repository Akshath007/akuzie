'use client';

import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, PlusCircle, ShoppingBag, LogOut, TrendingUp, ClipboardList, Gavel, Package, RotateCcw, Users, ArrowLeftRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminGuard({ children }) {
    const { user, loading, logout } = useAuth();
    const { activeWorkspace, workspaceConfig, switchWorkspace, loading: wsLoading } = useWorkspace();
    const router = useRouter();

    const isSuperAdmin = user?.email === 'akshathhp123@gmail.com';

    useEffect(() => {
        if (!loading && !user) {
            router.push('/akshath/login');
        }
    }, [user, loading, router]);

    // Redirect to workspace selector if no workspace is active
    useEffect(() => {
        if (!loading && !wsLoading && user && !isSuperAdmin && !activeWorkspace) {
            router.push('/akshath');
        }
    }, [user, loading, wsLoading, activeWorkspace, isSuperAdmin, router]);

    if (loading || wsLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!user) return null;
    if (!isSuperAdmin && !activeWorkspace) return null;

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6">
                    <h2 className="text-xl font-bold tracking-widest">AKUZIE</h2>
                    <p className="text-xs text-gray-400 mt-1">Akshath's Panel</p>

                    {/* Active Workspace Badge */}
                    {!isSuperAdmin && activeWorkspace && (
                        <div className={cn(
                            "mt-4 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2",
                            activeWorkspace === 'art'
                                ? "bg-violet-50 text-violet-600 border border-violet-100"
                                : "bg-amber-50 text-amber-600 border border-amber-100"
                        )}>
                            <span className="text-lg">{workspaceConfig?.icon}</span>
                            {workspaceConfig?.label} Workspace
                        </div>
                    )}
                </div>

                <nav className="px-4 space-y-2 flex-1">
                    <Link href="/akshath/dashboard" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link href="/akshath/inventory" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <Package size={20} /> Inventory
                    </Link>
                    {user?.email === 'akshathhp123@gmail.com' && (
                        <>
                            <Link href="/akshath/dashboard/analytics" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                <TrendingUp size={20} /> Analytics
                            </Link>
                            <Link href="/akshath/logs" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                <ClipboardList size={20} /> Activity Logs
                            </Link>
                            <Link href="/akshath/backup" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                <RotateCcw size={20} /> Order Backup
                            </Link>
                            <Link href="/akshath/users" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                <Users size={20} /> User Management
                            </Link>
                        </>
                    )}
                    <Link href="/akshath/auctions" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <Gavel size={20} /> Auctions
                    </Link>
                    <Link href="/akshath/orders" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <ShoppingBag size={20} /> Orders
                    </Link>
                    <Link href="/akshath/add" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <PlusCircle size={20} /> Add Product
                    </Link>
                </nav>

                {/* Bottom Actions */}
                <div className="px-4 pb-6 space-y-2 border-t border-gray-100 pt-4">
                    {!isSuperAdmin && (
                        <button
                            onClick={switchWorkspace}
                            className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-lg w-full text-left transition-colors text-sm"
                        >
                            <ArrowLeftRight size={18} /> Switch Workspace
                        </button>
                    )}
                    <button onClick={logout} className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-lg w-full text-left transition-colors">
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
