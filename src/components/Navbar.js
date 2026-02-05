'use client';

import Link from 'next/link';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const { cart } = useCart();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <nav
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300 border-b border-transparent",
                (scrolled || isOpen) ? "bg-white/90 backdrop-blur-md border-stone-100 py-2 shadow-sm" : "bg-transparent py-6"
            )}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex justify-between items-center h-12">

                    {/* Logo */}
                    <Link href="/" className="font-serif text-3xl text-gray-900 tracking-wide z-50">
                        Akuzie
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-12">
                        <Link
                            href="/"
                            className="text-xs uppercase tracking-[0.2em] font-medium text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Collection
                        </Link>
                        <Link
                            href="/gallery"
                            className="text-xs uppercase tracking-[0.2em] font-medium text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Gallery
                        </Link>

                        <Link href="/cart" className="group relative flex items-center gap-2 text-gray-900">
                            <span className="text-xs uppercase tracking-[0.2em] font-medium group-hover:text-gray-600 transition-colors">Cart</span>
                            <div className="relative">
                                <ShoppingBag size={18} strokeWidth={1.5} />
                                {cart.length > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stone-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-stone-800"></span>
                                    </span>
                                )}
                            </div>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center gap-6 z-50">
                        <Link href="/cart" className="relative text-gray-900">
                            <ShoppingBag size={20} strokeWidth={1.5} />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 h-2 w-2 bg-stone-800 rounded-full"></span>
                            )}
                        </Link>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-900 focus:outline-none"
                        >
                            {isOpen ? <X size={24} strokeWidth={1} /> : <Menu size={24} strokeWidth={1} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu View */}
            <div
                className={cn(
                    "fixed inset-0 bg-white z-40 flex flex-col justify-center items-center gap-8 transition-transform duration-500 ease-in-out md:hidden",
                    isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
                )}
            >
                <Link href="/" className="font-serif text-4xl text-gray-900">Home</Link>
                <Link href="/gallery" className="font-serif text-4xl text-gray-900">Gallery</Link>
                <Link href="/cart" className="font-serif text-4xl text-gray-900">Cart ({cart.length})</Link>
            </div>
        </nav>
    );
}
