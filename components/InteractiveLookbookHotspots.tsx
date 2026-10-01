'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Product } from '@/types';
import { ChevronLeft, ChevronRight, Eye, ShoppingBag } from 'lucide-react';

interface InteractiveLookbookHotspotsProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export function InteractiveLookbookHotspots({ products, onSelectProduct }: InteractiveLookbookHotspotsProps) {
  const { language } = useLanguage();

  const hotspots = [
    {
      id: 1,
      name: language === 'ar' ? 'سويتر صوف تريكو أوفرسايز' : language === 'fr' ? 'Pull Tricot Col Roulé' : 'Crewneck Stripe Knit',
      price: '349.00',
      categoryTag: 'CASUAL',
      x: '52%',
      y: '50%',
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 2,
      name: language === 'ar' ? 'بنطلون قماش شينو كلاسيك' : language === 'fr' ? 'Pantalon Chino Ajusté' : 'Tailored Wool Trousers',
      price: '280.00',
      categoryTag: 'CLASSIC',
      x: '71%',
      y: '53%',
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=400&q=80',
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const currentSpot = hotspots[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? hotspots.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === hotspots.length - 1 ? 0 : prev + 1));
  };

  const handleShopCurrent = () => {
    if (products.length > 0) {
      // Find a matching product or pick the first available
      const found = products[activeIndex % products.length];
      onSelectProduct(found);
    }
  };

  const sectionTitle = language === 'ar' 
    ? 'أناقة تدوم ورقي لا يخبو' 
    : language === 'fr' 
      ? 'Élégance & Sophistication Durable' 
      : 'Enduring Stylish Sophistication';

  const sectionSubtitle = language === 'ar'
    ? 'مزيج استثنائي يجمع بين الرقي الكلاسيكي ولمسات الموضة المعاصرة لإطلالة متفردة.'
    : language === 'fr'
      ? 'La sophistication rencontre l\'élégance intemporelle pour un style durable et distinctif.'
      : 'Enduring Stylish Sophistication blends timeless elegance with lasting style.';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      <div className="relative rounded-3xl overflow-hidden min-h-[500px] sm:min-h-[620px] bg-stone-900 border border-stone-800 shadow-xl">
        {/* Background Editorial Lookbook Image */}
        <img
          src="/images/lookbook_hotspot_model_1790636315552.jpg"
          alt={sectionTitle}
          className="absolute inset-0 w-full h-full object-cover object-top filter brightness-[0.9] contrast-[1.03]"
          loading="lazy"
        />

        {/* Ambient Dark Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/60 sm:bg-gradient-to-r sm:from-black/70 sm:via-transparent sm:to-black/40" />

        {/* Top Left Title Overlay */}
        <div className="absolute top-6 left-6 sm:top-12 sm:left-12 z-10 max-w-md text-white">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-serif italic text-white drop-shadow-md">
            {sectionTitle}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-stone-200/90 font-medium leading-relaxed drop-shadow-sm">
            {sectionSubtitle}
          </p>
        </div>

        {/* Pulsing Hotspot Pins */}
        {hotspots.map((spot, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={spot.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              style={{ top: spot.y, left: spot.x }}
              aria-label={`Hotspot for ${spot.name}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group flex items-center justify-center cursor-pointer transition-all duration-300 ${
                isActive ? 'scale-125' : 'scale-100 hover:scale-110'
              }`}
            >
              {/* Outer pulsing ring */}
              <span className="absolute w-8 h-8 rounded-full bg-white/40 animate-ping" />
              {/* Middle blur */}
              <span className="w-6 h-6 rounded-full bg-white/70 shadow-lg backdrop-blur-xs flex items-center justify-center">
                {/* Center dot */}
                <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-stone-950' : 'bg-white'}`} />
              </span>
            </button>
          );
        })}

        {/* Floating Frosted Glass Product Card (Bottom Left / Center) */}
        <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:bottom-10 sm:left-12 z-20 max-w-sm">
          <div className="bg-[#1c1815]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 text-white shadow-2xl space-y-3">
            <div className="flex items-center gap-3.5">
              {/* Thumbnail */}
              <img
                src={currentSpot.image}
                alt={currentSpot.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-white/10 shrink-0 bg-stone-800"
              />

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-white line-clamp-2">
                  {currentSpot.name}
                </h4>
                <p className="text-sm sm:text-base font-black text-amber-400 mt-1">
                  {currentSpot.price} MAD
                </p>
              </div>
            </div>

            {/* Actions: View and Shop Now */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleShopCurrent}
                className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-white/15 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'معاينة' : 'View'}</span>
              </button>

              <button
                type="button"
                onClick={handleShopCurrent}
                className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-stone-200 text-stone-950 text-xs font-black transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'طلب الآن' : 'Shop Now'}</span>
              </button>
            </div>

            {/* Bottom Pagination & Nav */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-stone-300 font-mono">
              <span className="font-bold tracking-wider text-amber-300/90">
                {currentSpot.categoryTag}
              </span>
              <div className="flex items-center gap-2">
                <span>
                  {activeIndex + 1} / {hotspots.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous"
                    className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next"
                    className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
