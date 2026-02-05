'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Input from '@/components/Input';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            router.push('/admin/dashboard');
        } catch (err) {
            setError('Invalid credentials');
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-6 bg-stone-50">
            <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-10 rounded-xl shadow-sm border border-stone-100 space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl font-serif text-gray-900 mb-2">Akshath</h1>
                    <p className="text-xs text-stone-400">Please authenticate to continue.</p>
                </div>

                {error && <div className="bg-red-50 text-red-500 p-3 text-xs text-center rounded">{error}</div>}

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
                    disabled={loading}
                    className="w-full bg-gray-900 text-white py-4 text-xs uppercase tracking-[0.2em] rounded hover:bg-gray-800 transition-colors flex justify-center items-center gap-2"
                >
                    {loading && <Loader2 className="animate-spin" size={16} />}
                    Sign In
                </button>
            </form>
        </div>
    );
}
