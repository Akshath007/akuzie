'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getPaintings } from '@/lib/data';
import PaintingCard from '@/components/PaintingCard';
import Image from 'next/image';

export default function Home() {
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPaintings() {
      const data = await getPaintings();
      setPaintings(data.slice(0, 6)); // Limit to first 6 for home
      setLoading(false);
    }
    fetchPaintings();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">

      {/* 
        HERO SECTION 
        - Mobile: Image top, Text bottom (stacked)
        - Desktop: Text left, Image right (2 columns)
        - Full height on desktop
      */}
      <section className="relative w-full pt-16 md:pt-0 md:h-screen flex items-center bg-[#fafafa]">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center h-full">

          {/* Left Content (Text) */}
          <div className="order-2 md:order-1 flex flex-col justify-center space-y-8 md:space-y-12 pb-12 md:pb-0 fade-in delay-100">
            <div>
              <h2 className="text-xs font-sans uppercase tracking-[0.25em] text-gray-500 mb-6 font-medium">
                Handmade Collection
              </h2>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-gray-900 leading-[1.1] mb-6">
                Silence in <br />
                <span className="italic text-gray-400">Chaos.</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 font-light max-w-md leading-relaxed">
                Original acrylic paintings on canvas. <br className="hidden md:block" />
                A curated exploration of texture, form, and emotion.
              </p>
            </div>

            <div className="flex items-center gap-8">
              <Link
                href="/gallery"
                className="group relative inline-flex items-center justify-center px-10 py-5 bg-gray-900 text-white text-xs uppercase tracking-[0.2em] overflow-hidden transition-all hover:bg-gray-800"
              >
                <span className="relative z-10 transition-colors">View Gallery</span>
              </Link>
              <Link href="/about" className="text-xs uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 transition-colors">
                The Artist
              </Link>
            </div>
          </div>

          {/* Right Content (Image) */}
          <div className="order-1 md:order-2 h-[50vh] md:h-full w-full relative bg-gray-100 overflow-hidden fade-in delay-200">
            {/* 
                  Using a placeholder or featured image. 
                  In a real scenario, this would be a specific featured painting URL. 
               */}
            <div className="absolute inset-0 md:inset-x-0 md:top-[15%] md:bottom-[15%] md:left-[10%] bg-white shadow-2xl p-4 md:p-6 rotate-1 hover:rotate-0 transition-transform duration-700 ease-out">
              <div className="w-full h-full relative bg-stone-200 overflow-hidden">
                {paintings.length > 0 && paintings[0].images && (
                  <Image
                    src={paintings[0].images[0]}
                    alt="Featured Artwork"
                    fill
                    className="object-cover"
                    priority
                  />
                )}
                {!paintings.length && <div className="w-full h-full bg-stone-200"></div>}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 
        GALLERY PREVIEW SECTION 
        - Strict Grid: 1 col (mobile), 2 col (tablet), 3 col (desktop)
        - Clean spacing
      */}
      <section id="gallery" className="py-20 md:py-32 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-serif text-gray-900 mb-6 leading-tight">Latest Acquisitions.</h2>
              <p className="text-gray-500 font-light text-lg">Selected works currently available for purchase.</p>
            </div>
            <Link href="/gallery" className="hidden md:flex items-center gap-3 text-xs uppercase tracking-widest text-gray-900 hover:text-gray-600 transition-all group">
              View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[4/5] bg-gray-100 animate-pulse"></div>
                  <div className="h-4 bg-gray-100 w-2/3 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8 md:gap-x-12">
              {paintings.map((painting, idx) => (
                <div key={painting.id} className="fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                  <PaintingCard painting={painting} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-20 text-center md:hidden">
            <Link href="/gallery" className="inline-block border-b border-gray-900 pb-1 text-sm uppercase tracking-widest">
              View All Works
            </Link>
          </div>
        </div>
      </section>

      {/* 
        PHILOSOPHY STRIP 
        - Minimal, centered text 
      */}
      <section className="py-24 md:py-40 bg-[#fafafa] px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="w-px h-16 bg-gray-300 mx-auto mb-8"></div>
          <p className="text-2xl md:text-4xl font-serif leading-relaxed text-gray-900">
            "We don't make mistakes, just happy little accidents."
          </p>
          <p className="text-sm font-sans uppercase tracking-widest text-gray-500">— Bob Ross & Akshath</p>
        </div>
      </section>

    </div>
  );
}
