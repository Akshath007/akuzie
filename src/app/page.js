'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Sparkles, Paintbrush, ShieldCheck } from 'lucide-react';
import { getPaintings } from '@/lib/data';
import PaintingCard from '@/components/PaintingCard';
import { cn } from '@/lib/utils';

// --- COMPONENTS ---

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col items-center text-center group"
  >
    <div className="p-3 bg-violet-50 text-violet-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
      <Icon size={24} />
    </div>
    <h3 className="font-serif text-lg text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
  </motion.div>
);

const SectionHeading = ({ children, subtitle }) => (
  <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
    <span className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600 bg-violet-50 px-3 py-1 rounded-full">{subtitle}</span>
    <h2 className="text-4xl md:text-5xl font-serif text-gray-900 leading-tight">{children}</h2>
  </div>
);

export default function Home() {
  const [paintings, setPaintings] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    async function fetch() {
      const data = await getPaintings();
      setPaintings(data.slice(0, 3));
    }
    fetch();
  }, []);

  const { scrollYProgress } = useScroll({ target: containerRef });
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen">

      {/* 1. HERO SECTION (Redesigned) */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white pt-20">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-100/50 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-100/50 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-white/50 backdrop-blur-sm text-xs font-medium text-gray-600 mb-6 hover:bg-white transition-colors cursor-default">
              <Sparkles size={12} className="text-amber-400" />
              New Collection: "Ethereal Dreams" is live
            </span>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-gray-900 tracking-tight leading-[0.9] mb-6">
              Modern <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-500 italic pr-4">Artistry.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-light max-w-xl mx-auto leading-relaxed">
              Curated handmade acrylic paintings that breathe life into your space.
              Minimalist, abstract, and profoundly expressive.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              href="/gallery"
              className="px-8 py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all hover:scale-105 shadow-xl shadow-gray-200 flex items-center gap-2"
            >
              Explore Gallery <ArrowRight size={16} />
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-colors"
            >
              Meet Akshath
            </Link>
          </motion.div>

          {/* Hero Image Collage */}
          <motion.div
            style={{ y }}
            className="mt-20 relative w-full max-w-5xl mx-auto aspect-[16/9] hidden md:block"
          >
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent z-20"></div>
            <div className="grid grid-cols-3 gap-4 transform rotate-6 scale-110 opacity-80 hover:opacity-100 hover:rotate-0 hover:scale-100 transition-all duration-1000 ease-out">
              {[1, 2, 3].map((i) => (
                <div key={i} className={cn("rounded-2xl overflow-hidden shadow-2xl bg-gray-100 aspect-[3/4]", i === 1 ? "mt-12" : "")}>
                  {paintings[i - 1]?.images?.[0] && (
                    <Image
                      src={paintings[i - 1].images[0]}
                      alt="Art"
                      width={400}
                      height={600}
                      className="object-cover w-full h-full hover:scale-110 transition-transform duration-700"
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURES GRID */}
      <section className="py-24 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Paintbrush}
              title="100% Handmade"
              desc="Every stroke is applied by hand using premium acrylics on gallery-wrapped canvas."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Authenticity Guaranteed"
              desc="Each piece comes with a signed Certificate of Authenticity."
            />
            <FeatureCard
              icon={Sparkles}
              title="Custom Commissions"
              desc="Looking for something specific? We accept requests for custom sizes and palettes."
            />
          </div>
        </div>
      </section>

      {/* 3. LATEST WORK */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeading subtitle="The Collection">
            Latest <span className="italic text-gray-400">Masterpieces</span>
          </SectionHeading>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {paintings.map((painting) => (
              <div key={painting.id} className="group cursor-pointer">
                <PaintingCard painting={painting} />
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <Link href="/gallery" className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest border-b border-gray-900 pb-1 hover:text-violet-600 hover:border-violet-600 transition-colors">
              View Complete Archive <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. NEWSLETTER / CTA */}
      <section className="py-32 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[100px]"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 space-y-8">
          <h2 className="text-4xl md:text-6xl font-serif">Join the Collector's List</h2>
          <p className="text-gray-400 font-light text-lg max-w-2xl mx-auto">
            Be the first to know about new releases, behind-the-scenes content, and exclusive studio sales.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto pt-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 backdrop-blur-sm"
            />
            <button className="bg-white text-gray-900 px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
