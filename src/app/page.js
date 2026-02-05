'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { getPaintings } from '@/lib/data';
import PaintingCard from '@/components/PaintingCard';

export default function Home() {
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPaintings() {
      const data = await getPaintings();
      setPaintings(data);
      setLoading(false);
    }
    fetchPaintings();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-stone-50/30">

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-20">

        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-stone-100 blur-3xl opacity-60"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-stone-200 blur-3xl opacity-40"></div>
        </div>

        <div className="max-w-screen-xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Left: Text */}
          <div className="space-y-10 z-10 fade-in delay-100">
            <div>
              <h2 className="text-xs md:text-sm font-sans uppercase tracking-[0.3em] text-stone-500 mb-6">
                Original Artwork
              </h2>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-gray-900 leading-[0.9]">
                Pure <br /> <span className="italic text-stone-400">Chaos</span> & <br /> Calm.
              </h1>
            </div>

            <p className="text-lg md:text-xl text-gray-600 font-light max-w-md leading-relaxed">
              Handmade acrylic paintings on canvas by Akshath.
              Each piece is a unique narrative of color and texture.
            </p>

            <div className="flex items-center gap-6 pt-4">
              <Link
                href="#gallery"
                className="group relative px-8 py-4 bg-gray-900 text-white text-xs uppercase tracking-[0.2em] overflow-hidden"
              >
                <span className="relative z-10 group-hover:text-stone-200 transition-colors">Start Collecting</span>
                <div className="absolute inset-0 bg-stone-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out"></div>
              </Link>
              <Link href="/gallery" className="text-xs uppercase tracking-[0.2em] underline underline-offset-4 decoration-stone-300 hover:text-stone-500 transition-colors">
                View Archive
              </Link>
            </div>
          </div>

          {/* Right: Featured Abstract Visual (Placeholder or decorative) */}
          <div className="hidden md:block relative h-[80vh] w-full fade-in delay-300">
            {/* This creates a gallery wall feel */}
            <div className="absolute top-10 right-10 w-64 h-80 bg-stone-200 rotate-3 shadow-2xl"></div>
            <div className="absolute top-20 right-32 w-64 h-80 bg-stone-300 -rotate-2 shadow-2xl z-20"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-96 bg-white border border-stone-100 shadow-xl z-30 flex items-center justify-center p-4">
              <div className="w-full h-full bg-stone-50 flex items-center justify-center">
                <span className="font-serif italic text-stone-400 text-2xl">Akuzie</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">Latest Additions</h2>
              <p className="text-stone-500 font-light max-w-sm">Curated selection of recent works available for acquisition.</p>
            </div>
            <Link href="/gallery" className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest hover:gap-4 transition-all duration-300">
              View All Works <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="aspect-[4/5] bg-stone-100"></div>
                  <div className="h-4 bg-stone-100 w-2/3"></div>
                  <div className="h-3 bg-stone-100 w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-20 gap-x-10">
              {paintings.map((painting, idx) => (
                <div key={painting.id} className="fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                  <PaintingCard painting={painting} />
                </div>
              ))}
            </div>
          )}

          {!loading && paintings.length === 0 && (
            <div className="py-24 text-center border-t border-stone-100 mt-12">
              <h3 className="font-serif text-2xl text-stone-400 italic">Collection updating soon.</h3>
            </div>
          )}

          <div className="mt-20 text-center md:hidden">
            <Link href="/gallery" className="inline-block border border-gray-900 px-8 py-3 text-xs uppercase tracking-widest">
              View All
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy / About Strip */}
      <section className="py-24 bg-stone-900 text-stone-300 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <span className="text-xs uppercase tracking-[0.3em] text-stone-500">The Philosophy</span>
          <p className="text-2xl md:text-4xl font-serif leading-relaxed text-white">
            "Art is not just about what you see, but what you feel. <br className="hidden md:block" />
            Akuzie represents the silence in chaos."
          </p>
        </div>
      </section>

    </div>
  );
}
