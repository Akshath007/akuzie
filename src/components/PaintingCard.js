'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { formatPrice, PAINTING_STATUS, cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

export default function PaintingCard({ painting }) {
    const isSold = painting.status === PAINTING_STATUS.SOLD;

    return (
        <motion.div
            whileHover={{ y: -10 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="group block relative"
        >
            <Link href={`/painting/${painting.id}`} className="cursor-pointer">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl md:rounded-3xl bg-gray-50 mb-3 md:mb-6 group-hover:shadow-[0_20px_50px_rgba(124,58,237,0.15)] transition-all duration-700">

                    {/* Main Image */}
                    {painting.images && painting.images[0] ? (
                        <Image
                            src={painting.images[0]}
                            alt={painting.title}
                            fill
                            className={cn(
                                "object-cover transition-transform duration-[1.2s] cubic-bezier(0.22, 1, 0.36, 1) group-hover:scale-110",
                                isSold ? "grayscale opacity-80" : ""
                            )}
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-300 font-serif italic text-xs">No Preview</div>
                    )}

                    {/* Dark Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500"></div>

                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 md:top-6 md:left-6 z-10">
                        {isSold ? (
                            <span className="bg-white/90 backdrop-blur-md px-2 py-1 md:px-4 md:py-2 rounded-full text-[8px] md:text-[10px] uppercase tracking-widest font-bold text-gray-500 shadow-sm border border-white/20">
                                Sold
                            </span>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <span className="hidden md:inline-block opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 bg-violet-600 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold text-white shadow-lg">
                                    Collector's Item
                                </span>

                            </div>
                        )}
                    </div>

                    {/* Hover "View" Button Icon - Hidden on mobile, visible on desktop hover */}
                    <div className="hidden md:block absolute bottom-6 right-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-10">
                        <div className="bg-white p-4 rounded-full shadow-2xl text-violet-600 transition-transform active:scale-90">
                            <ExternalLink size={20} strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="flex flex-col items-start md:items-center text-left md:text-center space-y-1 md:space-y-2 px-1 md:px-4 transition-transform group-hover:translate-y-[-4px] duration-500">
                    <h3 className="text-sm md:text-2xl font-serif text-gray-900 leading-tight line-clamp-2">
                        {painting.title}
                    </h3>

                    <div className="hidden md:flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
                        <span>{painting.medium || 'Acrylic'}</span>
                        <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                        <span>{painting.size || 'Custom Size'}</span>
                    </div>

                    <div className="pt-1 md:pt-2">
                        {isSold ? (
                            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-300 line-through">
                                {formatPrice(painting.price)}
                            </span>
                        ) : (
                            <p className="text-sm md:text-lg font-sans font-bold text-gray-900 md:text-transparent md:bg-clip-text md:bg-gradient-to-r md:from-violet-600 md:to-indigo-600">
                                {formatPrice(painting.price)}
                            </p>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
