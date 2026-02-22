'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles, Paintbrush, ShieldCheck, Heart, ExternalLink } from 'lucide-react';
import { getPaintingsCached } from '@/lib/data';
import PaintingCard from '@/components/PaintingCard';
import { cn, PAINTING_STATUS } from '@/lib/utils';
import Hero from '@/components/Hero';
import Skeleton from '@/components/Skeleton';

// --- ANIMATED COMPONENTS ---

const FadeIn = ({ children, delay = 0, direction = "up" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
        x: direction === "left" ? 40 : direction === "right" ? -40 : 0
      }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

const FeatureItem = ({ icon: Icon, title, desc, delay }) => (
  <FadeIn delay={delay}>
    <div className="group relative p-8 rounded-3xl bg-white border border-gray-100 hover:border-violet-200 transition-all duration-500 hover:shadow-2xl hover:shadow-violet-100/50">
      <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-500">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-serif text-gray-900 mb-3">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed font-light">{desc}</p>

      {/* Subtle corner accent */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Sparkles size={14} className="text-violet-200" />
      </div>
    </div>
  </FadeIn>
);

export default function Home() {
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      // Fetch only 6 items per category via cached API (server-side LRU cache)
      // Extra buffer of 6 to account for sold items being filtered out
      const [paintingsData, crochetData] = await Promise.all([
        getPaintingsCached('painting', 6),
        getPaintingsCached('crochet', 6)
      ]);

      if (cancelled) return;

      // Filter out sold items
      const availablePaintings = paintingsData.filter(p => p.status !== 'sold');
      const availableCrochet = crochetData.filter(p => p.status !== 'sold');

      const topPaintings = availablePaintings.slice(0, 3);
      const topCrochet = availableCrochet.slice(0, 3);

      // Interleave: [P, C, P, C, P, C]
      const mixed = [];
      const maxLength = Math.max(topPaintings.length, topCrochet.length);

      for (let i = 0; i < maxLength; i++) {
        if (topPaintings[i]) mixed.push(topPaintings[i]);
        if (topCrochet[i]) mixed.push(topCrochet[i]);
      }

      setPaintings(mixed);
      setLoading(false);
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);


  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">

      {/* 1. HERO SECTION */}
      <Hero />

      {/* 2. FEATURED WORK (The Spotlight) */}
      <section id="new-releases" className="pt-24 pb-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <FadeIn direction="right">
              <h2 className="text-5xl md:text-7xl font-serif text-gray-900">
                New <span className="text-gray-300 italic">Releases.</span>
              </h2>
            </FadeIn>
            <FadeIn direction="left">
              <Link href="/gallery" className="group flex items-center gap-3 text-xs uppercase tracking-[0.3em] font-bold text-gray-900 hover:text-violet-600 transition-colors">
                View Gallery <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </FadeIn>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-12 md:gap-y-24">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="flex flex-col gap-4">
                  <Skeleton className="aspect-[3/4] rounded-2xl md:rounded-3xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : (
              paintings.map((p, i) => (
                <FadeIn key={p.id} delay={i * 0.1}>
                  <PaintingCard painting={p} priority={i < 2} />
                </FadeIn>
              ))
            )}
          </div>
        </div>
      </section>



    </div>
  );
}
