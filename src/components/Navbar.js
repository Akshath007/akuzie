'use client';

import Link from 'next/link';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/gallery', label: 'Gallery' },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-2xl font-light tracking-widest uppercase">
                            Akuzie
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex space-x-8 items-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-sm uppercase tracking-wide transition-colors hover:text-gray-900",
                                    pathname === link.href ? "text-gray-900 font-medium" : "text-gray-500"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link href="/cart" className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors">
                            <ShoppingBag size={20} />
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <Link href="/cart" className="p-2 mr-2 text-gray-500 hover:text-gray-900">
                            <ShoppingBag size={20} />
                        </Link>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-gray-500 hover:text-gray-900 focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-5">
                    <div className="px-4 pt-2 pb-6 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "block px-3 py-2 text-base font-medium uppercase tracking-wide",
                                    pathname === link.href ? "text-gray-900 bg-gray-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}
