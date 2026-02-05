'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowDown } from 'lucide-react';
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
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center bg-gray-50 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-100 via-gray-50 to-white opacity-70"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-1000">
          <h2 className="text-sm md:text-base uppercase tracking-[0.3em] text-gray-500">
            Handmade Acrylic on Canvas
          </h2>
          <h1 className="text-5xl md:text-7xl font-light text-gray-900 leading-tight">
            Akuzie
          </h1>
          <p className="text-xl md:text-2xl font-light text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Where colors breathe and silence speaks.
          </p>
          <div className="pt-8">
            <Link
              href="#gallery"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-gray-900 hover:text-gray-600 transition-colors"
            >
              Explore Collection
              <ArrowDown size={16} className="animate-bounce" />
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light text-gray-900 mb-4">Latest Works</h2>
            <div className="w-24 h-px bg-gray-200 mx-auto"></div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {paintings.map((painting) => (
                <PaintingCard key={painting.id} painting={painting} />
              ))}
            </div>
          )}

          {!loading && paintings.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No paintings available at the moment.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
