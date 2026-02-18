import AdminProvider from '@/components/AdminProvider';

import Link from 'next/link';

export default function AdminRootLayout({ children }) {
    return (
        <AdminProvider>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Simple Admin Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <Link href="/akshath/dashboard" className="font-serif text-xl font-bold tracking-tight text-gray-900">
                            Akuzie <span className="text-gray-400 font-sans text-xs font-medium uppercase tracking-widest ml-2">Panel</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <Link href="/" target="_blank" className="text-xs font-medium text-gray-500 hover:text-gray-900">Live Site &rarr;</Link>
                        </div>
                    </div>
                </header>
                <main className="flex-grow">
                    {children}
                </main>
            </div>
        </AdminProvider>
    );
}
