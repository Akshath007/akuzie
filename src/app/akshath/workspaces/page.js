'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';
import { auth } from '@/lib/firebase';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield, Key, Users2, Loader2, Plus, Edit, Trash2, Mail, LayoutGrid, Tag, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import WorkspaceFormModal from './WorkspaceFormModal';

export default function WorkspaceSettingsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { workspaces, refreshWorkspaces } = useWorkspace();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWorkspace, setEditingWorkspace] = useState(null);

    const isSuperAdmin = user?.email === 'akshathhp123@gmail.com';

    // Redirect non-super admins
    if (!isSuperAdmin) {
        router.push('/akshath/dashboard');
        return null;
    }

    const handleCreateNew = () => {
        setEditingWorkspace(null);
        setIsModalOpen(true);
    };

    const handleEdit = (ws) => {
        setEditingWorkspace(ws);
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-serif text-gray-900 flex items-center gap-3">
                        <Shield size={28} className="text-violet-500" />
                        Workspace Settings
                    </h1>
                    <p className="text-gray-500 mt-1">Manage workspaces, access control, and PINs.</p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <Plus size={18} />
                    New Workspace
                </button>
            </div>

            {/* Info Banner */}
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <Users2 size={24} className="text-violet-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-violet-900 text-sm">Dynamic Workspaces</h3>
                        <p className="text-violet-600 text-sm mt-1 leading-relaxed">
                            Create tailored workspaces for different sellers or categories.
                            Add their <strong>Google email address</strong> to the allowed list, and only they will be
                            able to see that specific workspace when logging in.
                        </p>
                    </div>
                </div>
            </div>

            {/* Workspace Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workspaces.map((ws) => (
                    <WorkspaceAdminCard
                        key={ws.id}
                        workspace={ws}
                        onEdit={() => handleEdit(ws)}
                        onRefresh={refreshWorkspaces}
                    />
                ))}
            </div>

            {/* Create/Edit Modal */}
            <WorkspaceFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                workspaceToEdit={editingWorkspace}
                onSuccess={refreshWorkspaces}
            />
        </div>
    );
}

function WorkspaceAdminCard({ workspace, onEdit, onRefresh }) {
    const [newPin, setNewPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [loadingPin, setLoadingPin] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [status, setStatus] = useState({ type: null, msg: '' });

    const handleUpdatePin = async (e) => {
        e.preventDefault();
        setStatus({ type: null, msg: '' });

        if (newPin.length < 4) {
            setStatus({ type: 'error', msg: 'PIN must be at least 4 characters.' });
            return;
        }

        setLoadingPin(true);

        try {
            const idToken = await auth.currentUser.getIdToken();
            const res = await fetch('/api/workspace/verify', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    workspace: workspace.id,
                    newPin: newPin,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setStatus({ type: 'success', msg: 'PIN updated.' });
            setNewPin('');
        } catch (err) {
            setStatus({ type: 'error', msg: err.message || 'Error updating PIN' });
        } finally {
            setLoadingPin(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you absolutely sure you want to delete the "${workspace.label}" workspace? This will NOT delete the products, but users will lose access.`)) return;

        setLoadingDelete(true);
        try {
            const idToken = await auth.currentUser.getIdToken();
            const res = await fetch('/api/workspaces', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({ docId: workspace.id }),
            });

            if (!res.ok) throw new Error('Failed to delete workspace');

            onRefresh();
        } catch (err) {
            alert(err.message);
            setLoadingDelete(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            {/* Card Header (Visual Identity) */}
            <div className={cn(
                "p-6 text-white relative",
                `bg-gradient-to-r ${workspace.bgGradient || 'from-gray-500 to-gray-700'}`
            )}>
                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={onEdit} className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors" title="Edit Workspace Details">
                        <Edit size={16} />
                    </button>
                    <button onClick={handleDelete} disabled={loadingDelete} className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-50 backdrop-blur-sm rounded-lg transition-colors" title="Delete Workspace">
                        {loadingDelete ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm shadow-inner rounded-2xl flex items-center justify-center text-3xl">
                        {workspace.icon || '📂'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{workspace.label}</h2>
                        <span className="text-white/80 text-xs font-mono bg-black/20 px-2 py-0.5 rounded mt-1 inline-block">ID: {workspace.id}</span>
                    </div>
                </div>
            </div>

            {/* Quick Details */}
            <div className="p-5 border-b border-gray-50 space-y-3 flex-grow">
                <div className="flex gap-2">
                    <Tag size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Category</p>
                        <p className="text-sm font-medium">{workspace.category}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Mail size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Allowed Emails</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                            {workspace.allowedEmails?.length > 0 ? (
                                workspace.allowedEmails.map(email => (
                                    <span key={email} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{email}</span>
                                ))
                            ) : (
                                <span className="text-xs text-orange-500 italic">Super Admin Only</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* PIN Change Inline */}
            <div className="p-5 bg-gray-50 mt-auto">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                    <Key size={14} /> Quick PIN Update
                </p>
                <form onSubmit={handleUpdatePin} className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type={showPin ? "text" : "password"}
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value)}
                            placeholder="New PIN"
                            className="w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-all font-mono"
                            minLength={4}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPin(!showPin)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={!newPin || loadingPin}
                        className="bg-gray-900 text-white px-4 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {loadingPin ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                    </button>
                </form>

                {status.msg && (
                    <div className={cn("mt-3 text-xs flex items-center gap-1.5", status.type === 'error' ? "text-red-500" : "text-emerald-600")}>
                        {status.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                        {status.msg}
                    </div>
                )}
            </div>
        </div>
    );
}
