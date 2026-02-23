'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { WORKSPACES } from '@/context/WorkspaceContext';
import { auth } from '@/lib/firebase';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield, Key, Users2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WorkspaceSettingsPage() {
    const { user } = useAuth();
    const router = useRouter();

    const isSuperAdmin = user?.email === 'akshathhp123@gmail.com';

    // Redirect non-super admins
    if (!isSuperAdmin) {
        router.push('/akshath/dashboard');
        return null;
    }

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-serif text-gray-900 flex items-center gap-3">
                    <Shield size={28} className="text-violet-500" />
                    Workspace Settings
                </h1>
                <p className="text-gray-500 mt-1">Manage workspace PINs and access for <strong>akuzie27@gmail.com</strong>.</p>
            </div>

            {/* Info Banner */}
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <Users2 size={24} className="text-violet-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-violet-900 text-sm">How Workspaces Work</h3>
                        <p className="text-violet-600 text-sm mt-1 leading-relaxed">
                            When <strong>akuzie27@gmail.com</strong> logs in, they must select a workspace (Art or Crochet) and enter its PIN.
                            Each workspace has its own PIN and shows only the data relevant to that category.
                            Changing a PIN will immediately revoke all active sessions for that workspace.
                        </p>
                    </div>
                </div>
            </div>

            {/* Workspace PIN Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.values(WORKSPACES).map((ws) => (
                    <WorkspacePinCard key={ws.id} workspace={ws} />
                ))}
            </div>
        </div>
    );
}

function WorkspacePinCard({ workspace }) {
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    const handleChangePin = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (newPin.length < 4) {
            setError('PIN must be at least 4 characters.');
            return;
        }

        if (newPin !== confirmPin) {
            setError('PINs do not match.');
            return;
        }

        setLoading(true);

        try {
            // Get current user's Firebase ID token
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

            if (!res.ok) {
                setError(data.error || 'Failed to update PIN.');
            } else {
                setSuccess(data.message || 'PIN updated successfully!');
                setNewPin('');
                setConfirmPin('');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className={cn(
                "p-6 text-white",
                `bg-gradient-to-r ${workspace.bgGradient}`
            )}>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
                        {workspace.icon}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{workspace.label} Workspace</h2>
                        <p className="text-white/80 text-sm">{workspace.description}</p>
                    </div>
                </div>
            </div>

            {/* PIN Change Form */}
            <form onSubmit={handleChangePin} className="p-6 space-y-5">
                <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-widest font-bold">
                    <Key size={14} />
                    Change PIN
                </div>

                {/* New PIN */}
                <div className="relative">
                    <label className="block text-xs text-gray-500 mb-1.5 font-medium">New PIN</label>
                    <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                            <Lock size={16} />
                        </div>
                        <input
                            type={showPin ? "text" : "password"}
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value)}
                            placeholder="Enter new PIN"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all font-mono tracking-widest"
                            minLength={4}
                            maxLength={20}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPin(!showPin)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {/* Confirm PIN */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1.5 font-medium">Confirm PIN</label>
                    <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                            <Lock size={16} />
                        </div>
                        <input
                            type={showPin ? "text" : "password"}
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value)}
                            placeholder="Re-enter new PIN"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all font-mono tracking-widest"
                            minLength={4}
                            maxLength={20}
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                        <AlertCircle size={16} className="flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Success */}
                {success && (
                    <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100">
                        <CheckCircle size={16} className="flex-shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!newPin || !confirmPin || loading}
                    className={cn(
                        "w-full py-3.5 rounded-xl text-white text-xs font-bold uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]",
                        `bg-gradient-to-r ${workspace.bgGradient}`
                    )}
                >
                    {loading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Updating...
                        </>
                    ) : (
                        <>
                            <Key size={14} />
                            Update {workspace.label} PIN
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
