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
import bannerImg from '../assets/images/fashion_hero_banner_1790524651226.jpg';

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    image: bannerImg,
    badge: 'تخفيضات حصرية',
    title: 'تشكيلة حصرية: خصم يصل إلى 50%',
    subtitle: 'اكتشف أحدث التصاميم وأكثرها طلباً بأعلى معايير الجودة والأناقة. العرض سارٍ لفترة محدودة.',
    ctaText: 'تسوق العروض',
    title_en: 'EXCLUSIVE COLLECTION: UP TO 50% OFF',
    subtitle_en: 'Discover our most sought-after styles. Valid for a limited time.',
    ctaText_en: 'Shop offers',
    title_fr: 'COLLECTION EXCLUSIVE : JUSQU’À -50%',
    subtitle_fr: 'Découvrez nos pièces les plus convoitées. Offre à durée limitée.',
    ctaText_fr: 'Découvrir les offres'
  },
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

      const rawImg = typeof s === 'string' ? s : s?.image;
      const defaultImg = DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length].image;
      const safeImg = (typeof rawImg === 'string' && !rawImg.startsWith('data:')) ? rawImg : defaultImg;

      return {
        image: safeImg,
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
        ctaText_en: s.ctaText_en,
        contentPosition: s.contentPosition || 'start',
        verticalAlign: s.verticalAlign || 'center',
        textAlign: s.textAlign || 'start',
        maxWidthPercent: s.maxWidthPercent || 50,
        textColorTheme: s.textColorTheme || 'light',
        fontFamily: s.fontFamily || 'sans',
        titleSize: s.titleSize || 'large',
        overlayStyle: s.overlayStyle || 'charcoal-gradient',
        ctaLink: s.ctaLink || '#products',
        ctaStyle: s.ctaStyle || 'white-solid'
      };
    });
  }

  if (Array.isArray(data.images) && data.images.length > 0) {
    return data.images.map((img: string, idx: number) => {
      const defaultSlide = DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length];
      const safeImg = (typeof img === 'string' && !img.startsWith('data:')) ? img : defaultSlide.image;
      return {
        image: safeImg,
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

  // Layout and styling properties for the active slide
  const contentPosition = currentSlide?.contentPosition || 'start'; // 'start', 'center', 'end'
  const verticalAlign = currentSlide?.verticalAlign || 'center'; // 'top', 'center', 'bottom'
  const textAlign = currentSlide?.textAlign || 'start'; // 'start', 'center', 'end'
  const maxWidthPercent = currentSlide?.maxWidthPercent || 50; // 40, 50, 60, 100
  const textColorTheme = currentSlide?.textColorTheme || 'light'; // 'light' or 'dark'
  const fontFamily = currentSlide?.fontFamily || 'sans';
  const titleSize = currentSlide?.titleSize || 'large';
  const overlayStyle = currentSlide?.overlayStyle || 'charcoal-gradient';
  const ctaStyle = currentSlide?.ctaStyle || 'white-solid';
  const ctaLink = currentSlide?.ctaLink || '#products';

  const handleCtaClick = () => {
    if (ctaLink.startsWith('#') || ctaLink === '#products') {
      onShopNow();
    } else {
      // Trigger navigation event or scroll
      const event = new CustomEvent('navigate-tab', { detail: ctaLink });
      window.dispatchEvent(event);
      onShopNow();
    }
  };

  // Determine flex justification for horizontal positioning
  const justifyClass = 
    contentPosition === 'center'
      ? 'justify-center items-center'
      : contentPosition === 'end'
      ? isRTL ? 'justify-start items-start' : 'justify-end items-end'
      : isRTL ? 'justify-end items-end' : 'justify-start items-start';

  // Determine flex alignment for vertical positioning
  const verticalClass =
    verticalAlign === 'top'
      ? 'justify-start pt-8 sm:pt-12'
      : verticalAlign === 'bottom'
      ? 'justify-end pb-8 sm:pb-12'
      : 'justify-center';

  // Determine text alignment
  const textAlignmentClass =
    textAlign === 'center'
      ? 'text-center'
      : textAlign === 'end'
      ? isRTL ? 'text-left' : 'text-right'
      : isRTL ? 'text-right' : 'text-left';

  // Font family class
  const fontClass = 
    fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans';

  // Title size class
  const titleSizeClass =
    titleSize === 'xlarge'
      ? 'text-3xl sm:text-5xl md:text-6xl font-black'
      : titleSize === 'normal'
      ? 'text-xl sm:text-3xl md:text-4xl font-extrabold'
      : 'text-2xl sm:text-4xl md:text-5xl font-black';

  // Text colors
  const isDarkText = textColorTheme === 'dark';
  const titleColor = isDarkText ? 'text-stone-900 drop-shadow-xs' : 'text-white drop-shadow-md';
  const subtitleColor = isDarkText ? 'text-stone-700' : 'text-stone-200/95 drop-shadow-xs';

  // Button style classes
  const getCtaButtonClass = () => {
    switch (ctaStyle) {
      case 'dark-solid':
        return 'bg-stone-950 hover:bg-stone-900 text-white shadow-md hover:scale-105';
      case 'outline':
        return isDarkText
          ? 'bg-transparent border-2 border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white'
          : 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-stone-950';
      case 'accent':
        return 'bg-[#3B4A3F] hover:bg-[#2d3a31] text-white shadow-lg hover:scale-105';
      case 'white-solid':
      default:
        return 'bg-white hover:bg-stone-50 text-stone-950 shadow-[0_8px_20px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.45)] hover:scale-105';
    }
  };

  return (
    <div className="max-w-[1536px] mx-auto px-2 sm:px-4 lg:px-6">
      <section 
        className="relative w-full h-[320px] sm:h-[400px] md:h-[460px] lg:h-[480px] overflow-hidden rounded-2xl sm:rounded-3xl border border-stone-200/60 shadow-lg bg-stone-950 select-none group/hero"
        dir={isRTL ? 'rtl' : 'ltr'}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 1. خلفية الصور الممتدة على مساحة البانر بالكامل */}
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const slideOverlay = slide.overlayStyle || overlayStyle;
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

              {/* التدرج اللوني الذكي القابل للتخصيص لعدم حجب محتوى الصورة */}
              {slideOverlay === 'charcoal-gradient' && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent sm:hidden" />
                  <div className={`absolute inset-0 hidden sm:block ${
                    contentPosition === 'end'
                      ? isRTL
                        ? 'bg-gradient-to-r from-stone-950/90 via-stone-950/60 to-transparent to-75%'
                        : 'bg-gradient-to-l from-stone-950/90 via-stone-950/60 to-transparent to-75%'
                      : contentPosition === 'center'
                      ? 'bg-stone-950/45 backdrop-blur-[1px]'
                      : isRTL 
                      ? 'bg-gradient-to-l from-stone-950/90 via-stone-950/60 to-transparent to-75%' 
                      : 'bg-gradient-to-r from-stone-950/90 via-stone-950/60 to-transparent to-75%'
                  }`} />
                </>
              )}

              {slideOverlay === 'light-gradient' && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent sm:hidden" />
                  <div className={`absolute inset-0 hidden sm:block ${
                    contentPosition === 'end'
                      ? isRTL
                        ? 'bg-gradient-to-r from-white/95 via-white/70 to-transparent to-75%'
                        : 'bg-gradient-to-l from-white/95 via-white/70 to-transparent to-75%'
                      : contentPosition === 'center'
                      ? 'bg-white/50 backdrop-blur-[1px]'
                      : isRTL 
                      ? 'bg-gradient-to-l from-white/95 via-white/70 to-transparent to-75%' 
                      : 'bg-gradient-to-r from-white/95 via-white/70 to-transparent to-75%'
                  }`} />
                </>
              )}

              {slideOverlay === 'solid-tint' && (
                <div className="absolute inset-0 bg-black/35" />
              )}
            </div>
          );
        })}

        {/* 2. المحتوى التحريري القابل للتموضع وتخصيص العرض والمحاذاة */}
        <div className={`relative z-20 h-full flex flex-col ${verticalClass} p-6 sm:p-10 lg:p-14`}>
          <div className={`flex w-full ${justifyClass}`}>
            <div 
              style={{ maxWidth: `${maxWidthPercent}%` }}
              className={`w-full min-w-[280px] ${textAlignmentClass} ${fontClass} space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500`}
            >
              
              {/* الشارة الترويجية إن وجدت */}
              {displayBadge && (
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-xs ${
                  isDarkText 
                    ? 'bg-stone-900/10 text-stone-900 border border-stone-900/15'
                    : 'bg-white/15 backdrop-blur-md text-white border border-white/20'
                }`}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{displayBadge}</span>
                </div>
              )}

              {/* العنوان الرئيسي للبانر */}
              <h1 className={`${titleSizeClass} ${titleColor} tracking-tight leading-[1.15]`}>
                {displayTitle}
              </h1>

              {/* النص الوصفي */}
              {displaySubtitle && (
                <p className={`text-xs sm:text-sm md:text-base ${subtitleColor} font-normal leading-relaxed line-clamp-2 sm:line-clamp-3`}>
                  {displaySubtitle}
                </p>
              )}

              {/* زر الشراء ومؤشرات الشرائح السفلية */}
              <div className={`pt-2 flex flex-wrap items-center gap-3 sm:gap-5 ${
                textAlign === 'center' ? 'justify-center' : textAlign === 'end' ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-start' : 'justify-start')
              }`}>
                <button 
                  onClick={handleCtaClick}
                  className={`${getCtaButtonClass()} px-6 sm:px-8 py-3 rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 active:scale-95 flex items-center gap-2 cursor-pointer group/btn`}
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
                  <div className={`flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-md ${
                    isDarkText ? 'bg-stone-900/10 border border-stone-900/10' : 'bg-black/40 border border-white/10'
                  }`}>
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
                                isActive 
                                  ? isDarkText ? 'w-6 sm:w-8 bg-stone-900' : 'w-6 sm:w-8 bg-white' 
                                  : isDarkText ? 'w-2 bg-stone-900/30 hover:bg-stone-900/60' : 'w-2 bg-white/40 hover:bg-white/70'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className={`text-[11px] font-bold font-mono ms-1 ${isDarkText ? 'text-stone-800' : 'text-white/80'}`}>
                      0{currentIndex + 1} / 0{slides.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
