import AdminProvider from '@/components/AdminProvider';

import Link from 'next/link';

export default function AdminRootLayout({ children }) {
    return (
        <AdminProvider>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Simple Admin Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                    <div className="px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                        <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-start">
                            <Link href="/akshath/dashboard" className="font-serif text-xl font-bold tracking-tight text-gray-900">
                                Akuzie <span className="text-gray-400 font-sans text-xs font-medium uppercase tracking-widest ml-2">Panel</span>
                            </Link>
                            {/* Mobile Live Link */}
                            <Link href="/" target="_blank" className="md:hidden text-xs font-medium text-gray-500 hover:text-gray-900">Live Site &rarr;</Link>
                        </div>

                        <nav className="flex items-center gap-6 text-sm font-medium text-gray-500 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                            <Link href="/akshath/dashboard" className="hover:text-gray-900 transition-colors whitespace-nowrap">Overview</Link>
                            <Link href="/akshath/auctions" className="hover:text-gray-900 transition-colors whitespace-nowrap">Auctions</Link>
                            <Link href="/akshath/orders" className="hover:text-gray-900 transition-colors whitespace-nowrap">Orders</Link>
                            <Link href="/akshath/add" className="hover:text-gray-900 transition-colors whitespace-nowrap">Add Product</Link>
                        </nav>

                        <div className="hidden md:flex items-center gap-4">
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
