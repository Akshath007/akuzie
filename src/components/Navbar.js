'use client';

import Link from 'next/link';

import { ShoppingBag, Menu, X, Search, User, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
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
    const { wishlist } = useWishlist();
    const { user, loading } = useAuth();
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

    // Disable body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/gallery?q=${encodeURIComponent(searchQuery)}`);
            setShowSearch(false);
            setSearchQuery('');
        }
    };

    const isHome = pathname === '/';
    // If on home and not scrolled/open, use transparent style (white text)
    const isTransparent = isHome && !scrolled && !isOpen;

    // Text color class based on state
    const textColorClass = isTransparent ? "text-white hover:text-gray-200" : "text-gray-900 hover:text-gray-600";
    const logoColorClass = isTransparent ? "text-white" : "text-gray-900";

    return pathname.startsWith('/akshath') ? null : (
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
                                className={cn("focus:outline-none", textColorClass)}
                                aria-label="Toggle Menu"
                            >
                                {isOpen ? <X size={24} strokeWidth={1} /> : <Menu size={24} strokeWidth={1} />}
                            </button>
                            <button onClick={() => setShowSearch(!showSearch)} className={textColorClass} aria-label="Search">
                                <Search size={20} strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Logo (Centered on mobile, Left on desktop) */}
                        <Link href="/" className={cn(
                            "font-serif text-2xl md:text-3xl tracking-wide z-50 absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none md:mr-12 transition-opacity duration-300",
                            logoColorClass,
                            (isOpen || showSearch) ? "opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto" : "opacity-100"
                        )}>
                            Akuzie
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-12 flex-1">
                            <Link
                                href="/gallery?category=painting"
                                className={cn("text-xs uppercase tracking-[0.2em] font-medium transition-colors", isTransparent ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-900")}
                            >
                                Art
                            </Link>
                            <Link
                                href="/auctions"
                                className={cn("text-xs uppercase tracking-[0.2em] font-medium transition-colors text-red-500 hover:text-red-600 animate-pulse")}
                            >
                                Live Auctions
                            </Link>
                            <Link
                                href="/gallery?category=crochet"
                                className={cn("text-xs uppercase tracking-[0.2em] font-medium transition-colors", isTransparent ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-900")}
                            >
                                Crochet
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <div className={cn("transition-all duration-300 overflow-hidden", showSearch ? "w-64 opacity-100" : "w-0 opacity-0")}>
                                <form onSubmit={handleSearchSubmit}>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search..."
                                        className={cn(
                                            "w-full bg-transparent border-b py-1 text-sm focus:outline-none font-sans",
                                            isTransparent ? "border-gray-500 text-white placeholder-gray-400 focus:border-white" : "border-stone-300 text-gray-900 focus:border-stone-900"
                                        )}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onBlur={() => !searchQuery && setShowSearch(false)}
                                    />
                                </form>
                            </div>

                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className={cn("transition-colors", textColorClass, showSearch && "opacity-0 pointer-events-none")}
                                aria-label="Search"
                            >
                                <Search size={20} strokeWidth={1.5} />
                            </button>

                            {/* User Profile / Login */}
                            <div className="relative">
                                {loading ? (
                                    <div className="w-5 h-5 bg-stone-100 rounded-full animate-pulse" />
                                ) : user ? (
                                    <Link href="/profile" className={cn("block w-8 h-8 rounded-full overflow-hidden border transition-colors", isTransparent ? "border-white/50 hover:border-white" : "border-stone-200 hover:border-stone-900")}>
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-500">
                                                <User size={16} />
                                            </div>
                                        )}
                                    </Link>
                                ) : (
                                    <Link href="/login" className={textColorClass}>
                                        <User size={20} strokeWidth={1.5} />
                                    </Link>
                                )}
                            </div>

                            <Link href="/wishlist" className={cn("group flex items-center gap-2", textColorClass)} aria-label="Wishlist">
                                <div className="relative">
                                    <Heart size={20} strokeWidth={1.5} className={wishlist.length > 0 ? "fill-red-500 text-red-500" : ""} />
                                    {wishlist.length > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-1.5 w-1.5 rounded-full bg-red-600"></span>
                                    )}
                                </div>
                            </Link>

                            <Link href="/cart" className={cn("group relative flex items-center gap-2", textColorClass)}>
                                <div className="relative">
                                    <ShoppingBag size={20} strokeWidth={1.5} />
                                    {cart.length > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stone-400 opacity-75"></span>
                                            <span className={cn("relative inline-flex rounded-full h-2 w-2", isTransparent ? "bg-white" : "bg-stone-800")}></span>
                                        </span>
                                    )}
                                </div>
                            </Link>
                        </div>

                        {/* Mobile Right: Cart & Profile */}
                        <div className="md:hidden flex items-center gap-4 z-50">
                            <Link href="/cart" className={cn("relative", textColorClass)} aria-label="Cart">
                                <ShoppingBag size={20} strokeWidth={1.5} />
                                {cart.length > 0 && (
                                    <span className={cn("absolute -top-1 -right-1 h-2 w-2 rounded-full", isTransparent ? "bg-white" : "bg-stone-800")}></span>
                                )}
                            </Link>

                            {user ? (
                                <Link href="/profile" className={cn("w-6 h-6 rounded-full overflow-hidden border", isTransparent ? "border-white/50" : "border-stone-200")} aria-label="Profile">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-500">
                                            <User size={14} />
                                        </div>
                                    )}
                                </Link>
                            ) : (
                                <Link href="/login" className={textColorClass} aria-label="Login">
                                    <User size={20} strokeWidth={1.5} />
                                </Link>
                            )}
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

            </nav>

            {/* Mobile Menu View */}
            <div
                className={cn(
                    "fixed inset-0 bg-white z-[60] flex flex-col justify-start items-center pt-32 gap-10 transition-all duration-500 ease-in-out md:hidden",
                    isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
                )}
            >
                <div className="flex flex-col items-center gap-8">
                    <Link href="/" className="font-serif text-4xl text-gray-900 hover:text-stone-500 transition-colors" onClick={() => setIsOpen(false)}>Home</Link>
                    <Link href="/gallery?category=painting" className="font-serif text-4xl text-gray-900 hover:text-stone-500 transition-colors" onClick={() => setIsOpen(false)}>Art</Link>
                    <Link href="/auctions" className="font-serif text-4xl text-red-600 hover:text-red-700 transition-colors animate-pulse" onClick={() => setIsOpen(false)}>Live Auctions</Link>
                    <Link href="/gallery?category=crochet" className="font-serif text-4xl text-gray-900 hover:text-stone-500 transition-colors" onClick={() => setIsOpen(false)}>Crochet</Link>
                    <Link href="/wishlist" className="font-serif text-4xl text-gray-900 hover:text-stone-500 transition-colors" onClick={() => setIsOpen(false)}>Wishlist ({wishlist.length})</Link>
                    <Link href="/cart" className="font-serif text-4xl text-gray-900 hover:text-stone-500 transition-colors" onClick={() => setIsOpen(false)}>Cart ({cart.length})</Link>

                    {user ? (
                        <Link href="/profile" className="font-serif text-4xl text-gray-900 hover:text-stone-500 transition-colors flex items-center gap-3" onClick={() => setIsOpen(false)}>
                            {user.photoURL && (
                                <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full border border-stone-200" />
                            )}
                            Profile
                        </Link>
                    ) : (
                        <Link href="/login" className="font-serif text-4xl text-gray-900 hover:text-stone-500 transition-colors" onClick={() => setIsOpen(false)}>Login</Link>
                    )}

                </div>
            </div>

        </>
    );
}
