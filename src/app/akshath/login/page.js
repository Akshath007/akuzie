'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Input from '@/components/Input';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loginWithGoogle } = useAuth();
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            router.push('/akshath');
        } catch (err) {
            setError('Invalid credentials');
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError('');
        try {
            const result = await loginWithGoogle();
            const userEmail = result.user?.email;
            // Check if the Google account is an admin
            if (userEmail === 'akshathhp123@gmail.com') {
                router.push('/akshath');
            } else {
                setError('This Google account is not authorized for admin access.');
                setGoogleLoading(false);
            }
        } catch (err) {
            setError('Google sign-in failed. Please try again.');
            setGoogleLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-6 bg-stone-50">
            <div className="w-full max-w-sm bg-white p-10 rounded-xl shadow-sm border border-stone-100 space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl font-serif text-gray-900 mb-2">Akshath</h1>
                    <p className="text-xs text-stone-400">Please authenticate to continue.</p>
                </div>

                {error && <div className="bg-red-50 text-red-500 p-3 text-xs text-center rounded">{error}</div>}

                {/* Google Sign-In Button */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || loading}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-3.5 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {googleLoading ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    )}
                    Sign in with Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-[10px] uppercase tracking-widest text-gray-300">or</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-6">
                        <Input
                            label="Email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="akuzie27@gmail.com"
                        />
                        <Input
                            label="Password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        disabled={loading || googleLoading}
                        className="w-full bg-gray-900 text-white py-4 text-xs uppercase tracking-[0.2em] rounded hover:bg-gray-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading && <Loader2 className="animate-spin" size={16} />}
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
