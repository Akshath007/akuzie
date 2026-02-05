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

    if (!images || images.length === 0) {
        return (
            <div className="relative aspect-[3/4] md:aspect-[4/5] bg-stone-50 w-full shadow-sm flex items-center justify-center text-stone-300 font-serif italic">
                No Preview
            </div>
        );
    }

    return (
        <div className="space-y-6 select-none">
            {/* Main Image Area */}
            <div className="relative aspect-[3/4] md:aspect-[4/5] bg-stone-50 w-full shadow-sm overflow-hidden bg-white group">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mainIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full h-full"
                    >
                        <Image
                            src={images[mainIndex]}
                            alt={`${title} - View ${mainIndex + 1}`}
                            fill
                            className="object-cover"
                            priority={mainIndex === 0}
                            sizes="(max-width: 768px) 100vw, 70vw"
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Slideshow Controls */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/20 active:scale-95"
                            aria-label="Previous Image"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/20 active:scale-95"
                            aria-label="Next Image"
                        >
                            <ChevronRight size={24} />
                        </button>

                        {/* Slide Indicator */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all duration-300 shadow-sm",
                                        idx === mainIndex ? "bg-white scale-125" : "bg-white/50"
                                    )}
                                />
                            ))}
                        </div>
                    </>
                )}

                {isSold && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none z-10">
                        <span className="bg-stone-900 text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.3em] shadow-xl">
                            Sold Out
                        </span>
                    </div>
                )}
            </div>

            {/* Thumbnails (Only if > 1 image) */}
            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none px-1">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setMainIndex(idx)}
                            className={cn(
                                "relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 border-2 transition-all duration-300 rounded-lg overflow-hidden",
                                mainIndex === idx
                                    ? "border-violet-600 opacity-100 ring-2 ring-violet-100"
                                    : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-200"
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
        </div>
    );
}
