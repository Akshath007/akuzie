'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ShoppingCart, Home, LifeBuoy } from 'lucide-react';

function PaymentFailedContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Prevent back navigation to PayU or Checkout
    useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            router.replace('/');
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [router]);

    const orderId = searchParams.get('orderId');
    const error = searchParams.get('error');

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-gray-50 relative overflow-hidden">
            {/* Sad decorative background */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-gray-200/30 rounded-full blur-3xl" />

            <div className="relative z-10 pt-32 pb-24 px-6">
                <div className="max-w-2xl mx-auto text-center">
                    {/* Animated Sad Face */}
                    <div className="relative inline-block mb-10">
                        <div className="w-28 h-28 bg-gradient-to-br from-rose-400 to-red-500 rounded-full flex items-center justify-center shadow-2xl shadow-rose-200 animate-sad-appear">
                            <svg className="w-16 h-16 text-white" viewBox="0 0 64 64" fill="none">
                                {/* Eyes */}
                                <circle cx="22" cy="24" r="3" fill="currentColor" className="animate-blink" />
                                <circle cx="42" cy="24" r="3" fill="currentColor" className="animate-blink" />
                                {/* Sad tear */}
                                <path d="M22 28 C22 28, 22 34, 20 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-tear" opacity="0.6" />
                                {/* Sad mouth - frown */}
                                <path d="M20 44 Q32 36 44 44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" className="animate-frown" />
                            </svg>
                        </div>
                        {/* Broken pieces falling */}
                        <div className="absolute -bottom-2 -left-4 text-rose-300 animate-float-down-1">✦</div>
                        <div className="absolute -bottom-1 -right-3 text-gray-300 animate-float-down-2">✦</div>
                        <div className="absolute top-0 right-0 text-rose-200 animate-float-down-3">✧</div>
                    </div>

                    {/* Heading */}
                    <h1 className="text-5xl md:text-6xl font-serif text-gray-900 mb-4 animate-fade-up">
                        Oh no!
                    </h1>
                    <p className="text-xl text-gray-500 mb-3 animate-fade-up-delay-1 font-light">
                        Your payment didn&apos;t go through
                    </p>

                    {error && error !== 'server_error' && error !== 'hash_mismatch' && error !== 'missing_order' && error !== 'order_not_found' && (
                        <div className="inline-flex items-center gap-2 px-5 py-3 bg-rose-50 border border-rose-100 rounded-full text-sm text-rose-600 mb-8 animate-fade-up-delay-1">
                            <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
                            {decodeURIComponent(error)}
                        </div>
                    )}

                    {/* Reassurance Card */}
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 md:p-10 mb-10 text-left shadow-xl shadow-gray-100/50 animate-fade-up-delay-2">
                        <h2 className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">Don&apos;t worry, here&apos;s what you can do</h2>

                        <div className="space-y-6">
                            {[
                                { icon: '🔄', label: 'Try Again', desc: 'Go back to your cart and retry with a different payment method' },
                                { icon: '💰', label: 'Money Deducted?', desc: 'If money was deducted, it will be automatically refunded within 5-7 business days' },
                                { icon: '🌐', label: 'Try Another Method', desc: 'PayU supports UPI, cards, net banking, and wallets — try switching' },
                                { icon: '📧', label: 'Need Help?', desc: 'Contact us and we\'ll sort it out for you personally' },
                            ].map((step, i) => (
                                <div key={i} className="flex items-start gap-5 group">
                                    <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center shrink-0 text-xl transition-transform group-hover:scale-110">
                                        {step.icon}
                                    </div>
                                    <div className="pt-1">
                                        <p className="font-semibold text-gray-900 text-sm">{step.label}</p>
                                        <p className="text-gray-500 text-sm mt-0.5">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up-delay-3">
                        <Link
                            href="/cart"
                            className="px-10 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-sm font-bold uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-gray-200 hover:shadow-gray-300 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            <ShoppingCart size={18} />
                            Try Again
                        </Link>
                        <Link
                            href="/"
                            className="px-10 py-4 bg-white text-gray-900 border border-gray-200 text-sm font-bold uppercase tracking-[0.2em] rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            <Home size={18} />
                            Go Home
                        </Link>
                    </div>

                    {/* Support Line */}
                    <div className="mt-12 flex items-center justify-center gap-3 animate-fade-up-delay-3">
                        <LifeBuoy size={16} className="text-gray-400" />
                        <p className="text-sm text-gray-400">
                            <a href="mailto:akuzie27@gmail.com" className="text-violet-500 hover:underline">akuzie27@gmail.com</a>
                            {' · '}
                            <a href="tel:+918217262053" className="text-violet-500 hover:underline">+91 82172 62053</a>
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes sadAppear {
                    0% { transform: scale(0) rotate(-10deg); opacity: 0; }
                    60% { transform: scale(1.1) rotate(5deg); }
                    80% { transform: scale(0.95) rotate(-2deg); }
                    100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }
                .animate-sad-appear { animation: sadAppear 0.8s ease-out forwards; }

                @keyframes blink {
                    0%, 90%, 100% { r: 3; }
                    95% { r: 0.5; }
                }
                .animate-blink { animation: blink 4s ease-in-out infinite; }

                @keyframes tear {
                    0%, 60% { opacity: 0; }
                    70% { opacity: 0.6; }
                    100% { opacity: 0; }
                }
                .animate-tear { animation: tear 3s ease-in-out 1s infinite; }

                @keyframes frown {
                    0% { d: path("M20 42 Q32 42 44 42"); }
                    100% { d: path("M20 44 Q32 36 44 44"); }
                }
                .animate-frown { animation: frown 0.6s ease-out 0.5s forwards; }

                @keyframes floatDown1 {
                    0% { transform: translateY(0) rotate(0); opacity: 1; }
                    100% { transform: translateY(40px) rotate(45deg); opacity: 0; }
                }
                .animate-float-down-1 { animation: floatDown1 2s ease-in 0.8s infinite; }

                @keyframes floatDown2 {
                    0% { transform: translateY(0) rotate(0); opacity: 1; }
                    100% { transform: translateY(35px) rotate(-30deg); opacity: 0; }
                }
                .animate-float-down-2 { animation: floatDown2 2.5s ease-in 1.2s infinite; }

                @keyframes floatDown3 {
                    0% { transform: translateY(0) rotate(0); opacity: 0.8; }
                    100% { transform: translateY(50px) rotate(60deg); opacity: 0; }
                }
                .animate-float-down-3 { animation: floatDown3 3s ease-in 0.5s infinite; }

                @keyframes fadeUp {
                    0% { transform: translateY(20px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                .animate-fade-up { animation: fadeUp 0.7s ease-out forwards; }
                .animate-fade-up-delay-1 { opacity: 0; animation: fadeUp 0.7s ease-out 0.3s forwards; }
                .animate-fade-up-delay-2 { opacity: 0; animation: fadeUp 0.7s ease-out 0.5s forwards; }
                .animate-fade-up-delay-3 { opacity: 0; animation: fadeUp 0.7s ease-out 0.7s forwards; }
            `}</style>
        </div>
    );
}

export default function PaymentFailedPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-gray-50">
                <Loader2 size={48} className="animate-spin text-rose-500" />
            </div>
        }>
            <PaymentFailedContent />
        </Suspense>
    );
}
