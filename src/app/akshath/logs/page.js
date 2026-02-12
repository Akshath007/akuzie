'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { ClipboardList, User, Clock, Tag, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLogs() {
            const logsCol = collection(db, "admin_logs");
            const q = query(logsCol, orderBy("timestamp", "desc"), limit(100));
            const snapshot = await getDocs(q);
            const logData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Format timestamp
                timeDisplay: doc.data().timestamp?.toDate()
                    ? format(doc.data().timestamp.toDate(), 'PPP pp')
                    : 'Recent'
            }));
            setLogs(logData);
            setLoading(false);
        }
        fetchLogs();
    }, []);

    if (loading) return (
        <div className="flex h-[50vh] items-center justify-center">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const getActionColor = (action) => {
        if (action.includes('CREATE')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        if (action.includes('DELETE')) return 'bg-red-50 text-red-600 border-red-100';
        if (action.includes('UPDATE')) return 'bg-blue-50 text-blue-600 border-blue-100';
        return 'bg-gray-50 text-gray-600 border-gray-100';
    };

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif text-gray-900">Activity Logs</h1>
                    <p className="text-gray-500">History of all administrative actions.</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-violet-500">
                    <ClipboardList size={24} />
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-50">
                    {logs.map((log) => (
                        <div key={log.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getActionColor(log.action)}`}>
                                            {log.action.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-stone-400 flex items-center gap-1">
                                            <Clock size={12} /> {log.timeDisplay}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-900 flex items-center gap-2">
                                        <User size={14} className="text-gray-400" />
                                        <strong className="font-semibold">{log.adminName}</strong>
                                        <span className="text-gray-400">({log.adminEmail})</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-widest text-gray-300 font-bold mb-1">Target ID</p>
                                        <p className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">#{log.targetId?.slice(-8)}</p>
                                    </div>
                                    <div className="h-8 w-px bg-gray-100 mx-2 hidden md:block"></div>
                                    <Tag className="text-gray-200" size={20} />
                                </div>
                            </div>

                            {log.details && Object.keys(log.details).length > 0 && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Change Details</p>
                                    <pre className="text-[10px] text-gray-600 overflow-x-auto">
                                        {JSON.stringify(log.details, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ))}

                    {logs.length === 0 && (
                        <div className="py-20 text-center text-gray-400">
                            No logs found yet. Actions will appear here as they happen.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-center">
                <Link href="/akshath/dashboard" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );
}
