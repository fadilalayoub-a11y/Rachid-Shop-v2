import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { CATEGORIES_STORAGE_KEY } from './ShopByCategories';
import classicImage from '../assets/images/classic_style_model_1790442867183.jpg';
import oldMoneyImage from '../assets/images/old_money_style_model_1790552983556.jpg';
import streetwearImage from '../assets/images/streetwear_style_1790442307781.jpg';
import sportswearImage from '../assets/images/sportswear_model_1790442882053.jpg';
import casualImage from '../assets/images/casual_style_model_1790442894528.jpg';

export interface StyleCard {
  id: string;
  nameEn: string;
  nameAr: string;
  nameFr: string;
  subtitleAr: string;
  subtitleEn: string;
  image: string;
  link: string;
}

export const STYLES_DATA: StyleCard[] = [
  {
    id: 'classic',
    nameEn: 'CLASSIC',
    nameAr: 'كلاسيكي',
    nameFr: 'CLASSIQUE',
    subtitleAr: 'قمصان راقية، سراويل قماش، وأحذية جلدية رسمية',
    subtitleEn: 'Formal shirts, tailored trousers & formal leather shoes',
    image: classicImage,
    link: '/collection/classic-style',
  },
  {
    id: 'old-money',
    nameEn: 'OLD MONEY',
    nameAr: 'أولد ماني',
    nameFr: 'OLD MONEY',
    subtitleAr: 'فخامة هادئة، بولو راقي، قمصان كتان وموكاسان كلاسيكي',
    subtitleEn: 'Quiet luxury, refined polos, linen shirts & timeless loafers',
    image: oldMoneyImage,
    link: '/collection/old-money',
  },
  {
    id: 'streetwear',
    nameEn: 'STREETWEAR',
    nameAr: 'لبس الشارع',
    nameFr: 'STREETWEAR',
    subtitleAr: 'قصات أوفرسايز، ستايل أوربان عصري، بولو واسع وسنيكرز',
    subtitleEn: 'Oversized fits, urban aesthetic, baggy pants & trendy sneakers',
    image: streetwearImage,
    link: '/collection/streetwear',
  },
  {
    id: 'sportswear',
    nameEn: 'SPORTSWEAR',
    nameAr: 'رياضي',
    nameFr: 'SPORTSWEAR',
    subtitleAr: 'كيطمات، هوديز، شورتات تمرين وسنيكرز رياضية',
    subtitleEn: 'Trackpants, athletic hoodies & performance sneakers',
    image: sportswearImage,
    link: '/collection/sportswear-gym',
  },
  {
    id: 'casual',
    nameEn: 'CASUAL',
    nameAr: 'كاجوال',
    nameFr: 'DÉCONTRACTÉ',
    subtitleAr: 'جينز مريح، قمصان يومية خفيفة وأحذية كاجوال',
    subtitleEn: 'Everyday denim, casual tees & comfortable footwear',
    image: casualImage,
    link: '/collection/denim-casual',
  },
];

export function ShopByStyle() {
  const { language, isRTL } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [customImages, setCustomImages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const clean: Record<string, string> = {};
        const source = parsed.images || parsed;
        for (const [k, v] of Object.entries(source)) {
          if (k !== 'names' && k !== 'customNames' && typeof v === 'string' && !v.startsWith('data:')) {
            clean[k] = v;
          }
        }
        return clean;
      }
      return {};
    } catch {
      return {};
    }
  });

  const [customNames, setCustomNames] = useState<Record<string, { ar?: string; en?: string; fr?: string }>>({});

  // استماع مباشر لصور وعناوين أقسام الستايل من إعدادات المتجر
  useEffect(() => {
    const docRef = doc(db, 'settings', 'category_images');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && typeof data === 'object') {
            const clean: Record<string, string> = {};
            const source = data.images && typeof data.images === 'object' ? data.images : data;
            for (const [k, v] of Object.entries(source)) {
              if (k !== 'names' && k !== 'customNames' && k !== 'updatedAt' && typeof v === 'string' && !v.startsWith('data:')) {
                clean[k] = v;
              }
            }
            setCustomImages(clean);

            const namesSource = data.names || data.customNames;
            if (namesSource && typeof namesSource === 'object') {
              setCustomNames(namesSource as Record<string, { ar?: string; en?: string; fr?: string }>);
            } else {
              setCustomNames({});
            }
          }
        }
      },
      (err) => {
        console.warn('ShopByStyle snapshot listener error:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  const scroll = (direction: 'prev' | 'next') => {
    if (scrollContainerRef.current) {
      const distance = 300;
      const multiplier = isRTL 
        ? (direction === 'next' ? -distance : distance)
        : (direction === 'next' ? distance : -distance);
      scrollContainerRef.current.scrollBy({ left: multiplier, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full my-8 sm:my-12" aria-labelledby="shop-by-style-title">
      {/* 1. Header Section: Matches the exact aesthetic of ShopByCategories with elegant lines */}
      <div className="text-center mb-6 sm:mb-8 max-w-xl mx-auto px-4">
        <p className="text-stone-400 text-xs sm:text-sm font-normal tracking-wide mb-1.5 font-sans">
          {language === 'ar' ? 'اختر مظهرك وإطلالتك الخاصة' : language === 'fr' ? 'Choisissez Votre Esthétique' : 'Choose Your Aesthetic'}
        </p>

        <div className="flex items-center justify-center gap-3 sm:gap-6">
          <div className="h-[1px] w-12 sm:w-20 bg-stone-900" />
          <h2
            id="shop-by-style-title"
            className="text-lg sm:text-2xl md:text-3xl font-bold tracking-widest text-stone-950 uppercase font-sans whitespace-nowrap"
          >
            {language === 'ar' ? 'تسوق حسب الستايل والمظهر' : language === 'fr' ? 'ACHETER PAR STYLE' : 'SHOP BY STYLE'}
          </h2>
          <div className="h-[1px] w-12 sm:w-20 bg-stone-900" />
        </div>
      </div>

      {/* 2. Carousel Controls & Container (Identical to ShopByCategories for seamless mobile slider experience) */}
      <div className="relative group/carousel">
        {/* Navigation arrow buttons */}
        <button
          onClick={() => scroll('prev')}
          aria-label="Previous styles"
          className="absolute -start-2 sm:start-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 border border-stone-200 text-stone-800 shadow-md flex items-center justify-center hover:bg-stone-950 hover:text-white transition-all cursor-pointer opacity-90 hover:opacity-100"
        >
          {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        <button
          onClick={() => scroll('next')}
          aria-label="Next styles"
          className="absolute -end-2 sm:end-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 border border-stone-200 text-stone-800 shadow-md flex items-center justify-center hover:bg-stone-950 hover:text-white transition-all cursor-pointer opacity-90 hover:opacity-100"
        >
          {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {/* 3. Horizontal Scrollable Cards with clean borderless layout & snap alignment */}
        <div className="-mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {STYLES_DATA.map((item) => {
              const customNameObj = customNames[item.id];
              const customAr = customNameObj?.ar?.trim();
              const customEn = customNameObj?.en?.trim();
              const customFr = customNameObj?.fr?.trim();

              const displayName = language === 'ar'
                ? (customAr || item.nameAr)
                : language === 'fr'
                ? (customFr || customEn || item.nameFr)
                : (customEn || item.nameEn);

              const displayImage = customImages[item.id] || item.image;

              return (
                <div
                  key={item.id}
                  className="w-[200px] xs:w-[220px] sm:w-[250px] md:w-[270px] shrink-0 snap-start flex flex-col"
                >
                  <Link
                    to={item.link}
                    className="group relative block aspect-[3/4] overflow-hidden bg-[#e8e8e8] transition-all duration-300 hover:shadow-lg"
                  >
                    {/* Full-height high-quality lifestyle photography background */}
                    <img
                      src={displayImage}
                      alt={displayName}
                      className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Subtle hover shade */}
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/15 transition-colors duration-300" />

                    {/* Overlaid clean white rectangular badge containing style title in uppercase dark sans-serif text */}
                    <div className="absolute bottom-5 inset-x-0 flex justify-center px-3 z-10">
                      <div className="bg-white px-5 py-2.5 shadow-sm text-center min-w-[130px] max-w-[90%] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md">
                        <span className="block text-xs sm:text-sm font-bold text-stone-900 tracking-wider uppercase font-sans">
                          {displayName}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
