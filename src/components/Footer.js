'use client';

import { Instagram, Mail, MessageCircle } from 'lucide-react';
import Link from 'next/link';


import { usePathname } from 'next/navigation';

export default function Footer() {
    const pathname = usePathname();

    if (pathname.startsWith('/akshath')) return null;

    return (
        <footer className="bg-white py-16 border-t border-gray-100 mt-20">
            <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-8">



                {/* Simple Logo */}
                <Link href="/" className="font-serif text-3xl tracking-tighter text-gray-900 transition-colors hover:text-violet-600">
                    akuzie
                </Link>

                {/* Social Symbols */}
                <div className="flex items-center gap-8">
                    <a
                        href="https://instagram.com/akuzie27"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-violet-600 transition-all hover:scale-110"
                        title="Instagram"
                    >
                        <Instagram size={24} strokeWidth={1.5} />
                    </a>
                    <a
                        href="https://wa.me/918217262053"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-emerald-500 transition-all hover:scale-110"
                        title="WhatsApp"
                    >
                        <MessageCircle size={24} strokeWidth={1.5} />
                    </a>
                    <a
                        href="mailto:akuzie27@gmail.com"
                        className="text-gray-400 hover:text-blue-500 transition-all hover:scale-110"
                        title="Email"
                    >
                        <Mail size={24} strokeWidth={1.5} />
                    </a>
                </div>

                {/* Legal Links */}
                <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-[11px] uppercase tracking-widest font-medium text-gray-400">
                    <Link href="/privacy" className="hover:text-stone-800 transition-colors">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-stone-800 transition-colors">Terms of Service</Link>
                    <Link href="/refund-policy" className="hover:text-stone-800 transition-colors">Refund Policy</Link>
                    <Link href="/shipping" className="hover:text-stone-800 transition-colors">Shipping</Link>
                </div>

                {/* Bottom line */}
                <div className="text-[10px] uppercase tracking-[0.3em] text-gray-300 font-bold mt-4">
                    &copy; {new Date().getFullYear()} AKUZIE
                </div>
            </div>
        </footer>
    );
}
