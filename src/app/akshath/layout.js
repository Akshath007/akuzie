import AdminProvider from '@/components/AdminProvider';

export default function AdminRootLayout({ children }) {
    return (
        <AdminProvider>
            <div className="min-h-screen bg-gray-50">
                {children}
            </div>
        </AdminProvider>
    );
}
