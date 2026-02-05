import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function OrderConfirmationPage({ searchParams }) {
    // searchParams might be { orderId: '...' }
    const message = "Thank you for your order. We have received your payment details and will verify shortly.";

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
            <div className="mb-6 text-gray-900 animate-in zoom-in duration-500">
                <CheckCircle size={64} strokeWidth={1} />
            </div>

            <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">Order Placed</h1>

            <p className="text-gray-500 max-w-md mx-auto mb-12 leading-relaxed">
                {message} An email confirmation will be sent to you.
            </p>

            <Link
                href="/"
                className="bg-gray-900 text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors"
            >
                Return Home
            </Link>
        </div>
    );
}
