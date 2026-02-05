'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const { user, loginWithGoogle, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push('/profile');
        }
    }, [user, router]);

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch (error) {
            console.error("Login Error:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center">
                <Loader2 size={32} className="animate-spin text-stone-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center">
            <div className="w-full max-w-md bg-white p-8 md:p-12 border border-stone-100 rounded-lg shadow-sm text-center">
                <h1 className="text-3xl font-serif text-gray-900 mb-2">Welcome Back</h1>
                <p className="text-gray-500 mb-8">Sign in to view your profile and orders</p>

                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 py-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors group"
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    <span className="text-gray-700 font-medium group-hover:text-gray-900">Continue with Google</span>
                </button>

                <div className="mt-8 pt-8 border-t border-stone-100">
                    <p className="text-xs text-stone-400">
                        By continuing, you verify that you are the owner of the Google Account used to sign in.
                    </p>
                </div>
            </div>
        </div>
    );
}
