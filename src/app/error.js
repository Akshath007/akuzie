
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] px-6 text-center">
            <h2 className="text-3xl font-serif text-gray-900 mb-4">Something went wrong!</h2>
            <p className="text-gray-500 font-light mb-8">
                We apologize for the inconvenience. Our team has been notified.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => reset()}
                    className="px-8 py-3 border border-stone-200 text-stone-900 text-xs uppercase tracking-[0.2em] hover:bg-stone-100 transition-colors"
                >
                    Try again
                </button>
                <Link
                    href="/"
                    className="px-8 py-3 bg-stone-900 text-white text-xs uppercase tracking-[0.2em] hover:bg-violet-600 transition-colors"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}
