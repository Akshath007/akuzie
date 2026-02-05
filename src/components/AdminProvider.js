'use client';

import { AuthProvider } from '@/context/AuthContext';

export default function AdminProvider({ children }) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}
