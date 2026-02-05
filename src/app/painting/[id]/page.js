import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPainting } from '@/lib/data';
import { formatPrice, PAINTING_STATUS } from '@/lib/utils';
import AddToCartButton from '@/components/AddToCartButton';
import NotifyForm from '@/components/NotifyForm';

export async function generateMetadata({ params }) {
    const { id } = await params;
    const painting = await getPainting(id);
    if (!painting) return { title: 'Painting Not Found' };

    return {
        title: `${painting.title} | Akuzie`,
        description: `Buy ${painting.title}, an original acrylic painting on canvas.`,
    };
}

export default async function PaintingPage({ params }) {
    const { id } = await params;
    const painting = await getPainting(id);

    if (!painting) {
        notFound();
    }

    const isSold = painting.status === PAINTING_STATUS.SOLD;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
                {/* Image Section */}
                <div className="space-y-4">
                    <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden shadow-sm">
                        {painting.images && painting.images[0] ? (
                            <Image
                                src={painting.images[0]}
                                alt={painting.title}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-300">No Image</div>
                        )}
                        {isSold && (
                            <div className="absolute inset-0 bg-white/40 flex items-center justify-center pointer-events-none">
                                <span className="bg-white/90 px-6 py-3 text-sm uppercase tracking-widest border border-gray-200 shadow-sm text-gray-900">
                                    Sold Out
                                </span>
                            </div>
                        )}
                    </div>
                    {/* Optional: Thumbnails if multiple images (skipping for minimal scope if array has 1, but good to iterate) */}
                    {painting.images && painting.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {painting.images.map((img, idx) => (
                                <div key={idx} className="relative aspect-square bg-gray-50">
                                    <Image
                                        src={img}
                                        alt={`${painting.title} detail ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="flex flex-col justify-center space-y-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2">{painting.title}</h1>
                        <p className="text-2xl text-gray-500 font-light">{formatPrice(painting.price)}</p>
                    </div>

                    <div className="space-y-4 border-t border-b border-gray-100 py-8 text-sm md:text-base text-gray-600 font-light">
                        <div className="grid grid-cols-3 gap-4">
                            <span className="text-gray-400 uppercase tracking-wider text-xs font-normal">Medium</span>
                            <span className="col-span-2">{painting.medium || 'Acrylic on Canvas'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <span className="text-gray-400 uppercase tracking-wider text-xs font-normal">Size</span>
                            <span className="col-span-2">{painting.size}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <span className="text-gray-400 uppercase tracking-wider text-xs font-normal">Finish</span>
                            <span className="col-span-2">{painting.finish || 'Varnished'}</span>
                        </div>
                    </div>

                    <div className="pt-4">
                        {isSold ? (
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-4 text-center border border-gray-100 text-gray-500">
                                    This piece has found a home.
                                </div>
                                <NotifyForm paintingId={painting.id} />
                            </div>
                        ) : (
                            <AddToCartButton painting={painting} />
                        )}
                    </div>

                    <div className="text-xs text-gray-400 leading-relaxed pt-8">
                        <p>
                            Each painting is a unique original. Ships within 5-7 business days.
                            Because of the handmade nature, slight texture variations are expected and celebrated.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
