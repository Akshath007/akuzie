'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const SparklesCore = ({
    id,
    background,
    minSize,
    maxSize,
    particleDensity,
    className,
    particleColor,
}) => {
    return (
        <div className={cn("absolute inset-0 h-full w-full", className)}>
            {/* Simplified for performance: Just CSS dots or standard particles if needed later. 
           For now, returning a subtle gradient overlay to avoid heavy canvas logic without full setup. */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-violet-500/5 to-white/0 opacity-50"></div>
        </div>
    );
};

export const HeroParallax = ({ products }) => {
    return (
        <div className="flex flex-col self-auto overflow-hidden antialiased relative">
            <Header />
        </div>
    );
};

export const Header = () => {
    return (
        <div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full left-0 top-0">
            <h1 className="text-2xl md:text-7xl font-bold dark:text-white">
                The Art of <br /> <span className="text-violet-600">Expression.</span>
            </h1>
            <p className="max-w-2xl text-base md:text-xl mt-8 dark:text-neutral-200">
                Akuzie is a curated collection of handmade acrylic paintings.
                Each piece is a unique exploration of color, texture, and emotion.
            </p>
        </div>
    );
};
