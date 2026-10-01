'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { useLanguage } from '@/context/LanguageContext';

interface ProductSectionProps {
  title: string;
  subtitle: string;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  badge?: string;
  emptyMessage?: string;
  tabs?: ReactNode;
}

export function ProductSection({
  title,
  subtitle,
  products,
  onSelectProduct,
  badge,
  emptyMessage,
  tabs,
}: ProductSectionProps) {
  const { t, isRTL } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll back to start when filtered products change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [products]);

  const scroll = (direction: 'prev' | 'next') => {
    if (scrollContainerRef.current) {
      // In RTL: scrolling right goes to prev/next based on direction
      const multiplier = isRTL 
        ? (direction === 'next' ? -340 : 340)
        : (direction === 'next' ? 340 : -340);
      scrollContainerRef.current.scrollBy({ left: multiplier, behavior: 'smooth' });
    }
  };

  if (products.length === 0) {
    if (!emptyMessage && !tabs) return null;
    return (
      <section className="mb-9 sm:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-stone-950 tracking-tight">{title}</h2>
              {badge && (
                <span className="text-[11px] font-bold text-[#b8871e] uppercase tracking-wider">
                  · {badge}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs sm:text-sm text-stone-500">{subtitle}</p>
          </div>
        </div>

        {/* Tabs navigation */}
        {tabs && (
          <div className="mb-6">
            {tabs}
          </div>
        )}

        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-stone-200/80 text-stone-500 text-sm">
          {emptyMessage || t.noProductsAvailable}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-9 sm:mb-12">
      {/* Section Header */}
      <div className="mb-4 sm:mb-5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-stone-950 tracking-tight">
            {title}
          </h2>
          {badge && (
            <span className="text-[11px] font-bold text-[#b8871e] uppercase tracking-wider">
              · {badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs sm:text-sm text-stone-500">
          {subtitle}
        </p>
      </div>

      {/* Tabs navigation */}
      {tabs && (
        <div className="mb-6">
          {tabs}
        </div>
      )}

      {/* Horizontal Carousel with navigation buttons on extreme sides */}
      <div className="relative group/carousel -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {/* Extreme Left / Start Navigation Button */}
        <button
          onClick={() => scroll('prev')}
          aria-label={t.previous}
          className="absolute start-1 sm:start-2 md:start-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-stone-200/90 bg-white/95 text-stone-900 hover:bg-stone-950 hover:text-white hover:border-stone-950 transition-all flex items-center justify-center shadow-lg cursor-pointer active:scale-90"
        >
          {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        {/* Extreme Right / End Navigation Button */}
        <button
          onClick={() => scroll('next')}
          aria-label={t.next}
          className="absolute end-1 sm:end-2 md:end-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-stone-200/90 bg-white/95 text-stone-900 hover:bg-stone-950 hover:text-white hover:border-stone-950 transition-all flex items-center justify-center shadow-lg cursor-pointer active:scale-90"
        >
          {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        <div 
          ref={scrollContainerRef}
          className="flex gap-3.5 sm:gap-4 lg:gap-5 overflow-x-auto pb-5 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {products.map(product => (
            <div 
              key={product.id}
              className="w-[185px] xs:w-[205px] sm:w-[225px] shrink-0 snap-start flex flex-col transition-transform duration-200"
            >
              <ProductCard 
                product={product} 
                onSelect={onSelectProduct} 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

