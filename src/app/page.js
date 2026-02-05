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
  const [currentSlide, setCurrentSlide] = useState(0);
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
      setPaintings(data.slice(0, 6));
      setLoading(false);
    }
    fetch();
  }, []);

  // Slideshow logic
  useEffect(() => {
    if (paintings.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % paintings.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [paintings]);

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">

      {/* 1. IMMERSIVE HERO WITH SLIDESHOW */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Background Slideshow */}
        <div className="absolute inset-0 z-0">
          {paintings.length > 0 ? (
            paintings.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: i === currentSlide ? 0.4 : 0 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0"
              >
                {p.images?.[0] && (
                  <Image
                    src={p.images[0]}
                    alt=""
                    fill
                    className="object-cover"
                    priority={i === 0}
                  />
                )}
              </motion.div>
            ))
          ) : (
            <div className="absolute inset-0 bg-stone-900 opacity-50"></div>
          )}

          {/* Overlays for readability and depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-10"></div>
          <div className="absolute inset-0 bg-black/20 z-10 backdrop-blur-[2px]"></div>
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale }}
          className="relative z-20 max-w-7xl mx-auto px-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-block px-4 py-1.5 mb-8 text-[10px] uppercase tracking-[0.3em] font-bold text-white bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              Hand-painted Originals
            </span>
            <h1 className="text-7xl md:text-9xl lg:text-[11.5rem] font-serif text-white tracking-tighter leading-[0.85] mb-12 drop-shadow-2xl">
              Chaos <br />
              <span className="italic font-light text-gray-300">to</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-300">Silence.</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              href="/gallery"
              className="group relative px-10 py-5 bg-white text-black rounded-full font-bold overflow-hidden shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2 uppercase tracking-widest text-xs">
                Explore Gallery <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="/about"
              className="px-10 py-5 bg-transparent text-white border border-white/30 backdrop-blur-md rounded-full font-bold hover:bg-white/10 transition-all hover:shadow-lg active:scale-95 uppercase tracking-widest text-xs"
            >
              The Artist
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-px h-12 bg-gradient-to-b from-white to-transparent"
          />
        </div>
      </section>

      {/* 2. EXHIBITION / VALUE SECTION REMOVED AS REQUESTED */}

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
