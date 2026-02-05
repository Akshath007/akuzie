import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPainting } from '@/lib/data';
import { formatPrice, PAINTING_STATUS } from '@/lib/utils';
import AddToCartButton from '@/components/AddToCartButton';
import NotifyForm from '@/components/NotifyForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-screen-2xl mx-auto">

            {/* Back Link */}
            <Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 hover:text-gray-900 mb-12 transition-colors">
                <ArrowLeft size={16} /> Back to Collection
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-24">

                {/* Left: Image (Stays sticky on desktop) */}
                <div className="lg:col-span-7 xl:col-span-8">
                    <div className="sticky top-32 space-y-4">
                        <div className="relative aspect-[3/4] md:aspect-[4/5] bg-stone-50 w-full shadow-lg"> // shadow maybe?
                            {painting.images && painting.images[0] ? (
                                <Image
                                    src={painting.images[0]}
                                    alt={painting.title}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 768px) 100vw, 70vw"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-stone-300 font-serif italic">No Image</div>
                            )}

                            {isSold && (
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                                    <span className="bg-stone-900 text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.3em] shadow-xl">
                                        Sold Out
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Optional: Additional Shots Grid (if added later) */}
                        {painting.images && painting.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {painting.images.map((img, idx) => (
                                    <div key={idx} className="relative aspect-square bg-stone-50 cursor-pointer hover:opacity-80 transition-opacity">
                                        <Image src={img} alt="detail" fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Details */}
                <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-center lg:py-12">
                    <div className="space-y-8 fade-in delay-200">

                        <div className="space-y-2 border-b border-gray-100 pb-8">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 leading-tight">
                                {painting.title}
                            </h1>
                            <div className="flex items-baseline gap-4 pt-2">
                                <p className="text-2xl font-sans font-light text-gray-600">
                                    {formatPrice(painting.price)}
                                </p>
                                <span className="text-xs uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-sm">
                                    {isSold ? 'Unavailable' : 'In Stock'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-6 text-sm md:text-base font-light text-gray-600 leading-relaxed">
                            <p>
                                {painting.description || "Top notes of calm blue meet chaotic strokes of acrylic. This piece is part of the 'Silence' collection, exploring the gap between thought and expression."}
                            </p>

                            <div className="grid grid-cols-2 gap-y-4 gap-x-8 py-6">
                                <div>
                                    <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Medium</span>
                                    <span className="font-serif text-lg text-gray-900">{painting.medium || 'Acrylic on Canvas'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Dimensions</span>
                                    <span className="font-serif text-lg text-gray-900">{painting.size}</span>
                                </div>
                                <div>
                                    <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Finish</span>
                                    <span className="font-serif text-lg text-gray-900">{painting.finish || 'Matte Varnish'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Authenticity</span>
                                    <span className="font-serif text-lg text-gray-900">Signed Original</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            {isSold ? (
                                <NotifyForm paintingId={painting.id} />
                            ) : (
                                <AddToCartButton painting={painting} />
                            )}
                        </div>

                        <div className="bg-stone-50 p-6 mt-8 space-y-4">
                            <h4 className="font-serif text-lg text-gray-900">Shipping & Returns</h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Ships within 5-7 business days in a reinforced tube or box depending on size.
                                Includes a certificate of authenticity.
                                Returns accepted within 7 days of delivery if damaged.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
