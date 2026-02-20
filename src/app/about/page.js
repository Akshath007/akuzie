import Link from 'next/link';

export const metadata = {
    title: 'About Us | Akuzie',
    description: 'Akuzie — original handmade paintings, crochet products, and unique art pieces from Bengaluru, Karnataka.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50/40 via-white to-rose-50/30 relative overflow-hidden">
            {/* Decorative blurs */}
            <div className="absolute top-32 left-10 w-72 h-72 bg-violet-200/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-rose-200/15 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-2xl mx-auto px-6 py-32 md:py-40 text-center">
                {/* Brand Name */}
                <h1 className="text-6xl md:text-8xl font-serif text-gray-900 mb-4 tracking-tight">
                    Akuzie
                </h1>

                {/* Tagline */}
                <p className="text-lg md:text-xl text-gray-400 font-light mb-4">
                    Original Art &amp; Handmade Creations
                </p>

                {/* Location */}
                <p className="text-sm text-gray-400 mb-16">
                    Bengaluru, Karnataka
                </p>

                {/* Divider */}
                <div className="w-12 h-px bg-gray-200 mx-auto mb-16" />

                {/* Get in Touch */}
                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-10">
                    Get in Touch
                </h2>

                {/* Social Icons */}
                <div className="flex items-center justify-center gap-6 mb-16">
                    {/* Instagram */}
                    <a
                        href="https://instagram.com/akuzie27"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-lg hover:scale-110 hover:border-pink-200 transition-all group"
                        aria-label="Instagram"
                    >
                        <svg className="w-6 h-6 text-gray-600 group-hover:text-pink-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" />
                            <circle cx="12" cy="12" r="5" />
                            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                        </svg>
                    </a>

                    {/* Gmail / Email */}
                    <a
                        href="mailto:akuzie27@gmail.com"
                        className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-lg hover:scale-110 hover:border-red-200 transition-all group"
                        aria-label="Email"
                    >
                        <svg className="w-6 h-6 text-gray-600 group-hover:text-red-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="3" />
                            <path d="M2 7l10 6 10-6" />
                        </svg>
                    </a>

                    {/* WhatsApp */}
                    <a
                        href="https://wa.me/918217262053"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-lg hover:scale-110 hover:border-green-200 transition-all group"
                        aria-label="WhatsApp"
                    >
                        <svg className="w-6 h-6 text-gray-600 group-hover:text-green-500 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                    </a>
                </div>

                {/* Browse Link */}
                <Link
                    href="/gallery"
                    className="inline-block px-10 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs font-bold uppercase tracking-[0.25em] rounded-2xl shadow-xl shadow-gray-200 hover:shadow-gray-300 hover:scale-[1.02] transition-all"
                >
                    Explore Gallery
                </Link>
            </div>
        </div>
    );
}
