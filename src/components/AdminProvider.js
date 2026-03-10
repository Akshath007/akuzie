'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminProvider({ children }) {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in
                if (pathname !== '/akshath/login') {
                    router.push('/akshath/login');
                }
            } else {
                // Logged in
                if (!isAdmin) {
                    // Normal user trying to access admin
                    router.push('/');
                } else if (pathname === '/akshath/login') {
                    // Admin already logged in but on login page
                    router.push('/akshath/dashboard');
                }
            }
        }
    }, [user, isAdmin, loading, pathname, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    // Prevent rendering children if the user is being redirected
    if (!user && pathname !== '/akshath/login') return null;
    if (user && !isAdmin) return null;

    return <>{children}</>;
}
