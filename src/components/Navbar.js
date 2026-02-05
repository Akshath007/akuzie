'use client';

import Link from 'next/link';
import { ShoppingBag, Menu, X, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import Input from './Input';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const pathname = usePathname();
    const router = useRouter();
    const { cart } = useCart();
    const searchInputRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
        setShowSearch(false);
    }, [pathname]);

    // Focus input when search opens
    useEffect(() => {
        if (showSearch && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [showSearch]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/gallery?q=${encodeURIComponent(searchQuery)}`);
            setShowSearch(false);
            setSearchQuery('');
        }
    };

    return (
        <>
            <nav
                className={cn(
                    "fixed top-0 z-50 w-full transition-all duration-300 border-b border-transparent",
                    (scrolled || isOpen) ? "bg-white/95 backdrop-blur-md border-stone-100 py-3 shadow-sm" : "bg-transparent py-6"
                )}
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="flex justify-between items-center h-12">

                        {/* Left: Mobile Toggle & Search Trigger */}
                        <div className="flex items-center gap-4 md:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="text-gray-900 focus:outline-none"
                            >
                                {isOpen ? <X size={24} strokeWidth={1} /> : <Menu size={24} strokeWidth={1} />}
                            </button>
                            <button onClick={() => setShowSearch(!showSearch)} className="text-gray-900">
                                <Search size={20} strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Logo (Centered on mobile, Left on desktop) */}
                        <Link href="/" className="font-serif text-3xl text-gray-900 tracking-wide z-50 absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none md:mr-12">
                            Akuzie
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-12 flex-1">
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
                                Archive
                            </Link>
                        </div>

                        {/* Desktop Right: Search & Cart */}
                        <div className="hidden md:flex items-center gap-8">
                            <div className={cn("transition-all duration-300 overflow-hidden", showSearch ? "w-64 opacity-100" : "w-0 opacity-0")}>
                                <form onSubmit={handleSearchSubmit}>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search..."
                                        className="w-full bg-transparent border-b border-stone-300 py-1 text-sm focus:outline-none focus:border-stone-900 font-sans"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onBlur={() => !searchQuery && setShowSearch(false)}
                                    />
                                </form>
                            </div>

                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className={cn("text-gray-900 hover:text-gray-600 transition-colors", showSearch && "opacity-0 pointer-events-none")}
                            >
                                <Search size={20} strokeWidth={1.5} />
                            </button>

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

                        {/* Mobile Right: Cart */}
                        <div className="md:hidden flex items-center z-50">
                            <Link href="/cart" className="relative text-gray-900">
                                <ShoppingBag size={20} strokeWidth={1.5} />
                                {cart.length > 0 && (
                                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-stone-800 rounded-full"></span>
                                )}
                            </Link>
                        </div>

                    </div>
                </div>

                {/* Mobile Search Bar (Expandable) */}
                {showSearch && (
                    <div className="md:hidden px-6 pb-4 pt-2 bg-white/95 backdrop-blur-md border-b border-stone-100 animate-in slide-in-from-top-2">
                        <form onSubmit={handleSearchSubmit}>
                            <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search collection..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full"
                            />
                        </form>
                    </div>
                )}

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
        </>
    );
}
