'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageGallery({ images, title, isSold }) {
    const [mainIndex, setMainIndex] = useState(0);

    const nextImage = () => {
        setMainIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setMainIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const [lensProps, setLensProps] = useState({ show: false, x: 0, y: 0, bgX: 0, bgY: 0 });

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = e.pageX - left - window.scrollX;
        const y = e.pageY - top - window.scrollY;

        // Calculate lens position (restricted within container)
        const lensSize = 150;
        const lX = Math.max(0, Math.min(x - lensSize / 2, width - lensSize));
        const lY = Math.max(0, Math.min(y - lensSize / 2, height - lensSize));

        // Calculate background position for zoom
        const bgX = (x / width) * 100;
        const bgY = (y / height) * 100;

        setLensProps({ show: true, x: lX, y: lY, bgX, bgY });
    };

    const handleMouseLeave = () => setLensProps({ ...lensProps, show: false });

    if (!images || images.length === 0) {
        return (
            <div className="relative aspect-[3/4] md:aspect-[4/5] bg-stone-50 w-full shadow-sm flex items-center justify-center text-stone-300 font-serif italic">
                No Preview
            </div>
        );
    }

    return (
        <div className="flex flex-col-reverse md:flex-row gap-4 select-none h-full max-h-[80vh]">
            {/* Thumbnails (Vertical on Desktop, Horizontal on Mobile) */}
            {images.length > 1 && (
                <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto scrollbar-none px-1 md:py-1 md:w-20 lg:w-24 shrink-0">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onMouseEnter={() => setMainIndex(idx)}
                            onClick={() => setMainIndex(idx)}
                            className={cn(
                                "relative w-16 h-16 md:w-full md:aspect-square flex-shrink-0 border transition-all duration-200 rounded-md overflow-hidden",
                                mainIndex === idx
                                    ? "border-violet-600 ring-1 ring-violet-600 shadow-md"
                                    : "border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100"
                            )}
                        >
                            <Image
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                fill
                                className="object-cover"
                                sizes="96px"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Main Image Area */}
            <div
                className="relative flex-grow bg-white rounded-xl overflow-hidden border border-gray-100 group cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Image Container */}
                <div className="relative w-full h-[50vh] md:h-full min-h-[400px] md:min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mainIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={images[mainIndex]}
                                alt={`${title} - View ${mainIndex + 1}`}
                                fill
                                className="object-contain p-2"
                                priority={mainIndex === 0}
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Magnifier Lens (Desktop Only) */}
                    <AnimatePresence>
                        {lensProps.show && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute hidden md:block z-50 pointer-events-none rounded-full border-2 border-white shadow-2xl overflow-hidden bg-white"
                                style={{
                                    width: 180,
                                    height: 180,
                                    left: lensProps.x,
                                    top: lensProps.y,
                                    backgroundImage: `url(${images[mainIndex]})`,
                                    backgroundSize: '400%',
                                    backgroundPosition: `${lensProps.bgX}% ${lensProps.bgY}%`,
                                    backgroundRepeat: 'no-repeat'
                                }}
                            />
                        )}
                    </AnimatePresence>

                    <div className="absolute inset-0 pointer-events-none group-hover:bg-black/[0.02] transition-colors duration-300" />
                </div>

                {/* Mobile Slide Controls */}
                <div className="absolute inset-0 flex items-center justify-between p-4 md:hidden pointer-events-none">
                    <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="pointer-events-auto bg-white/80 backdrop-blur text-gray-800 p-2 rounded-full shadow-lg opacity-70 hover:opacity-100"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="pointer-events-auto bg-white/80 backdrop-blur text-gray-800 p-2 rounded-full shadow-lg opacity-70 hover:opacity-100"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Sold Overlay */}
                {isSold && (
                    <div className="absolute top-4 right-4 z-10">
                        <span className="bg-stone-900 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest shadow-xl rounded-sm">
                            Sold Out
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
