'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, where, Timestamp, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, Clock, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeToday: 0,
        onlineNow: 0
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // 1. Get Total Count (Accurate)
                const usersRef = collection(db, 'users');
                const countSnap = await getCountFromServer(usersRef);
                const totalUsersCount = countSnap.data().count;

                // 2. Fetch Recent Users (For table and active stats)
                // We limit to 100 as these are the most relevant for "Active" and "Online" checks
                const q = query(usersRef, orderBy('lastLoginAt', 'desc'), limit(100));
                const snapshot = await getDocs(q);

                const userData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    lastLoginAt: doc.data().lastLoginAt?.toDate(),
                    createdAt: doc.data().createdAt?.toDate()
                }));

                // 3. Calculate Stats based on the fetched top 100
                const now = new Date();
                const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);
                const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

                const activeTodayCount = userData.filter(u => u.lastLoginAt > twentyFourHoursAgo).length;
                const onlineCount = userData.filter(u => u.lastLoginAt > fifteenMinsAgo).length;

                setStats({
                    totalUsers: totalUsersCount,
                    activeToday: activeTodayCount,
                    onlineNow: onlineCount
                });

                // Display top 50 in the table
                setUsers(userData.slice(0, 50));

            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const formatDate = (date) => {
        if (!date) return 'Never';
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/akshath/dashboard" className="p-2 hover:bg-white rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-3xl font-serif text-gray-900">User Analytics</h1>
                    <p className="text-gray-500">Overview of user activity and growth.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<Users size={24} className="text-violet-600" />}
                    trend="Lifetime"
                />
                <StatCard
                    title="Active Today"
                    value={stats.activeToday}
                    icon={<Zap size={24} className="text-amber-500" />}
                    trend="Last 24h (Top 100)"
                />
                <StatCard
                    title="Online Now"
                    value={stats.onlineNow}
                    icon={<Clock size={24} className="text-green-500" />}
                    trend="~15 mins"
                />
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-serif text-xl text-gray-900">Recent Logins</h2>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Last 50 Active</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">User</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Email</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Last Seen</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => {
                                const isOnline = new Date() - user.lastLoginAt < 15 * 60 * 1000;
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs uppercase">
                                                    {user.displayName ? user.displayName[0] : user.email[0]}
                                                </div>
                                                <span className="font-medium text-gray-900">{user.displayName || 'Anonymous'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">{user.email}</td>
                                        <td className="p-4">
                                            {isOnline ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span> Online
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                                    Offline
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 font-mono">
                                            {formatDate(user.lastLoginAt)}
                                        </td>
                                        <td className="p-4 text-sm text-gray-400 font-mono">
                                            {formatDate(user.createdAt)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-serif text-gray-900">{value}</h3>
                </div>
                <p className="text-xs text-gray-300 mt-2 font-medium">{trend}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
                {icon}
            </div>
        </div>
    );
}
