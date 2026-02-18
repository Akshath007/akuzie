'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';

export default function Hero() {
    const containerRef = useRef(null);

    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: (custom) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                delay: custom * 0.2,
                ease: [0.22, 1, 0.36, 1]
            }
        })
    };

    return (
        <section ref={containerRef} className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden bg-[#0a0a0a]">

            {/* --- Background Effects --- */}
            {/* Deep Charcoal Gradient Base */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#fafafa] z-10 pointer-events-none"></div>

            {/* Animated Glow Blobs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600 rounded-full blur-[120px] opacity-30"
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[100px] opacity-20"
            />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>

            {/* --- Main Content --- */}
            <div className="relative z-20 max-w-5xl mx-auto px-6 text-center text-white">

                {/* Headline */}
                <motion.h1
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    className="text-5xl md:text-7xl lg:text-8xl font-sans font-bold tracking-tight mb-8 leading-[1.1]"
                >
                    <span className="inline-block bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        Akuzie
                    </span>
                    <span className="block text-2xl md:text-4xl font-light text-gray-400 mt-2 font-serif italic">
                        Where Everything Hits Different
                    </span>
                </motion.h1>

                {/* Subtext */}
                <motion.p
                    custom={2}
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    className="text-lg md:text-xl text-gray-400 font-light max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    A dynamic digital space that connects it all in one place.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    custom={3}
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button onClick={() => document.getElementById('new-releases')?.scrollIntoView({ behavior: 'smooth' })} className="group relative px-8 py-4 rounded-full bg-white text-black font-medium text-sm tracking-wide overflow-hidden transition-transform hover:scale-105 active:scale-95">
                        <span className="relative z-10 flex items-center gap-2">
                            Explore Collection <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-200 to-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>

                    <button className="px-8 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white font-medium text-sm tracking-wide hover:bg-white/10 transition-colors">
                        Our Story
                    </button>
                </motion.div>

            </div>

            {/* Floating Glassmorphism Cards (Decor Elements) */}
            <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute top-1/4 left-[5%] hidden lg:block p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md rotate-[-6deg]"
            >
                <Zap size={24} className="text-yellow-400 mb-2" />
                <div className="h-2 w-24 bg-white/20 rounded-full mb-2"></div>
                <div className="h-2 w-16 bg-white/10 rounded-full"></div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.7 }}
                className="absolute bottom-1/4 right-[5%] hidden lg:block p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md rotate-[6deg]"
            >
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-violet-500 to-blue-500 mb-2"></div>
                <div className="h-2 w-20 bg-white/20 rounded-full"></div>
            </motion.div>

        </section>
    );
}
