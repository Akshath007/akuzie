'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Loader2, Sparkles, Package, Mail, Truck, Heart } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const { clearCart } = useCart();
    const [orderId, setOrderId] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
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

    useEffect(() => {
        const id = searchParams.get('orderId');
        if (id) {
            setOrderId(id);
            clearCart();
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000);
        }
    }, [searchParams, clearCart]);

    if (!orderId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-violet-50">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-violet-600 mx-auto mb-4" />
                    <p className="text-gray-500">Processing your payment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-violet-50 relative overflow-hidden">
            {/* Confetti Effect */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    {[...Array(60)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-5%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 3}s`,
                            }}
                        >
                            <div
                                style={{
                                    width: `${6 + Math.random() * 8}px`,
                                    height: `${6 + Math.random() * 8}px`,
                                    backgroundColor: ['#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6', '#06b6d4'][Math.floor(Math.random() * 6)],
                                    borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                                    transform: `rotate(${Math.random() * 360}deg)`,
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Decorative Background Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-40 right-20 w-48 h-48 bg-amber-200/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 pt-32 pb-24 px-6">
                <div className="max-w-2xl mx-auto text-center">
                    {/* Animated Success Icon */}
                    <div className="relative inline-block mb-10">
                        <div className="w-28 h-28 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-200 animate-success-bounce">
                            <svg className="w-14 h-14 text-white animate-success-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" className="animate-draw-check" />
                            </svg>
                        </div>
                        {/* Pulse rings */}
                        <div className="absolute inset-0 w-28 h-28 bg-emerald-400/20 rounded-full animate-ping-slow" />
                        <div className="absolute -inset-3 w-34 h-34 bg-emerald-400/10 rounded-full animate-ping-slower" />
                        {/* Sparkles around icon */}
                        <Sparkles className="absolute -top-2 -right-2 text-amber-400 animate-pulse" size={20} />
                        <Sparkles className="absolute -bottom-1 -left-3 text-violet-400 animate-pulse delay-300" size={16} />
                    </div>

                    {/* Heading */}
                    <h1 className="text-5xl md:text-6xl font-serif text-gray-900 mb-4 animate-fade-up">
                        Thank You!
                    </h1>
                    <p className="text-xl text-gray-500 mb-2 animate-fade-up-delay-1 font-light">
                        Your payment was successful
                    </p>
                    <div className="flex items-center justify-center gap-2 text-emerald-600 font-medium animate-fade-up-delay-1 mb-10">
                        <Heart size={16} className="fill-emerald-600" />
                        <span>A beautiful piece of art is on its way to you</span>
                        <Heart size={16} className="fill-emerald-600" />
                    </div>

                    {/* Timeline Cards */}
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 md:p-10 mb-10 text-left shadow-xl shadow-gray-100/50 animate-fade-up-delay-2">
                        <h2 className="text-lg font-bold text-gray-900 mb-8 text-center uppercase tracking-widest text-xs">What happens next</h2>

                        <div className="space-y-6">
                            {[
                                { icon: Mail, color: 'violet', label: 'Confirmation Email', desc: 'A detailed receipt is being sent to your inbox right now', done: true },
                                { icon: Package, color: 'amber', label: 'Careful Packaging', desc: 'Your artwork will be professionally wrapped within 2-3 days' },
                                { icon: Truck, color: 'blue', label: 'Shipped to You', desc: "You'll receive tracking info within 5-7 business days" },
                                { icon: Heart, color: 'rose', label: 'Enjoy Your Art', desc: 'Your original piece arrives ready to display and cherish' },
                            ].map((step, i) => (
                                <div key={i} className="flex items-start gap-5 group">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${step.done
                                        ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200'
                                        : `bg-${step.color}-50 border border-${step.color}-100`
                                        }`}>
                                        <step.icon size={20} className={step.done ? 'text-white' : `text-${step.color}-500`} />
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
                            href={`/orders/${orderId}`}
                            className="px-10 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-violet-200 hover:shadow-violet-300 hover:scale-[1.02] transition-all active:scale-[0.98]"
                        >
                            View Order
                        </Link>
                        <Link
                            href="/gallery"
                            className="px-10 py-4 bg-white text-gray-900 border border-gray-200 text-sm font-bold uppercase tracking-[0.2em] rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all active:scale-[0.98]"
                        >
                            Continue Exploring
                        </Link>
                    </div>

                    <p className="text-sm text-gray-400 mt-12">
                        Questions? Reach us at{' '}
                        <a href="mailto:akuzie27@gmail.com" className="text-violet-500 hover:underline">akuzie27@gmail.com</a>
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes confetti {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
                .animate-confetti { animation: confetti linear forwards; }

                @keyframes success-bounce {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-success-bounce { animation: success-bounce 0.8s ease-out forwards; }

                @keyframes draw-check {
                    0% { stroke-dashoffset: 30; }
                    100% { stroke-dashoffset: 0; }
                }
                .animate-draw-check {
                    stroke-dasharray: 30;
                    stroke-dashoffset: 30;
                    animation: draw-check 0.5s ease-out 0.5s forwards;
                }

                @keyframes ping-slow {
                    0% { transform: scale(1); opacity: 0.4; }
                    100% { transform: scale(1.8); opacity: 0; }
                }
                .animate-ping-slow { animation: ping-slow 2s ease-out infinite; }

                @keyframes ping-slower {
                    0% { transform: scale(1); opacity: 0.2; }
                    100% { transform: scale(2.2); opacity: 0; }
                }
                .animate-ping-slower { animation: ping-slower 2.5s ease-out 0.3s infinite; }

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

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-violet-50">
                <Loader2 size={48} className="animate-spin text-violet-600" />
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}
