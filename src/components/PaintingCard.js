import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, PAINTING_STATUS, cn } from '@/lib/utils'; // Import cn correctly

export default function PaintingCard({ painting }) {
    const isSold = painting.status === PAINTING_STATUS.SOLD;

    return (
        <Link href={`/painting/${painting.id}`} className="group block relative cursor-pointer">
            <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 mb-4 transition-shadow duration-500 ease-out group-hover:shadow-xl">
                {painting.images && painting.images[0] ? (
                    <Image
                        src={painting.images[0]}
                        alt={painting.title}
                        fill
                        className={cn(
                            "object-cover transition-transform duration-[0.8s] ease-out group-hover:scale-[1.03]",
                            isSold ? "grayscale opacity-80" : ""
                        )}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-300 font-serif italic">No Preview</div>
                )}

                {/* Status Badges */}
                <div className="absolute top-4 left-4">
                    {isSold ? (
                        <span className="bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[10px] uppercase tracking-widest font-medium text-gray-500 border border-gray-100/50">
                            Sold Out
                        </span>
                    ) : (
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[10px] uppercase tracking-widest font-medium text-gray-900 border border-gray-100/50">
                            Available
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-1">
                <h3 className="text-xl font-serif text-gray-900 leading-none">
                    {painting.title}
                </h3>
                <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-gray-400">
                    <span>{painting.medium || 'Acrylic'}</span>
                    <span>•</span>
                    <span>{painting.size || 'Original'}</span>
                </div>
                <p className="font-sans text-sm font-medium text-gray-900 pt-1">
                    {isSold ? <span className="text-gray-300 line-through">{formatPrice(painting.price)}</span> : formatPrice(painting.price)}
                </p>
            </div>
        </Link>
    );
}
