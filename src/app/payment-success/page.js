'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCart();
    const [status, setStatus] = useState('processing'); // processing, success, error

    useEffect(() => {
        // Get order ID from URL parameters
        const orderId = searchParams.get('orderId');
        const checkoutId = searchParams.get('checkout_id');

        if (!orderId && !checkoutId) {
            setStatus('error');
            return;
        }

        // Clear the cart since payment was successful
        clearCart();
        setStatus('success');
    }, [searchParams, clearCart]);

    if (status === 'processing') {
        return (
            <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-violet-600 mx-auto mb-4" />
                    <p className="text-gray-600">Processing your payment...</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen pt-32 pb-24 px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">❌</span>
                    </div>
                    <h1 className="text-3xl font-serif text-gray-900 mb-4">Payment Error</h1>
                    <p className="text-gray-600 mb-8">
                        We couldn't verify your payment. If you were charged, please contact us.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/cart"
                            className="px-6 py-3 bg-gray-900 text-white text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors"
                        >
                            Back to Cart
                        </Link>
                        <Link
                            href="/"
                            className="px-6 py-3 bg-white text-gray-900 border border-gray-200 text-sm uppercase tracking-widest hover:bg-gray-50 transition-colors"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-24 px-6">
            <div className="max-w-2xl mx-auto text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
                    <CheckCircle size={48} className="text-green-600" />
                </div>

                {/* Success Message */}
                <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    Payment Successful!
                </h1>
                <p className="text-lg text-gray-600 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                    Thank you for your purchase. Your order has been confirmed.
                </p>

                {/* Order Details */}
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-8 mb-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <h2 className="text-xl font-serif text-gray-900 mb-4">What's Next?</h2>
                    <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start gap-3">
                            <span className="text-violet-600 mt-1">✓</span>
                            <span>You'll receive an order confirmation email shortly</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-violet-600 mt-1">✓</span>
                            <span>We'll carefully package your artwork(s) for shipping</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-violet-600 mt-1">✓</span>
                            <span>You'll receive tracking information within 5-7 business days</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-violet-600 mt-1">✓</span>
                            <span>Your original artwork will arrive ready to hang</span>
                        </li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    <Link
                        href="/gallery"
                        className="px-8 py-4 bg-gray-900 text-white text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                    <Link
                        href="/"
                        className="px-8 py-4 bg-white text-gray-900 border border-gray-200 text-sm uppercase tracking-widest hover:bg-gray-50 transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>

                {/* Support Note */}
                <p className="text-sm text-gray-500 mt-12 animate-in fade-in duration-700 delay-500">
                    Questions about your order? Contact us at{' '}
                    <a href="mailto:akuzie27@gmail.com" className="text-violet-600 hover:underline">
                        akuzie27@gmail.com
                    </a>
                </p>
            </div>
        </div>
    );
}
