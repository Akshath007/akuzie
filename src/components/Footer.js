'use client';

import { Instagram, Mail, MessageCircle, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';


import { usePathname } from 'next/navigation';

export default function Footer() {
    const pathname = usePathname();

    if (pathname.startsWith('/akshath')) return null;

    return (
        <footer className="bg-white py-16 border-t border-gray-100 mt-20">
            <div className="max-w-7xl mx-auto px-6">

                {/* Top section with brand and info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

                    {/* Brand + Description */}
                    <div className="space-y-4">
                        <Link href="/" className="font-serif text-3xl tracking-tighter text-gray-900 transition-colors hover:text-violet-600">
                            akuzie
                        </Link>
                        <p className="text-sm text-gray-400 font-light leading-relaxed">
                            Original handmade paintings &amp; crochet creations.
                        </p>
                        {/* Social Symbols */}
                        <div className="flex items-center gap-6 pt-2">
                            <a
                                href="https://instagram.com/akuzie27"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-violet-600 transition-all hover:scale-110"
                                title="Instagram"
                            >
                                <Instagram size={22} strokeWidth={1.5} />
                            </a>
                            <a
                                href="https://wa.me/918217262053"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-emerald-500 transition-all hover:scale-110"
                                title="WhatsApp"
                            >
                                <MessageCircle size={22} strokeWidth={1.5} />
                            </a>
                            <a
                                href="mailto:akuzie27@gmail.com"
                                className="text-gray-400 hover:text-blue-500 transition-all hover:scale-110"
                                title="Email"
                            >
                                <Mail size={22} strokeWidth={1.5} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] uppercase tracking-widest font-bold text-gray-900">Quick Links</h4>
                        <div className="flex flex-col gap-3 text-sm text-gray-400 font-light">
                            <Link href="/gallery" className="hover:text-gray-900 transition-colors">Gallery</Link>
                            <Link href="/about" className="hover:text-gray-900 transition-colors">About Us</Link>
                            <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact Us</Link>
                        </div>
                    </div>

                    {/* Policies */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] uppercase tracking-widest font-bold text-gray-900">Policies</h4>
                        <div className="flex flex-col gap-3 text-sm text-gray-400 font-light">
                            <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms &amp; Conditions</Link>
                            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
                            <Link href="/refund-policy" className="hover:text-gray-900 transition-colors">Return &amp; Refund Policy</Link>
                            <Link href="/cancellation" className="hover:text-gray-900 transition-colors">Cancellation Policy</Link>
                            <Link href="/shipping" className="hover:text-gray-900 transition-colors">Shipping Policy</Link>
                        </div>
                    </div>
                </div>

                {/* Contact bar */}
                <div className="border-t border-gray-100 pt-8 mb-8">
                    <div className="flex flex-wrap gap-6 md:gap-10 text-xs text-gray-400 font-light">
                        <div className="flex items-center gap-2">
                            <Mail size={14} className="text-gray-300" />
                            <span>akuzie27@gmail.com</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-300" />
                            <span>+91 82172 62053</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-gray-300" />
                            <span>Bengaluru, Karnataka, India</span>
                        </div>
                    </div>
                </div>

                {/* Bottom line */}
                <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-gray-300 font-bold">
                        &copy; {new Date().getFullYear()} AKUZIE
                    </div>
                    <div className="text-[10px] text-gray-300 font-light">
                        All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}
