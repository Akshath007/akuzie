'use client';

import { Instagram, Send, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="relative bg-[#0f172a] text-white pt-24 pb-12 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-violet-600/10 rounded-full blur-[100px]"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">

                    {/* Brand Section */}
                    <div className="md:col-span-2 space-y-6">
                        <Link href="/" className="font-serif text-4xl tracking-tighter hover:text-violet-400 transition-colors">
                            Akuzie.
                        </Link>
                        <p className="text-gray-400 font-light text-lg max-w-sm leading-relaxed">
                            Original handmade acrylic masterpieces curated for modern living spaces.
                            Each piece is a journey of emotion captured on canvas.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <a href="https://instagram.com/akuzie27" target="_blank" className="p-3 bg-white/5 rounded-full hover:bg-violet-600 transition-all hover:scale-110">
                                <Instagram size={20} />
                            </a>
                            <a href="mailto:info@akuzie.in" className="p-3 bg-white/5 rounded-full hover:bg-violet-600 transition-all hover:scale-110">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-6">
                        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Navigation</h4>
                        <ul className="space-y-4">
                            <li><Link href="/gallery" className="text-gray-400 hover:text-white transition-colors">Archive</Link></li>
                            <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">The Artist</Link></li>
                            <li><Link href="/orders" className="text-gray-400 hover:text-white transition-colors">Track Order</Link></li>
                            <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-6">
                        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Studio</h4>
                        <div className="space-y-4 text-gray-400 font-light">
                            <div className="flex items-center gap-3">
                                <Phone size={16} className="text-violet-500" />
                                <span>+91 82172 62053</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Send size={16} className="text-violet-500 mt-1" />
                                <span>Shipping across India & International</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                    <div>&copy; {new Date().getFullYear()} AKUZIE STUDIOS. ALL RIGHTS RESERVED.</div>
                    <div className="flex gap-8">
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
