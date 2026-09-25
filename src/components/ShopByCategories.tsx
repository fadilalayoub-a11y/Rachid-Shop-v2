import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// استيراد الصور الافتراضية
import prevJeansImg from '../assets/images/cat_jeans_editorial_1790338015205.jpg';
import prevWatchesPerfumesImg from '../assets/images/cat_perfume_editorial_1790338068896.jpg';
import userTshirtImg from '../assets/images/cat_tshirt_user.jpg';
import hoodieAndSweatshirtImg from '../assets/images/cat_hoodie_sweatshirt_1790352438728.jpg';
import sweatpantsGreyImg from '../assets/images/cat_sweatpants_grey_1790353992807.jpg';

export const CATEGORIES_STORAGE_KEY = 'rachid_shop_category_images_custom';

export interface CategoryCard {
  id: string;
  nameEn: string;
  nameAr: string;
  nameFr: string;
  image: string;
  link: string;
}

export const DEFAULT_CATEGORIES_DATA: CategoryCard[] = [
  {
    id: 't-shirts',
    nameEn: 'T-SHIRTS',
    nameAr: 'تيشيرتات',
    nameFr: 'T-SHIRTS',
    image: userTshirtImg,
    link: '/category/clothes?type=shirt',
  },
  {
    id: 'hoodies',
    nameEn: 'HOODIES & SWEATSHIRTS',
    nameAr: 'هوديز وسويت شيرت',
    nameFr: 'HOODIES & SWEATS',
    image: hoodieAndSweatshirtImg,
    link: '/category/clothes?type=jacket',
  },
  {
    id: 'jackets',
    nameEn: 'JACKETS',
    nameAr: 'جواكت ومعاطف',
    nameFr: 'VESTES',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    link: '/category/clothes?type=jacket',
  },
  {
    id: 'jeans',
    nameEn: 'JEANS',
    nameAr: 'جينز',
    nameFr: 'JEANS',
    image: prevJeansImg,
    link: '/category/clothes?type=jeans',
  },
  {
    id: 'sweatpants',
    nameEn: 'SWEATPANTS',
    nameAr: 'سراويل رياضية (كيطمة)',
    nameFr: 'SURVÊTEMENTS',
    image: sweatpantsGreyImg,
    link: '/category/clothes?type=trackpants',
  },
  {
    id: 'trousers',
    nameEn: 'TROUSERS',
    nameAr: 'سراويل كلاسيكية',
    nameFr: 'PANTALONS',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    link: '/category/clothes?type=jeans',
  },
  {
    id: 'sneakers',
    nameEn: 'SNEAKERS',
    nameAr: 'سنيكرز',
    nameFr: 'SNEAKERS',
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80',
    link: '/category/shoes?type=sneakers',
  },
  {
    id: 'formal-shoes',
    nameEn: 'FORMAL SHOES',
    nameAr: 'أحذية كلاسيكية',
    nameFr: 'CHAUSSURES DE VILLE',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
    link: '/category/shoes?type=casual-shoe',
  },
  {
    id: 'running-shoes',
    nameEn: 'RUNNING SHOES',
    nameAr: 'أحذية الجري والرياضة',
    nameFr: 'CHAUSSURES DE SPORT',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    link: '/category/shoes?type=sneakers',
  },
  {
    id: 'sandals',
    nameEn: 'SANDALS',
    nameAr: 'صنادل وكلاكيط',
    nameFr: 'SANDALES & CLAQUETTES',
    image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=800&q=80',
    link: '/category/shoes?type=slides',
  },
  {
    id: 'bags',
    nameEn: 'BAGS',
    nameAr: 'حقائب وشنط',
    nameFr: 'SACS',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    link: '/category/accessories?type=caps',
  },
  {
    id: 'caps-hats',
    nameEn: 'CAPS & HATS',
    nameAr: 'قبعات',
    nameFr: 'CASQUETTES & CHAPEAUX',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    link: '/category/accessories?type=caps',
  },
  {
    id: 'sunglasses',
    nameEn: 'SUNGLASSES',
    nameAr: 'نظارات شمسية',
    nameFr: 'LUNETTES DE SOLEIL',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    link: '/category/accessories?type=sunglasses',
  },
  {
    id: 'watches-perfumes',
    nameEn: 'WATCHES & PERFUMES',
    nameAr: 'ساعات وعطور',
    nameFr: 'MONTRES & PARFUMS',
    image: prevWatchesPerfumesImg,
    link: '/collection/watches-fragrances',
  },
];

export function ShopByCategories() {
  const { language, isRTL } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [customImages, setCustomImages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // الاستماع للتحديثات الحية من Firestore لصور الأقسام التي ترفعها الإدارة
  useEffect(() => {
    const docRef = doc(db, 'settings', 'category_images');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && typeof data === 'object') {
            setCustomImages(data as Record<string, string>);
            try {
              localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(data));
            } catch (e) {
              console.warn(e);
            }
          }
        }
      },
      (err) => {
        console.warn('ShopByCategories snapshot listener error:', err);
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
    <section className="w-full my-8 sm:my-12" aria-labelledby="shop-by-categories-title">
      {/* 1. Header Section: Exactly styled with subtle centered subtitle and accented title flanked by lines */}
      <div className="text-center mb-6 sm:mb-8 max-w-xl mx-auto px-4">
        {/* Subtitle in subtle, neutral font */}
        <p className="text-stone-400 text-xs sm:text-sm font-normal tracking-wide mb-1.5 font-sans">
          {language === 'ar' ? 'تشكيلات دارجة ومطلوبة' : language === 'fr' ? 'Collection Tendance' : 'Trending Collection'}
        </p>

        {/* Main title with thin horizontal accent lines on left & right */}
        <div className="flex items-center justify-center gap-3 sm:gap-6">
          <div className="h-[1px] w-12 sm:w-20 bg-stone-900" />
          <h2
            id="shop-by-categories-title"
            className="text-lg sm:text-2xl md:text-3xl font-bold tracking-widest text-stone-950 uppercase font-sans whitespace-nowrap"
          >
            {language === 'ar' ? 'تسوق حسب الفئات' : language === 'fr' ? 'ACHETER PAR CATÉGORIE' : 'SHOP BY CATEGORIES'}
          </h2>
          <div className="h-[1px] w-12 sm:w-20 bg-stone-900" />
        </div>
      </div>

      {/* 2. Carousel Controls & Container */}
      <div className="relative group/carousel">
        {/* Navigation arrow buttons appearing on sides */}
        <button
          onClick={() => scroll('prev')}
          aria-label="Previous categories"
          className="absolute -start-2 sm:start-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 border border-stone-200 text-stone-800 shadow-md flex items-center justify-center hover:bg-stone-950 hover:text-white transition-all cursor-pointer opacity-90 hover:opacity-100"
        >
          {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        <button
          onClick={() => scroll('next')}
          aria-label="Next categories"
          className="absolute -end-2 sm:end-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 border border-stone-200 text-stone-800 shadow-md flex items-center justify-center hover:bg-stone-950 hover:text-white transition-all cursor-pointer opacity-90 hover:opacity-100"
        >
          {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {/* 3. Horizontal Scrollable Cards with clean borderless layout & sharp corners */}
        <div className="-mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {DEFAULT_CATEGORIES_DATA.map((item) => {
              const displayName = language === 'ar' ? item.nameAr : language === 'fr' ? item.nameFr : item.nameEn;
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

                    {/* Overlaid clean white rectangular badge containing category title in uppercase dark sans-serif text */}
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
