import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { useLanguage } from '../context/LanguageContext';

interface ProductSectionProps {
  title: string;
  subtitle: string;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  badge?: string;
  emptyMessage?: string;
}

export function ProductSection({
  title,
  subtitle,
  products,
  onSelectProduct,
  badge,
  emptyMessage,
}: ProductSectionProps) {
  const { t, isRTL } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    if (!emptyMessage) return null;
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
        <div className="text-center py-10 px-4 bg-white rounded-2xl border border-stone-200/80 text-stone-500 text-sm">
          {emptyMessage}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-9 sm:mb-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-5 gap-3">
        <div>
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

        {/* Carousel navigation buttons with 44px touch targets */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-stone-400 hidden sm:inline mx-1">{t.scrollToBrowse}</span>
          <button
            onClick={() => scroll('prev')}
            aria-label={t.previous}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border border-stone-200 bg-white hover:bg-stone-950 hover:text-white hover:border-stone-950 transition-all flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
          >
            {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <button
            onClick={() => scroll('next')}
            aria-label={t.next}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border border-stone-200 bg-white hover:bg-stone-950 hover:text-white hover:border-stone-950 transition-all flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
          >
            {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Horizontal Carousel with 16px-20px side gutters */}
      <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
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

