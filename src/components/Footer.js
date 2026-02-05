import { Instagram } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
                <h3 className="text-xl font-light tracking-widest uppercase mb-4">Akuzie</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-md">
                    Original handmade acrylic paintings on canvas. Bringing calm and creativity to your space.
                </p>

                <div className="flex flex-col items-center gap-4 mb-6 text-sm text-gray-500">
                    <a
                        href="https://www.instagram.com/akuzie27?igsh=MnFkcW4wN3FjY2U3&utm_source=qr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-gray-900 transition-colors uppercase tracking-widest text-xs"
                    >
                        <Instagram size={16} /> Instagram
                    </a>
                    <p className="flex items-center gap-2 uppercase tracking-widest text-xs">
                        WhatsApp: +91 82172 62053
                    </p>
                </div>

                <div className="text-gray-400 text-xs">
                    &copy; {new Date().getFullYear()} Akuzie. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
