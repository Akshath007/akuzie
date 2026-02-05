import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, PAINTING_STATUS } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

export default function PaintingCard({ painting }) {
    const isSold = painting.status === PAINTING_STATUS.SOLD;

    return (
        <Link href={`/painting/${painting.id}`} className="group block relative">
            <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
                {painting.images && painting.images[0] ? (
                    <Image
                        src={painting.images[0]}
                        alt={painting.title}
                        fill
                        className={cn(
                            "object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-110",
                            isSold ? "grayscale opacity-80" : ""
                        )}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-stone-300 font-serif italic">No Preview</div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>

                {isSold && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1">
                        <span className="text-[10px] items-center uppercase tracking-widest font-medium text-stone-600">Sold</span>
                    </div>
                )}
            </div>

            <div className="mt-5 flex justify-between items-start">
                <div className="space-y-1">
                    <h3 className="text-xl font-serif text-gray-900 group-hover:text-stone-600 transition-colors">
                        {painting.title}
                    </h3>
                    <p className="text-xs uppercase tracking-widest text-gray-400">
                        {painting.size || 'Original Art'}
                    </p>
                </div>

                <div className="text-right">
                    <p className="font-sans text-sm font-medium text-gray-900">
                        {isSold ? <span className="line-through text-gray-300">{formatPrice(painting.price)}</span> : formatPrice(painting.price)}
                    </p>
                    {!isSold && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 absolute bottom-5 right-5 bg-white p-3 rounded-full shadow-lg hidden md:block">
                            <ArrowUpRight size={20} strokeWidth={1} />
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

// Helper needed because I used 'cn' but didn't import it in this snippet
import { cn } from '@/lib/utils';
