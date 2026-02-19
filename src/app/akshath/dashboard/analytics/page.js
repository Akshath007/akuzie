'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, where, Timestamp, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, Clock, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AnalyticsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeToday: 0,
        onlineNow: 0,
        totalRevenue: 0,
        ordersCount: 0
    });
    const [users, setUsers] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Access Control Check
        if (!authLoading) {
            if (!user || user.email !== 'akshathhp123@gmail.com') {
                router.push('/akshath/dashboard');
                return;
            }
        }
    }, [user, authLoading, router]);

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

                // --- 2. Revenue & Orders Data ---
                const ordersRef = collection(db, 'orders');
                const qOrders = query(ordersRef, where('paymentStatus', '==', 'paid'));
                const snapshotOrders = await getDocs(qOrders);

                let totalRevenue = 0;
                let ordersCount = 0;
                const customerSpend = {};
                const dailyRevenue = {};

                // Initialize last 7 days chart data
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateKey = d.toISOString().split('T')[0];
                    dailyRevenue[dateKey] = 0;
                }

                snapshotOrders.docs.forEach(doc => {
                    const data = doc.data();
                    const amount = Number(data.amount || data.totalAmount || data.paidAmount || 0);
                    const date = data.createdAt?.toDate() || data.timestamp?.toDate();

                    if (amount > 0) {
                        totalRevenue += amount;
                        ordersCount++;

                        // Top Customers
                        const email = data.customerEmail || data.email || 'Unknown';
                        if (!customerSpend[email]) customerSpend[email] = 0;
                        customerSpend[email] += amount;

                        // Daily Revenue
                        if (date) {
                            const dateKey = date.toISOString().split('T')[0];
                            if (dailyRevenue[dateKey] !== undefined) {
                                dailyRevenue[dateKey] += amount;
                            }
                        }
                    }
                });

                // Format Revenue Data
                const chartData = Object.keys(dailyRevenue).map(date => ({
                    name: new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
                    revenue: dailyRevenue[date]
                }));

                // Format Top Customers
                const sortedCustomers = Object.entries(customerSpend)
                    .map(([email, spend]) => ({ email, spend }))
                    .sort((a, b) => b.spend - a.spend)
                    .slice(0, 5);

                setStats({
                    totalUsers: totalUsersCount,
                    activeToday: activeTodayCount,
                    onlineNow: onlineCount,
                    totalRevenue,
                    ordersCount
                });

                setRevenueData(chartData);
                setTopCustomers(sortedCustomers);
                setUsers(userData.slice(0, 50));

            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    // Format currency
    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    const formatDate = (date) => {
        if (!date) return 'Never';
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    if (authLoading || (loading && user?.email === 'akshathhp123@gmail.com')) {
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats.totalRevenue)}
                    icon={<Zap size={24} className="text-violet-600" />}
                    trend={`${stats.ordersCount} Orders`}
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<Users size={24} className="text-blue-600" />}
                    trend="Lifetime"
                />
                <StatCard
                    title="Active Today"
                    value={stats.activeToday}
                    icon={<Clock size={24} className="text-amber-500" />}
                    trend="Last 24h"
                />
                <StatCard
                    title="Online Now"
                    value={stats.onlineNow}
                    icon={<div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>}
                    trend="Realtime"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h2 className="font-serif text-xl text-gray-900 mb-6">Revenue Trend <span className="text-gray-400 text-sm font-sans font-normal ml-2">(Last 7 Days)</span></h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(val) => [`₹${val}`, 'Revenue']}
                                />
                                <Bar dataKey="revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Customers */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h2 className="font-serif text-xl text-gray-900 mb-6">Top Spenders</h2>
                    <div className="space-y-6">
                        {topCustomers.length > 0 ? topCustomers.map((cust, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{cust.email.split('@')[0]}</p>
                                        <p className="text-[10px] text-gray-400">{cust.email}</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-gray-900">{formatCurrency(cust.spend)}</span>
                            </div>
                        )) : (
                            <p className="text-gray-400 text-sm text-center py-10">No sales data yet.</p>
                        )}
                    </div>
                </div>
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
