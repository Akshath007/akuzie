import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, PAINTING_STATUS } from '@/lib/utils';

export default function PaintingCard({ painting }) {
    const isSold = painting.status === PAINTING_STATUS.SOLD;

    return (
        <Link href={`/painting/${painting.id}`} className="group block h-full">
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-4">
                {painting.images && painting.images[0] ? (
                    <Image
                        src={painting.images[0]}
                        alt={painting.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">No Image</div>
                )}

                {isSold && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="bg-white/90 px-4 py-2 text-xs uppercase tracking-widest border border-gray-200 shadow-sm">
                            Sold Out
                        </span>
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <h3 className="text-lg font-light group-hover:text-gray-600 transition-colors">
                    {painting.title}
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                    {isSold ? <span className="line-through text-gray-300 mr-2">{formatPrice(painting.price)}</span> : formatPrice(painting.price)}
                    {isSold && <span className="text-gray-900">Sold</span>}
                </p>
            </div>
        </Link>
    );
}
