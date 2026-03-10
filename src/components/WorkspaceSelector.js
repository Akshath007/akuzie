'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, Loader2, AlertCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// PIN Entry Screen
function PinEntry({ workspaceId, config, onBack }) {
    const { enterWorkspace } = useWorkspace();
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [locked, setLocked] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const inputRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!pin.trim() || loading || locked) return;

        setLoading(true);
        setError(null);

        const result = await enterWorkspace(workspaceId, pin);

        if (result.success) {
            router.push('/akshath/dashboard');
        } else {
            setError(result.error);
            setLocked(result.locked || false);
            setPin('');
            inputRef.current?.focus();
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md">

                {/* Back button */}
                <button
                    onClick={onBack}
                    className="mb-8 text-xs uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                    ← Back to workspaces
                </button>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10">

                    {/* Workspace Icon */}
                    <div className={cn(
                        "w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-8 mx-auto shadow-lg",
                        `bg-gradient-to-br ${config.bgGradient}`
                    )}>
                        {config.icon}
                    </div>

                    <h1 className="text-2xl font-serif text-gray-900 text-center mb-2">
                        {config.label} Workspace
                    </h1>
                    <p className="text-sm text-gray-400 text-center mb-8">
                        Enter PIN to access this workspace
                    </p>

                    {/* Locked State */}
                    {locked ? (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                            <ShieldAlert size={32} className="text-red-500 mx-auto mb-3" />
                            <p className="text-red-600 font-medium text-sm">Too many failed attempts</p>
                            <p className="text-red-400 text-xs mt-2">Please try again in 15 minutes.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* PIN Input */}
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    ref={inputRef}
                                    type={showPin ? "text" : "password"}
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    placeholder="Enter workspace PIN"
                                    maxLength={20}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-12 py-4 text-center text-2xl tracking-[0.3em] font-mono text-gray-900 placeholder:text-gray-300 placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                                    disabled={loading}
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPin(!showPin)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                                    <AlertCircle size={16} className="flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={!pin.trim() || loading}
                                className={cn(
                                    "w-full py-4 rounded-xl text-white text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
                                    `bg-gradient-to-r ${config.bgGradient} hover:opacity-90 active:scale-[0.98]`,
                                    `shadow-${config.color}-200`
                                )}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Unlock Workspace
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-xs text-gray-300 text-center mt-6">
                    Session expires after 30 minutes of inactivity
                </p>
            </div>
        </div>
    );
}

// Workspace Selector (Main Page)
export default function WorkspaceSelector() {
    const { activeWorkspace, workspaces, loading: wsLoading } = useWorkspace();
    const { user, loading: authLoading } = useAuth();
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const router = useRouter();

    const isSuperAdmin = user?.email === 'akshathhp123@gmail.com';

    // If already authenticated or super admin, redirect to dashboard
    useEffect(() => {
        if (!wsLoading && !authLoading && (activeWorkspace || isSuperAdmin)) {
            router.push('/akshath/dashboard');
        }
    }, [activeWorkspace, isSuperAdmin, wsLoading, authLoading, router]);

    // Show loading state while determining auth/workspace
    if (wsLoading || authLoading || isSuperAdmin || activeWorkspace) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <Loader2 className="animate-spin text-gray-400" size={32} />
                <p className="text-sm text-gray-500 animate-pulse">Checking access...</p>
            </div>
        );
    }

    // Show PIN entry if a workspace is selected
    if (selectedWorkspace) {
        // Find the full config object to pass to PinEntry
        const config = workspaces.find(w => w.id === selectedWorkspace);
        if (config) {
            return <PinEntry workspaceId={selectedWorkspace} config={config} onBack={() => setSelectedWorkspace(null)} />;
        }
    }

    // Workspace Selector
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 lg:p-12">
            <div className="w-full max-w-4xl">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4 tracking-tight">Select Workspace</h1>
                    <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto">
                        Choose the portfolio you want to manage. Access requires a secure PIN.
                    </p>
                </div>

                {workspaces.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No Access</h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Your account ({user?.email}) is not authorized for any workspaces. Please contact the administrator to grant you access.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Workspace Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                            {workspaces.map((ws) => (
                                <button
                                    key={ws.id}
                                    onClick={() => setSelectedWorkspace(ws.id)}
                                    className="group relative bg-white rounded-3xl border border-gray-100 p-8 text-center hover:shadow-xl hover:border-gray-200 transition-all duration-500 hover:-translate-y-1 active:scale-[0.98] overflow-hidden flex flex-col h-full items-center justify-center"
                                >
                                    {/* Background glow on hover */}
                                    <div className={cn(
                                        "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl",
                                        `bg-gradient-to-br ${ws.bgGradient || 'from-gray-500 to-gray-700'}`
                                    )} />

                                    {/* Icon */}
                                    <div className={cn(
                                        "relative w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-500",
                                        `bg-gradient-to-br ${ws.bgGradient || 'from-gray-500 to-gray-700'}`
                                    )}>
                                        <span className="drop-shadow-sm">{ws.icon || '📂'}</span>
                                    </div>

                                    {/* Label */}
                                    <h2 className="relative text-2xl font-serif text-gray-900 mb-2">{ws.label}</h2>
                                    <p className="relative text-sm text-gray-500 mb-8 flex-grow">{ws.description}</p>

                                    {/* Enter Button */}
                                    <div className={cn(
                                        "relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.15em] text-white transition-all shadow-sm group-hover:shadow-md w-full justify-center mt-auto",
                                        `bg-gradient-to-r ${ws.bgGradient || 'from-gray-500 to-gray-700'}`
                                    )}>
                                        <Lock size={14} />
                                        <span>Enter Area</span>
                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform ml-1 opacity-80" />
                                    </div>
                                </button>
                            ))}
                        </div>

                        <p className="text-xs text-gray-400 text-center mt-12 flex items-center justify-center gap-2">
                            <Lock size={12} />
                            End-to-end PIN encryption required
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
