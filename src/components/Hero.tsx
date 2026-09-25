import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { HeroSlide } from '../types';
import { translateHeroText } from '../utils/heroTranslation';

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2400&auto=format&fit=crop',
    badge: '',
    title: 'اكتشف أحدث صيحات الموضة',
    subtitle: 'تشكيلة رائعة من الملابس والأحذية العصرية التي تناسب ذوقك وتمنحك إطلالة فريدة ومتميزة في كل مناسبة.',
    ctaText: 'تسوق الآن'
  },
  {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2400&auto=format&fit=crop',
    badge: '',
    title: 'أناقة لا مثيل لها',
    subtitle: 'تصاميم مختارة بعناية فائقة لتجمع بين الجودة العالية والراحة اليومية.',
    ctaText: 'استكشف المجموعة'
  },
  {
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2400&auto=format&fit=crop',
    badge: '',
    title: 'تخفيضات وعروض حصرية',
    subtitle: 'استمتع بأفضل الأسعار وأقوى العروض على التشكيلات الأكثر طلباً.',
    ctaText: 'تسوق العروض'
  },
  {
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2400&auto=format&fit=crop',
    badge: '',
    title: 'إطلالة عصرية تناسب أسلوبك',
    subtitle: 'كل ما تحتاجه لتجديد مظهرك العصري في مكان واحد وبأفضل جودة.',
    ctaText: 'اكتشف المزيد'
  }
];

export const DEFAULT_HERO_IMAGES = DEFAULT_HERO_SLIDES.map(s => s.image);
export const HERO_STORAGE_KEY = 'rachid_shop_hero_images';
export const HERO_SLIDES_STORAGE_KEY = 'rachid_shop_hero_slides';

// Helper to normalize slides from raw data
export function normalizeHeroSlides(data: any): HeroSlide[] {
  if (!data) return DEFAULT_HERO_SLIDES;

  if (Array.isArray(data.slides) && data.slides.length > 0) {
    return data.slides.map((s: any, idx: number) => {
      const rawBadge = (s.badge ?? '').trim();
      const cleanBadge = (rawBadge === 'تشكيلة الموسم الجديد 2026' || rawBadge === 'Nouvelle Collection 2026' || rawBadge === 'New Season Collection 2026') 
        ? '' 
        : rawBadge;

      return {
        image: typeof s === 'string' ? s : (s.image || DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length].image),
        badge: cleanBadge,
        title: s.title ?? (idx === 0 ? 'اكتشف أحدث صيحات الموضة' : ''),
        subtitle: s.subtitle ?? '',
        ctaText: s.ctaText ?? 'تسوق الآن',
        title_ar: s.title_ar,
        title_fr: s.title_fr,
        title_en: s.title_en,
        subtitle_ar: s.subtitle_ar,
        subtitle_fr: s.subtitle_fr,
        subtitle_en: s.subtitle_en,
        badge_ar: s.badge_ar,
        badge_fr: s.badge_fr,
        badge_en: s.badge_en,
        ctaText_ar: s.ctaText_ar,
        ctaText_fr: s.ctaText_fr,
        ctaText_en: s.ctaText_en
      };
    });
  }

  if (Array.isArray(data.images) && data.images.length > 0) {
    return data.images.map((img: string, idx: number) => {
      const defaultSlide = DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length];
      return {
        image: img,
        badge: '',
        title: defaultSlide.title || (idx === 0 ? 'اكتشف أحدث صيحات الموضة' : ''),
        subtitle: defaultSlide.subtitle || '',
        ctaText: defaultSlide.ctaText || 'تسوق الآن'
      };
    });
  }

  return DEFAULT_HERO_SLIDES;
}

export const SLIDE_DURATION = 6000;

export function Hero({ onShopNow }: { onShopNow: () => void }) {
  const { t, isRTL, language } = useLanguage();
  const [slides, setSlides] = useState<HeroSlide[]>(() => {
    try {
      const localSlides = localStorage.getItem(HERO_SLIDES_STORAGE_KEY);
      if (localSlides) {
        const parsed = JSON.parse(localSlides);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_HERO_SLIDES;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Firestore sync for slides
  useEffect(() => {
    const docRef = doc(db, 'settings', 'hero');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const normalized = normalizeHeroSlides(data);
          if (normalized.length > 0) {
            setSlides(normalized);
            try {
              localStorage.setItem(HERO_SLIDES_STORAGE_KEY, JSON.stringify(normalized));
            } catch (e) {
              console.warn(e);
            }
          }
        }
      },
      (err) => {
        console.warn('Hero listener error:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // Slide autoplay timer & progress bar
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const intervalTime = 50;
    const step = (intervalTime / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((idx) => (idx + 1) % slides.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [slides.length, isPaused, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  };

  const handleSelectSlide = (idx: number) => {
    setCurrentIndex(idx);
    setProgress(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // swipe left
        isRTL ? handlePrev() : handleNext();
      } else {
        // swipe right
        isRTL ? handleNext() : handlePrev();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentSlide = slides[currentIndex] || slides[0];

  const resolveLocalized = (baseText: string | undefined, specificText: string | undefined, defaultText: string) => {
    if (specificText && specificText.trim()) return specificText;
    if (baseText && baseText.trim()) return translateHeroText(baseText, language);
    return defaultText;
  };

  const rawBadge = currentSlide?.[`badge_${language}` as keyof HeroSlide] as string || currentSlide?.badge?.trim() || '';
  const cleanRawBadge = (rawBadge === 'تشكيلة الموسم الجديد 2026' || rawBadge === 'Nouvelle Collection 2026' || rawBadge === 'New Season Collection 2026')
    ? ''
    : rawBadge;
  const displayBadge = cleanRawBadge ? translateHeroText(cleanRawBadge, language) : '';

  const displayTitle = resolveLocalized(
    currentSlide?.title, 
    currentSlide?.[`title_${language}` as keyof HeroSlide] as string, 
    t.heroTitle
  );
  
  const displaySubtitle = resolveLocalized(
    currentSlide?.subtitle, 
    currentSlide?.[`subtitle_${language}` as keyof HeroSlide] as string, 
    t.heroSubtitle
  );
  
  const displayCta = resolveLocalized(
    currentSlide?.ctaText, 
    currentSlide?.[`ctaText_${language}` as keyof HeroSlide] as string, 
    t.heroCta || (language === 'ar' ? 'تسوق الآن' : language === 'fr' ? 'Acheter maintenant' : 'Shop Now')
  );

  return (
    <section 
      className="relative w-full h-[85vh] sm:h-[92vh] min-h-[560px] max-h-[1080px] overflow-hidden bg-stone-950 select-none group/hero"
      dir={isRTL ? 'rtl' : 'ltr'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. خلفية الصور الممتدة على كامل العرض والشاشة (Full Width & Full Height 100%) */}
      {slides.map((slide, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title || `Featured Fashion ${idx + 1}`}
              className={`w-full h-full object-cover object-center transition-transform duration-10000 ease-out ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
              loading={idx === 0 ? 'eager' : 'lazy'}
            />

            {/* تدرج ظلي متقن على الطراز العالمي لمنح وضوح فائق وفخامة للنصوص بدون حجب الصورة */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />
          </div>
        );
      })}

      {/* 4. المحتوى التحريري الراقي المدمج داخل الصورة بنظام المواقع الفاخرة العالمية (Editorial Overlay) */}
      <div className="relative z-20 h-full flex flex-col justify-end max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-12 sm:pb-16 lg:pb-20">
        <div className={`max-w-3xl ${isRTL ? 'text-right' : 'text-left'} space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-6 duration-700`}>
          
          {/* الشارة الترويجية إن وجدت */}
          {displayBadge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/25 text-xs sm:text-sm font-semibold shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{displayBadge}</span>
            </div>
          )}

          {/* العنوان الرئيسي الضخم والراقي */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] drop-shadow-md">
            {displayTitle}
          </h1>

          {/* النص الوصفي المتناسق */}
          {displaySubtitle && (
            <p className="text-sm sm:text-lg md:text-xl text-stone-200/90 font-normal leading-relaxed max-w-2xl drop-shadow-sm">
              {displaySubtitle}
            </p>
          )}

          {/* زر الشراء والتنقل بين الشرائح */}
          <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-4 sm:gap-6">
            <button 
              onClick={onShopNow}
              className="bg-white hover:bg-stone-100 text-stone-950 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold text-sm sm:text-base tracking-wide transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3 cursor-pointer group/btn"
            >
              <span>{displayCta}</span>
              {isRTL ? (
                <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover/btn:-translate-x-1" />
              ) : (
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              )}
            </button>

            {/* مؤشرات الشرائح السفلية الأنيقة */}
            {slides.length > 1 && (
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/15">
                <div className="flex items-center gap-1.5">
                  {slides.map((_, idx) => {
                    const isActive = idx === currentIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectSlide(idx)}
                        className="py-1 px-0.5 cursor-pointer"
                        aria-label={`Slide ${idx + 1}`}
                      >
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            isActive ? 'w-6 sm:w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-bold text-white/80 font-mono ms-1.5">
                  0{currentIndex + 1} / 0{slides.length}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* سهم مؤشر النزول السلس للأسفل */}
        <div className="absolute bottom-3 sm:bottom-5 start-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 pointer-events-none opacity-60 animate-bounce">
          <ChevronDown className="w-5 h-5 text-white" />
        </div>
      </div>
    </section>
  );
}
