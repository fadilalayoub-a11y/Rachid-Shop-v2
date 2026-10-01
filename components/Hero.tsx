'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { HeroSlide } from '@/types';
import { translateHeroText } from '@/utils/heroTranslation';

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    image: '/mens_welcome_banner.jpg',
    badge: '',
    title: 'عالم متكامل من الأناقة والتميز',
    subtitle: 'اكتشف تشكيلتنا المتنوعة من أرقى الملابس العصرية، الأحذية الفاخرة، والإكسسوارات المصممة لتناسب ذوقك الرفيع في كل إطلالة.',
    ctaText: 'استكشف التشكيلة',
    badge_en: '',
    title_en: 'A Complete World of Refined Style',
    subtitle_en: 'Explore our curated collection of contemporary apparel, premium footwear, and elegant accessories for every occasion.',
    ctaText_en: 'Explore Collection',
    badge_fr: '',
    title_fr: 'Tout l’univers de l’élégance',
    subtitle_fr: 'Découvrez notre collection raffinée de prêt-à-porter, chaussures haut de gamme et accessoires exclusifs.',
    ctaText_fr: 'Découvrir la collection',
    contentPosition: 'start',
    verticalAlign: 'bottom',
    textAlign: 'start',
    maxWidthPercent: 55,
    textSpreadMode: 'grouped',
    textColorTheme: 'light',
    fontFamily: 'sans',
    titleSize: 'xlarge',
    overlayStyle: 'charcoal-gradient',
    ctaStyle: 'white-solid',
    ctaLink: '#products'
  }
];

export const DEFAULT_HERO_IMAGES = DEFAULT_HERO_SLIDES.map(s => s.image);
export const HERO_STORAGE_KEY = 'rachid_shop_hero_images_v5';
export const HERO_SLIDES_STORAGE_KEY = 'rachid_shop_hero_slides_v5';

// Check if image is one of the obsolete demo/placeholder images
export function isObsoleteDemoImage(img: string): boolean {
  if (!img || typeof img !== 'string') return true;
  if (img.includes('fashion_hero_banner_1790524651226')) return true;
  if (img.includes('photo-1490481651871-ab68de25d43d')) return true;
  if (img.includes('photo-1441986300917-64674bd600d8')) return true;
  if (img.includes('photo-1445205170230-053b83016050')) return true;
  if (img.includes('photo-1469334031218-e382a71b716b')) return true;
  return false;
}

// Helper to filter out any unwanted or obsolete badges
export function sanitizeHeroBadge(badge: string | undefined): string {
  if (!badge) return '';
  const trimmed = badge.trim();
  if (
    trimmed === 'تشكيلة الموسم الجديد 2026' ||
    trimmed === 'Nouvelle Collection 2026' ||
    trimmed === 'New Season Collection 2026' ||
    trimmed.includes('مرحب') ||
    trimmed.includes('رشيد') ||
    trimmed.includes('Welcome') ||
    trimmed.includes('Bienvenue')
  ) {
    return '';
  }
  return trimmed;
}

// Helper to normalize slides from raw data
export function normalizeHeroSlides(data: any): HeroSlide[] {
  if (!data) return DEFAULT_HERO_SLIDES;

  if (Array.isArray(data.slides) && data.slides.length > 0) {
    const validSlides = data.slides.filter((s: any) => {
      const rawImg = typeof s === 'string' ? s : s?.image;
      return !isObsoleteDemoImage(rawImg);
    });

    if (validSlides.length === 0) {
      return DEFAULT_HERO_SLIDES;
    }

    return validSlides.map((s: any, idx: number) => {
      const cleanBadge = sanitizeHeroBadge(s.badge);

      const rawImg = typeof s === 'string' ? s : s?.image;
      const defaultImg = DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length].image;
      const safeImg = (typeof rawImg === 'string' && !rawImg.startsWith('data:')) ? rawImg : defaultImg;

      return {
        image: safeImg,
        badge: cleanBadge,
        title: s.title ?? (idx === 0 ? 'عالم متكامل من الأناقة والتميز' : ''),
        subtitle: s.subtitle ?? '',
        ctaText: s.ctaText ?? 'استكشف التشكيلة',
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
        maxWidthPercent: s.maxWidthPercent || 55,
        textSpreadMode: s.textSpreadMode || 'grouped',
        textColorTheme: s.textColorTheme || 'light',
        fontFamily: s.fontFamily || 'sans',
        titleSize: s.titleSize || 'xlarge',
        overlayStyle: s.overlayStyle || 'charcoal-gradient',
        ctaLink: s.ctaLink || '#products',
        ctaStyle: s.ctaStyle || 'white-solid',
        posX_ar: typeof s.posX_ar === 'number' ? s.posX_ar : undefined,
        posY_ar: typeof s.posY_ar === 'number' ? s.posY_ar : undefined,
        posX_en: typeof s.posX_en === 'number' ? s.posX_en : undefined,
        posY_en: typeof s.posY_en === 'number' ? s.posY_en : undefined
      };
    });
  }

  if (Array.isArray(data.images) && data.images.length > 0) {
    const validImages = data.images.filter((img: string) => !isObsoleteDemoImage(img));
    if (validImages.length === 0) {
      return DEFAULT_HERO_SLIDES;
    }
    return validImages.map((img: string, idx: number) => {
      const defaultSlide = DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length];
      const safeImg = (typeof img === 'string' && !img.startsWith('data:')) ? img : defaultSlide.image;
      return {
        image: safeImg,
        badge: '',
        title: defaultSlide.title || (idx === 0 ? 'عالم متكامل من الأناقة والتميز' : ''),
        subtitle: defaultSlide.subtitle || '',
        ctaText: defaultSlide.ctaText || 'استكشف التشكيلة'
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
    try {
      localStorage.removeItem('rachid_shop_hero_slides');
      localStorage.removeItem('rachid_shop_hero_slides_v2');
      localStorage.removeItem('rachid_shop_hero_slides_v3');
      localStorage.removeItem('rachid_shop_hero_slides_v4');
      localStorage.removeItem('rachid_shop_hero_images');
      localStorage.removeItem('rachid_shop_hero_images_v4');
    } catch {}

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
  const cleanRawBadge = sanitizeHeroBadge(rawBadge);
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
  const maxWidthPercent = currentSlide?.maxWidthPercent || 50; // 35, 50, 65, 80, 100
  const textSpreadMode = currentSlide?.textSpreadMode || 'grouped'; // 'grouped' | 'extended' | 'split'
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

  // Custom pinpoint positioning (X, Y percentage)
  const customX = isRTL 
    ? currentSlide?.posX_ar 
    : language === 'fr' 
    ? (currentSlide?.posX_fr ?? currentSlide?.posX_en)
    : currentSlide?.posX_en;
    
  const customY = isRTL 
    ? currentSlide?.posY_ar 
    : language === 'fr' 
    ? (currentSlide?.posY_fr ?? currentSlide?.posY_en)
    : currentSlide?.posY_en;
    
  const hasCustomCoordinates = typeof customX === 'number' && typeof customY === 'number';

  // Flex alignment classes (In dir="rtl", justify-start aligns to far-right; in dir="ltr", justify-start aligns to far-left)
  const justifyClass = 
    contentPosition === 'center'
      ? 'justify-center'
      : contentPosition === 'end'
      ? 'justify-end'
      : 'justify-start';

  const verticalClass =
    verticalAlign === 'top'
      ? 'justify-start pt-6 sm:pt-10'
      : verticalAlign === 'bottom'
      ? 'justify-end pb-6 sm:pb-8 lg:pb-12'
      : 'justify-center';

  const textAlignmentClass =
    textAlign === 'center'
      ? 'text-center'
      : textAlign === 'end'
      ? isRTL ? 'text-left' : 'text-right'
      : isRTL ? 'text-right' : 'text-left';

  const fontClass = (() => {
    switch (fontFamily) {
      case 'almarai': return 'font-almarai';
      case 'tajawal': return 'font-tajawal';
      case 'ibm': return 'font-ibm';
      case 'amiri': return 'font-amiri';
      case 'cinzel': return 'font-cinzel';
      case 'cormorant': return 'font-cormorant';
      case 'montserrat': return 'font-montserrat';
      case 'playfair': return 'font-playfair';
      case 'cairo': return 'font-cairo';
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      case 'sans':
      default:
        return 'font-cairo';
    }
  })();

  const titleSizeClass =
    titleSize === 'xlarge'
      ? 'text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]'
      : titleSize === 'normal'
      ? 'text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug'
      : 'text-xl sm:text-3xl md:text-4xl font-black tracking-tight leading-[1.12]';

  const isDarkText = textColorTheme === 'dark';
  const titleColor = isDarkText ? 'text-stone-950 drop-shadow-xs' : 'text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]';
  const subtitleColor = isDarkText ? 'text-stone-800' : 'text-stone-100/95 drop-shadow-xs';

  // Button style classes
  const getCtaButtonClass = () => {
    switch (ctaStyle) {
      case 'dark-solid':
        return 'bg-stone-950 hover:bg-stone-900 text-white shadow-xl hover:scale-105';
      case 'outline':
        return isDarkText
          ? 'bg-transparent border-2 border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white'
          : 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-stone-950 backdrop-blur-xs';
      case 'accent':
        return 'bg-[#C5A265] hover:bg-[#b08e53] text-stone-950 shadow-xl hover:scale-105 font-black';
      case 'white-solid':
      default:
        return 'bg-white hover:bg-stone-100 text-stone-950 shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.45)] hover:scale-105';
    }
  };

  return (
    <div className="w-full overflow-hidden bg-stone-950">
      {/* البانر الإعلاني العريض الممتد على كامل عرض الشاشة مع دقة توزيع النصوص */}
      <section 
        className="relative w-full h-[320px] sm:h-[380px] md:h-[440px] lg:h-[490px] xl:h-[530px] overflow-hidden bg-stone-950 select-none group/hero"
        dir={isRTL ? 'rtl' : 'ltr'}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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

              {/* تدرج اتجاهي سينمائي يضمن وضوح وقراءة النصوص بدون حجب جمالية الصورة */}
              {slideOverlay === 'charcoal-gradient' && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/45 to-transparent sm:hidden pointer-events-none" />
                  <div className={`absolute inset-0 hidden sm:block pointer-events-none ${
                    isRTL
                      ? 'bg-gradient-to-l from-stone-950/95 via-stone-950/60 via-45% to-transparent to-75%'
                      : 'bg-gradient-to-r from-stone-950/95 via-stone-950/60 via-45% to-transparent to-75%'
                  }`} />
                  <div className="absolute inset-0 bg-radial-[at_bottom_center] from-transparent via-transparent to-black/30 pointer-events-none" />
                </>
              )}

              {slideOverlay === 'light-gradient' && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-transparent sm:hidden pointer-events-none" />
                  <div className={`absolute inset-0 hidden sm:block pointer-events-none ${
                    isRTL
                      ? 'bg-gradient-to-l from-white/95 via-white/70 via-45% to-transparent to-75%'
                      : 'bg-gradient-to-r from-white/95 via-white/70 via-45% to-transparent to-75%'
                  }`} />
                </>
              )}

              {slideOverlay === 'solid-tint' && (
                <div className="absolute inset-0 bg-black/40 pointer-events-none" />
              )}
            </div>
          );
        })}

        {/* النصوص والأزرار الترويجية المتموضعة في حاوية محاذاة لشبكة الموقع الداخلية */}
        <div className="relative z-20 h-full w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className={`h-full w-full ${hasCustomCoordinates ? 'relative overflow-hidden pointer-events-none' : `flex flex-col ${verticalClass} py-6 sm:py-9 lg:py-12`}`}>
            {hasCustomCoordinates ? (
              <div
                style={{
                  position: 'absolute',
                  top: `${Math.min(85, Math.max(10, customY!))}%`,
                  ...(isRTL 
                    ? { right: `${Math.min(85, Math.max(5, customX!))}%` } 
                    : { left: `${Math.min(85, Math.max(5, customX!))}%` }),
                  maxWidth: `${maxWidthPercent}%`,
                  transform: `translate(${isRTL ? (customX! > 50 ? '30%' : '0') : (customX! > 50 ? '-30%' : '0')}, ${customY! > 50 ? '-50%' : '0'})`
                }}
                className={`w-auto min-w-[280px] p-4 pointer-events-auto ${textAlignmentClass} ${fontClass} space-y-3 sm:space-y-4 animate-in fade-in duration-500`}
              >
                {displayBadge && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs sm:text-sm font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow-xs backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{displayBadge}</span>
                  </div>
                )}

                <h1 className={`${titleSizeClass} ${titleColor}`}>
                  {displayTitle}
                </h1>

                {displaySubtitle && (
                  <p className={`text-xs sm:text-sm md:text-base ${subtitleColor} font-normal leading-relaxed line-clamp-3 sm:line-clamp-4`}>
                    {displaySubtitle}
                  </p>
                )}

                <div className={`pt-2 flex flex-wrap items-center gap-3 sm:gap-5 ${
                  textAlign === 'center' ? 'justify-center' : textAlign === 'end' ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-start' : 'justify-start')
                }`}>
                  <button 
                    onClick={handleCtaClick}
                    className={`${getCtaButtonClass()} px-7 sm:px-9 py-3.5 rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 active:scale-95 flex items-center gap-2 cursor-pointer group/btn`}
                  >
                    <span>{displayCta}</span>
                    {isRTL ? (
                      <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover/btn:-translate-x-1" />
                    ) : (
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className={`flex w-full ${textSpreadMode === 'split' ? '' : justifyClass}`}>
                {textSpreadMode === 'split' ? (
                  <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div 
                      style={{ maxWidth: maxWidthPercent === 100 ? '100%' : `${Math.max(maxWidthPercent, 65)}%` }}
                      className={`flex-1 min-w-0 ${textAlignmentClass} ${fontClass} space-y-3 sm:space-y-4`}
                    >
                      {displayBadge && (
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow-xs backdrop-blur-md">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>{displayBadge}</span>
                        </div>
                      )}

                      <h1 className={`${titleSizeClass} ${titleColor}`}>
                        {displayTitle}
                      </h1>

                      {displaySubtitle && (
                        <p className={`text-sm sm:text-base md:text-lg ${subtitleColor} font-normal leading-relaxed max-w-3xl`}>
                          {displaySubtitle}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex flex-wrap items-center gap-3 sm:gap-4 pt-2 md:pt-0">
                      <button 
                        onClick={handleCtaClick}
                        className={`${getCtaButtonClass()} px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 active:scale-95 flex items-center gap-2.5 cursor-pointer group/btn shadow-xl`}
                      >
                        <span>{displayCta}</span>
                        {isRTL ? (
                          <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover/btn:-translate-x-1" />
                        ) : (
                          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                        )}
                      </button>

                      {slides.length > 1 && (
                        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full backdrop-blur-md bg-black/40 border border-white/15 shadow-md">
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
                          <span className="text-xs font-bold font-mono ms-1 text-white/90">
                            0{currentIndex + 1} / 0{slides.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div 
                    style={{ 
                      maxWidth: textSpreadMode === 'extended' 
                        ? (maxWidthPercent === 100 ? '100%' : `${Math.max(maxWidthPercent, 80)}%`) 
                        : `${maxWidthPercent}%` 
                    }}
                    className={`w-full min-w-[280px] ${textAlignmentClass} ${fontClass} space-y-3.5 sm:space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500`}
                  >
                    {displayBadge && (
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow-xs backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{displayBadge}</span>
                      </div>
                    )}

                    <h1 className={`${titleSizeClass} ${titleColor}`}>
                      {displayTitle}
                    </h1>

                    {displaySubtitle && (
                      <p className={`text-sm sm:text-base md:text-lg ${subtitleColor} font-normal leading-relaxed ${
                        textSpreadMode === 'extended' ? 'max-w-4xl' : 'line-clamp-3 sm:line-clamp-4'
                      }`}>
                        {displaySubtitle}
                      </p>
                    )}

                    <div className={`pt-2 flex flex-wrap items-center gap-3 sm:gap-5 ${
                      textAlign === 'center' ? 'justify-center' : textAlign === 'end' ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-start' : 'justify-start')
                    }`}>
                      <button 
                        onClick={handleCtaClick}
                        className={`${getCtaButtonClass()} px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 active:scale-95 flex items-center gap-2.5 cursor-pointer group/btn`}
                      >
                        <span>{displayCta}</span>
                        {isRTL ? (
                          <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover/btn:-translate-x-1" />
                        ) : (
                          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                        )}
                      </button>

                      {slides.length > 1 && (
                        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full backdrop-blur-md bg-black/40 border border-white/15 shadow-md">
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
                          <span className="text-xs font-bold font-mono ms-1 text-white/90">
                            0{currentIndex + 1} / 0{slides.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* أزرار تقليب الشرائح الجانبية عند وجود أكثر من شريحة */}
        {slides.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous slide"
              className={`absolute top-1/2 -translate-y-1/2 z-30 ${
                isRTL ? 'right-3 sm:right-5' : 'left-3 sm:left-5'
              } w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/30 hover:bg-black/60 text-white border border-white/20 shadow-lg flex items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-all duration-200 cursor-pointer backdrop-blur-md`}
            >
              {isRTL ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
            </button>
            <button
              onClick={handleNext}
              aria-label="Next slide"
              className={`absolute top-1/2 -translate-y-1/2 z-30 ${
                isRTL ? 'left-3 sm:left-5' : 'right-3 sm:right-5'
              } w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/30 hover:bg-black/60 text-white border border-white/20 shadow-lg flex items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-all duration-200 cursor-pointer backdrop-blur-md`}
            >
              {isRTL ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
