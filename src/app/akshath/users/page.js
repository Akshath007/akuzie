'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUsers, updateUserStatus, deleteUser } from '@/lib/data';
import { User, ShieldAlert, Trash2, Ban, CheckCircle, Search, Mail, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function UserManagementPage() {
    const { user: adminUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        const data = await getUsers();
        setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        if (adminUser?.email === 'akshathhp123@gmail.com') {
            fetchUsers();
        }
    }, [adminUser]);

    const handleUpdateStatus = async (uid, currentStatus) => {
        const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
        const action = newStatus === 'blocked' ? 'block' : 'unblock';

        if (confirm(`Are you sure you want to ${action} this user?`)) {
            await updateUserStatus(uid, newStatus, adminUser);
            fetchUsers();
        }
    };

    const handleDeleteUser = async (uid) => {
        if (confirm('Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.')) {
            await deleteUser(uid, adminUser);
            fetchUsers();
        }
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (date) => {
        if (!date) return 'Never';
        return format(new Date(date), 'MMM dd, yyyy HH:mm');
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
                    <p className="text-gray-500">Manage registered collectors and community members.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 w-64 md:w-80 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 text-xs uppercase tracking-widest text-gray-400 font-bold">User</th>
                                <th className="p-4 text-xs uppercase tracking-widest text-gray-400 font-bold">Details</th>
                                <th className="p-4 text-xs uppercase tracking-widest text-gray-400 font-bold">Last Activity</th>
                                <th className="p-4 text-xs uppercase tracking-widest text-gray-400 font-bold">Status</th>
                                <th className="p-4 text-xs uppercase tracking-widest text-gray-400 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="p-8 bg-gray-50/50"></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shrink-0 bg-stone-100 flex items-center justify-center">
                                                    {u.photoURL ? (
                                                        <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={20} className="text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 truncate max-w-[150px]">{u.displayName || 'Anonymous'}</div>
                                                    <div className="text-xs text-gray-400 font-mono">{u.id.slice(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail size={14} className="text-gray-400" /> {u.email}
                                                </div>
                                                <div className="text-xs text-gray-400 flex items-center gap-2">
                                                    <Clock size={12} /> Joined: {formatDate(u.createdAt)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono text-xs text-gray-500">
                                            {formatDate(u.lastLoginAt)}
                                        </td>
                                        <td className="p-4">
                                            {u.status === 'blocked' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider">
                                                    <Ban size={12} /> Blocked
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider">
                                                    <CheckCircle size={12} /> Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleUpdateStatus(u.id, u.status)}
                                                    className={`p-2 rounded-lg transition-all ${u.status === 'blocked' ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600'}`}
                                                    title={u.status === 'blocked' ? 'Unblock User' : 'Block User'}
                                                >
                                                    {u.status === 'blocked' ? <CheckCircle size={18} /> : <Ban size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <User size={48} className="text-gray-200" />
                                            <p className="text-gray-400 font-serif italic text-lg">No users found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Safety Warning */}
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-amber-800 text-sm">
                <ShieldAlert className="shrink-0" size={20} />
                <p>
                    <strong>Admin Note:</strong> Blocking a user will instantly sign them out and prevent future logins. Deleting a user removes their Firestore profile but does <strong>not</strong> delete their Firebase Authentication record or their Past Orders (for bookkeeping).
                </p>
            </div>
        </div>
    );
}
