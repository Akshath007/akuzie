import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPainting, getPaintings } from '@/lib/data';
import { formatPrice, PAINTING_STATUS } from '@/lib/utils';
import AddToCartButton from '@/components/AddToCartButton';
import NotifyForm from '@/components/NotifyForm';
import Accordion from '@/components/Accordion';
import PaintingCard from '@/components/PaintingCard';
import ImageGallery from '@/components/ImageGallery';
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

    // Fetch "Related" (Just 3 random other paintings for now)
    const allPaintings = await getPaintings();
    const relatedPaintings = allPaintings
        .filter(p => p.id !== painting.id && p.status === PAINTING_STATUS.AVAILABLE)
        .sort(() => 0.5 - Math.random()) // Random shuffle
        .slice(0, 3);

    const isSold = painting.status === PAINTING_STATUS.SOLD;

    return (
        <div className="min-h-screen pt-32 pb-24 px-4 md:px-8 max-w-[1600px] mx-auto">

            {/* Back Link */}
            <Link href="/gallery" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-gray-900 mb-12 transition-colors">
                <ArrowLeft size={14} /> Back to Archive
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 mb-16">

                {/* Left: Image (Sticky) - Amazon style often gives more width to image on desktop */}
                <div className="lg:col-span-7 xl:col-span-7">
                    <div className="sticky top-24">
                        <ImageGallery
                            images={painting.images}
                            title={painting.title}
                            isSold={isSold}
                        />
                    </div>
                </div>

                {/* Right: Details */}
                <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-start lg:py-4 fade-in delay-200">

                    <div className="border-b border-stone-200 pb-8 mb-8">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 leading-tight mb-4">
                            {painting.title}
                        </h1>
                        <div className="flex items-center justify-between">
                            <p className="text-2xl font-light text-gray-900 font-sans">
                                {formatPrice(painting.price)}
                            </p>
                            <span className="text-[10px] uppercase tracking-widest text-stone-500">
                                {painting.size || 'Original'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <p className="text-stone-600 font-light leading-relaxed">
                            {painting.description || "An original exploration of color and form. This piece is signed by the artist and comes ready to hang."}
                        </p>

                        <div className="pt-4">
                            {isSold ? (
                                <NotifyForm paintingId={painting.id} />
                            ) : (
                                <AddToCartButton painting={painting} />
                            )}
                        </div>

                        {/* Accordions */}
                        <div className="pt-8">
                            <Accordion title="Details" defaultOpen={true}>
                                <ul className="space-y-2 list-none">
                                    <li><span className="text-stone-400 mr-2">Medium:</span> {painting.medium || 'Acrylic on Canvas'}</li>
                                    <li><span className="text-stone-400 mr-2">Size:</span> {painting.size}</li>
                                    <li><span className="text-stone-400 mr-2">Finish:</span> {painting.finish || 'Matte Varnish'}</li>
                                    <li><span className="text-stone-400 mr-2">Authenticity:</span> Hand-signed on front/back</li>
                                </ul>
                            </Accordion>
                            <Accordion title="Shipping & Returns">
                                <p className="mb-2"><strong>Global Shipping:</strong> We ship worldwide using specialized art couriers. Allow 5–7 business days for preparation.</p>
                                <p><strong>Returns:</strong> Accepted within 7 days of delivery only if the artwork arrives damaged. Please document packaging upon arrival.</p>
                            </Accordion>
                            <Accordion title="Care Guide">
                                <p>Keep out of direct sunlight to preserve color vibrancy. Dust gently with a dry microfiber cloth. Do not use water or cleaning solutions.</p>
                            </Accordion>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Works */}
            {relatedPaintings.length > 0 && (
                <div className="border-t border-stone-100 pt-24">
                    <h2 className="text-3xl font-serif text-gray-900 mb-12">You May Also Like</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {relatedPaintings.map(p => (
                            <PaintingCard key={p.id} painting={p} />
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}
