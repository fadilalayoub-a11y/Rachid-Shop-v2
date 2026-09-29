import { useState, useMemo, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Product } from '../types';
import { ChevronLeft, ChevronRight, Sparkles, ArrowUpRight } from 'lucide-react';
import { getLocalizedProductName } from '../utils/productLocalization';

interface FreshPicksSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onViewAll?: () => void;
}

export function FreshPicksSection({ products, onSelectProduct, onViewAll }: FreshPicksSectionProps) {
  const { language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<'all' | 'premium' | 'trending'>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const title = language === 'ar' 
    ? 'أحدث التشكيلات الحصرية' 
    : language === 'fr' 
      ? 'Dernières Nouveautés Exclusives' 
      : 'Fresh picks have just dropped for you.';

  const subtitle = language === 'ar'
    ? 'تصاميم مختارة بعناية لأناقة يومية متكاملة، سهولة في التنسيق، وجودة تدوم طويلاً.'
    : language === 'fr'
      ? 'Des coupes soigneusement sélectionnées pour un confort quotidien et une allure raffinée.'
      : 'Thoughtfully selected styles designed for everyday comfort, effortless layering, and timeless appeal.';

  const viewAllText = language === 'ar' ? 'عرض الكل' : language === 'fr' ? 'Voir Tout' : 'View All';

  // Filter products based on selected tab
  const displayProducts = useMemo(() => {
    if (products.length === 0) return [];
    if (activeFilter === 'premium') {
      return products.filter((p) => p.style === 'old_money' || p.style === 'classic' || p.price > 300);
    }
    if (activeFilter === 'trending') {
      return products.filter((p) => p.isTrending || p.badge === 'trendy' || p.badge === 'best_seller' || p.style === 'streetwear');
    }
    return products;
  }, [products, activeFilter]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-6 border-b border-stone-200/80 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-950 tracking-tight">
            {title}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-600 max-w-xl">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-full border border-stone-200/80">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-stone-950 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              {language === 'ar' ? 'الكل' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('premium')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'premium'
                  ? 'bg-stone-950 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              {language === 'ar' ? 'فاخر (Premium)' : 'Premium'}
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('trending')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'trending'
                  ? 'bg-stone-950 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              {language === 'ar' ? 'الأكثر طلباً' : 'Trending'}
            </button>
          </div>

          {/* View All & Arrow Controls */}
          <div className="flex items-center gap-2">
            {onViewAll && (
              <button
                type="button"
                onClick={onViewAll}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-stone-900 hover:text-stone-600 transition-colors ml-2 cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                <span>{viewAllText}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              className="w-9 h-9 rounded-full bg-white border border-stone-200/90 text-stone-700 hover:text-stone-950 hover:bg-stone-50 flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              className="w-9 h-9 rounded-full bg-white border border-stone-200/90 text-stone-700 hover:text-stone-950 hover:bg-stone-50 flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Clean Grid & Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1 snap-x snap-mandatory"
      >
        {displayProducts.slice(0, 12).map((product, idx) => {
          const locName = getLocalizedProductName(product, language);
          const badgeLabel = idx % 3 === 0 ? 'Premium' : idx % 3 === 1 ? 'Exclusive' : 'Trending';

          return (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="group flex-none w-[220px] sm:w-[260px] md:w-[280px] bg-white rounded-2xl border border-stone-200/80 p-3 sm:p-4 shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer snap-start flex flex-col justify-between"
            >
              {/* Image Container */}
              <div className="relative aspect-4/5 rounded-xl overflow-hidden bg-stone-100 mb-3">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={locName}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">
                    No image
                  </div>
                )}

                {/* Badge Tag */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-stone-900 shadow-2xs border border-stone-200/50">
                    {badgeLabel}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-1">
                <h3 className="font-bold text-xs sm:text-sm text-stone-950 line-clamp-1 group-hover:text-amber-700 transition-colors">
                  {locName}
                </h3>
                <div className="flex items-center justify-between pt-1">
                  <p className="font-black text-stone-950 text-sm sm:text-base tabular-nums">
                    {product.price} MAD
                  </p>
                  <span className="text-[11px] font-bold text-stone-500 group-hover:text-stone-950 transition-colors">
                    {language === 'ar' ? 'عرض التفاصيل ←' : 'Choose Options →'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
