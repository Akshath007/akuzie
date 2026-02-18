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
        <div className="flex flex-col-reverse md:flex-row gap-4 select-none h-full max-h-[80vh]">
            {/* Thumbnails (Vertical on Desktop, Horizontal on Mobile) */}
            {images.length > 1 && (
                <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto scrollbar-none px-1 md:py-1 md:w-20 lg:w-24 shrink-0">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onMouseEnter={() => setMainIndex(idx)} // Amazon style: Hover to switch
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
            <div className="relative flex-grow bg-white rounded-xl overflow-hidden border border-gray-100 group">
                {/* Image Container with contain/cover handling */}
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

                    {/* Zoom/Expand Instruction (Optional overlay) */}
                    <div className="absolute inset-0 pointer-events-none group-hover:bg-black/5 transition-colors duration-300" />
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
