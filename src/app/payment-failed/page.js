'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, Loader2 } from 'lucide-react';

function PaymentFailedContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const error = searchParams.get('error');

    return (
        <div className="min-h-screen pt-32 pb-24 px-6">
            <div className="max-w-2xl mx-auto text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
                    <XCircle size={48} className="text-red-500" />
                </div>

                <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
                    Payment Failed
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                    Your payment could not be completed.
                </p>
                {error && error !== 'server_error' && error !== 'hash_mismatch' && error !== 'missing_order' && (
                    <p className="text-sm text-gray-500 mb-8 bg-red-50 border border-red-100 rounded-lg p-4 inline-block">
                        Reason: {decodeURIComponent(error)}
                    </p>
                )}

                <div className="bg-gray-50 border border-gray-100 rounded-lg p-8 mb-8 text-left">
                    <h2 className="text-xl font-serif text-gray-900 mb-4">What can you do?</h2>
                    <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start gap-3">
                            <span className="text-gray-400 mt-1">1.</span>
                            <span>Go back to your cart and try again with a different payment method</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-gray-400 mt-1">2.</span>
                            <span>If money was deducted, it will be refunded within 5-7 business days</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-gray-400 mt-1">3.</span>
                            <span>Contact us at <a href="mailto:akuzie27@gmail.com" className="text-violet-600 hover:underline">akuzie27@gmail.com</a> for help</span>
                        </li>
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/cart"
                        className="px-8 py-4 bg-gray-900 text-white text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors"
                    >
                        Try Again
                    </Link>
                    <Link
                        href="/"
                        className="px-8 py-4 bg-white text-gray-900 border border-gray-200 text-sm uppercase tracking-widest hover:bg-gray-50 transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>

                <p className="text-sm text-gray-500 mt-12">
                    Need help? Contact us at{' '}
                    <a href="mailto:akuzie27@gmail.com" className="text-violet-600 hover:underline">
                        akuzie27@gmail.com
                    </a>
                    {' '}or call{' '}
                    <a href="tel:+918217262053" className="text-violet-600 hover:underline">
                        +91 82172 62053
                    </a>
                </p>
            </div>
        </div>
    );
}

export default function PaymentFailedPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-violet-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <PaymentFailedContent />
        </Suspense>
    );
}
