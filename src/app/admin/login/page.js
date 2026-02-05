'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const router = useRouter();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            router.push('/admin/dashboard');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="flex h-screen items-center justify-center">
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <h1 className="text-2xl font-light mb-6 text-center">Admin Login</h1>

                {error && <div className="bg-red-50 text-red-500 p-3 mb-4 text-sm">{error}</div>}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full p-2 border border-gray-200 rounded"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full p-2 border border-gray-200 rounded"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button className="w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-800 transition-colors">
                        Login
                    </button>
                </div>
            </form>
        </div>
    );
}
