'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowRight, Sparkles, Paintbrush, ShieldCheck, Heart, ExternalLink } from 'lucide-react';
import { getPaintings } from '@/lib/data';
import PaintingCard from '@/components/PaintingCard';
import { cn } from '@/lib/utils';

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
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  useEffect(() => {
    async function fetch() {
      const data = await getPaintings();
      setPaintings(data.slice(0, 3));
      setLoading(false);
    }
    fetch();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">

      {/* 1. IMMERSIVE HERO */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden bg-white">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-100/40 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[0%] right-[-5%] w-[35%] h-[35%] bg-cyan-100/40 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
          <div className="absolute top-[20%] right-[15%] w-[10%] h-[10%] bg-amber-100/30 rounded-full blur-[80px]"></div>

          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale }}
          className="relative z-10 max-w-7xl mx-auto px-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-block px-4 py-1.5 mb-8 text-[10px] uppercase tracking-[0.3em] font-bold text-violet-600 bg-violet-50 rounded-full">
              Hand-painted Originals
            </span>
            <h1 className="text-7xl md:text-9xl lg:text-[11rem] font-serif text-gray-900 tracking-tighter leading-[0.85] mb-8">
              Chaos <br />
              <span className="italic font-light text-gray-300">to</span> <span className="text-gradient">Silence.</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-500 font-light max-w-2xl mx-auto leading-relaxed mb-12">
              Contemporary acrylic masterpieces by Akshath. <br className="hidden md:block" />
              Capture the essence of texture and raw emotion.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              href="/gallery"
              className="group relative px-10 py-5 bg-gray-900 text-white rounded-full font-medium overflow-hidden shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore Gallery <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>
            <Link
              href="/about"
              className="px-10 py-5 bg-white text-gray-900 border border-gray-100 rounded-full font-medium hover:bg-gray-50 transition-all hover:shadow-lg active:scale-95"
            >
              The Artist's Journey
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating Art Teasers */}
        <div className="absolute bottom-10 left-10 hidden lg:block animate-bounce [animation-duration:4s]">
          <div className="w-px h-24 bg-gradient-to-t from-gray-300 to-transparent"></div>
        </div>
      </section>

      {/* 2. EXHIBITION / VALUE SECTION (Bento) */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureItem
              icon={Paintbrush}
              delay={0.1}
              title="Tactile Texture"
              desc="Deep impasto techniques that create physical presence and shadows on every canvas."
            />
            <FeatureItem
              icon={ShieldCheck}
              delay={0.2}
              title="Collector Grade"
              desc="Archival quality materials ensuring your investment lasts a lifetime. Signed & Certified."
            />
            <FeatureItem
              icon={Heart}
              delay={0.3}
              title="Pure Emotion"
              desc="Each stroke is a piece of a story, moving from the artist's studio to your soul."
            />
          </div>
        </div>
      </section>

      {/* 3. FEATURED WORK (The Spotlight) */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <FadeIn direction="right">
              <h2 className="text-5xl md:text-7xl font-serif text-gray-900">
                New <span className="text-gray-300 italic">Releases.</span>
              </h2>
            </FadeIn>
            <FadeIn direction="left">
              <Link href="/gallery" className="group flex items-center gap-3 text-xs uppercase tracking-[0.3em] font-bold text-gray-900 hover:text-violet-600 transition-colors">
                View All Archive <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="aspect-[3/4] bg-gray-50 animate-pulse rounded-3xl"></div>
              ))
            ) : (
              paintings.map((p, i) => (
                <FadeIn key={p.id} delay={i * 0.1}>
                  <PaintingCard painting={p} />
                </FadeIn>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. THE MATISSE SECTION (Visual Quote) */}
      <section className="py-40 md:py-60 bg-[#0f172a] text-white relative overflow-hidden">
        {/* Glowing Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-violet-600/10 blur-[150px]"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <FadeIn>
            <div className="w-12 h-1 bg-violet-500 mx-auto mb-12"></div>
            <h2 className="text-4xl md:text-6xl font-serif leading-tight mb-12 italic">
              "Art should be something like a good armchair in which to rest from physical fatigue."
            </h2>
            <p className="text-xs uppercase tracking-[0.4em] font-bold text-violet-400">— HENRI MATISSE</p>
          </FadeIn>
        </div>
      </section>

      {/* 5. NEWSLETTER / JOIN THE STUDIO (The Interaction) */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

          <div className="relative z-10 space-y-8">
            <FadeIn>
              <h2 className="text-4xl md:text-6xl font-serif leading-tight">Bring high art <br />to your home.</h2>
              <p className="text-violet-100 max-w-xl mx-auto font-light text-lg">
                Subscribe to get early access to new collections and studio updates.
                No spam, just inspiration.
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mt-12 bg-white/10 p-2 rounded-full backdrop-blur-md border border-white/20">
                <input
                  type="email"
                  placeholder="artist@studio.com"
                  className="flex-1 bg-transparent px-6 py-3 text-white placeholder:text-violet-200/50 outline-none"
                />
                <button className="bg-white text-violet-600 px-8 py-3 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-violet-50 transition-all hover:scale-105 active:scale-95 shadow-lg">
                  Join List
                </button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

    </div>
  );
}
