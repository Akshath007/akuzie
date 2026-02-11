
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] px-6 text-center">
            <h1 className="font-serif text-9xl text-stone-200 font-bold mb-4 select-none">404</h1>
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-6">Lost in the Abstract?</h2>
            <p className="text-gray-500 font-light max-w-md mx-auto mb-10 leading-relaxed">
                The page you are looking for seems to have been moved, deleted, or never existed. Just like art, sometimes things are open to interpretation.
            </p>
            <Link
                href="/"
                className="px-8 py-3 bg-stone-900 text-white text-xs uppercase tracking-[0.2em] hover:bg-violet-600 transition-colors duration-300"
            >
                Return Home
            </Link>
        </div>
    );
}
