'use client';

import { useState, useRef, useEffect } from 'react';
import { useWorkspace, WORKSPACES } from '@/context/WorkspaceContext';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, Loader2, AlertCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// PIN Entry Screen
function PinEntry({ workspace, onBack }) {
    const { enterWorkspace } = useWorkspace();
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [locked, setLocked] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const inputRef = useRef(null);
    const router = useRouter();

    const config = WORKSPACES[workspace];

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!pin.trim() || loading || locked) return;

        setLoading(true);
        setError(null);

        const result = await enterWorkspace(workspace, pin);

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
    const { activeWorkspace, loading: wsLoading } = useWorkspace();
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const router = useRouter();

    // If already authenticated, redirect to dashboard
    useEffect(() => {
        if (activeWorkspace && !wsLoading) {
            router.push('/akshath/dashboard');
        }
    }, [activeWorkspace, wsLoading, router]);

    if (wsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    // Show PIN entry if a workspace is selected
    if (selectedWorkspace) {
        return <PinEntry workspace={selectedWorkspace} onBack={() => setSelectedWorkspace(null)} />;
    }

    // Workspace Selector
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-serif text-gray-900 mb-3">Workspaces</h1>
                    <p className="text-gray-400 text-sm">Select a workspace to manage</p>
                </div>

                {/* Workspace Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.values(WORKSPACES).map((ws) => (
                        <button
                            key={ws.id}
                            onClick={() => setSelectedWorkspace(ws.id)}
                            className="group relative bg-white rounded-3xl border border-gray-100 p-10 text-center hover:shadow-2xl hover:border-gray-200 transition-all duration-500 hover:-translate-y-1 active:scale-[0.98] overflow-hidden"
                        >
                            {/* Background glow on hover */}
                            <div className={cn(
                                "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl",
                                `bg-gradient-to-br ${ws.bgGradient}`
                            )} />

                            {/* Icon */}
                            <div className={cn(
                                "relative w-24 h-24 rounded-2xl flex items-center justify-center text-5xl mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-500",
                                `bg-gradient-to-br ${ws.bgGradient}`
                            )}>
                                {ws.icon}
                            </div>

                            {/* Label */}
                            <h2 className="relative text-2xl font-serif text-gray-900 mb-2">{ws.label}</h2>
                            <p className="relative text-sm text-gray-400 mb-6">{ws.description}</p>

                            {/* Enter Button */}
                            <div className={cn(
                                "relative inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-[0.15em] text-white transition-all shadow-md group-hover:shadow-lg",
                                `bg-gradient-to-r ${ws.bgGradient}`
                            )}>
                                <Lock size={14} />
                                Enter Workspace
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    ))}
                </div>

                <p className="text-xs text-gray-300 text-center mt-10">
                    Each workspace requires a separate PIN for access
                </p>
            </div>
        </div>
    );
}
