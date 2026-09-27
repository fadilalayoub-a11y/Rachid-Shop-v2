import React from 'react';
import { 
  Sparkles, 
  Languages, 
  Target 
} from 'lucide-react';
import { HeroSlide } from '../../../types';
import { translateHeroText } from '../../../utils/heroTranslation';
import { sanitizeHeroBadge } from '../../../components/Hero';
import { Language } from '../../../context/LanguageContext';

interface HeroInteractivePreviewProps {
  slide: HeroSlide;
  slideIndex: number;
  previewLang: Language;
  onLanguageChange: (lang: Language) => void;
  onUpdateField: (field: keyof HeroSlide, value: any) => void;
}

export function HeroInteractivePreview({
  slide,
  slideIndex,
  previewLang,
  onLanguageChange,
  onUpdateField
}: HeroInteractivePreviewProps) {
  const isAr = previewLang === 'ar';
  const pos = slide?.contentPosition || 'start';
  const vAlign = slide?.verticalAlign || 'bottom';
  const tAlign = slide?.textAlign || 'start';
  const maxW = slide?.maxWidthPercent || 55;
  const spreadMode = slide?.textSpreadMode || 'grouped';
  const isDark = slide?.textColorTheme === 'dark';
  const overlay = slide?.overlayStyle || 'charcoal-gradient';
  const fontF = slide?.fontFamily === 'serif' ? 'font-serif' : slide?.fontFamily === 'mono' ? 'font-mono' : 'font-sans';
  const ctaStyle = slide?.ctaStyle || 'white-solid';

  // Pinpoint coordinates
  const pX = isAr ? slide?.posX_ar : slide?.posX_en;
  const pY = isAr ? slide?.posY_ar : slide?.posY_en;
  const hasCoord = typeof pX === 'number' && typeof pY === 'number';

  const hJustify = pos === 'center' ? 'justify-center' : pos === 'end' ? 'justify-end' : 'justify-start';
  const vPos = vAlign === 'top' ? 'justify-start pt-6 sm:pt-8' : vAlign === 'bottom' ? 'justify-end pb-6 sm:pb-8' : 'justify-center';

  const previewTitle = previewLang === 'ar' 
    ? (slide?.title_ar || slide?.title || 'عالم متكامل من الأناقة والتميز')
    : previewLang === 'fr'
    ? (slide?.title_fr || translateHeroText(slide?.title || 'عالم متكامل من الأناقة والتميز', 'fr'))
    : (slide?.title_en || translateHeroText(slide?.title || 'عالم متكامل من الأناقة والتميز', 'en'));

  const previewSubtitle = previewLang === 'ar'
    ? (slide?.subtitle_ar || slide?.subtitle || 'اكتشف تشكيلتنا المتنوعة من أرقى الملابس العصرية، الأحذية الفاخرة، والإكسسوارات المصممة لتناسب ذوقك الرفيع في كل إطلالة.')
    : previewLang === 'fr'
    ? (slide?.subtitle_fr || translateHeroText(slide?.subtitle || '', 'fr'))
    : (slide?.subtitle_en || translateHeroText(slide?.subtitle || '', 'en'));

  const previewBadge = sanitizeHeroBadge(
    previewLang === 'ar' 
      ? (slide?.badge_ar || slide?.badge)
      : previewLang === 'fr'
      ? (slide?.badge_fr || slide?.badge)
      : (slide?.badge_en || slide?.badge)
  );

  const previewCta = previewLang === 'ar'
    ? (slide?.ctaText_ar || slide?.ctaText || 'استكشف التشكيلة')
    : previewLang === 'fr'
    ? (slide?.ctaText_fr || translateHeroText(slide?.ctaText || 'استكشف التشكيلة', 'fr'))
    : (slide?.ctaText_en || translateHeroText(slide?.ctaText || 'استكشف التشكيلة', 'en'));

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (previewLang === 'ar') {
      const posX = Math.round(100 - clickX);
      const posY = Math.round(clickY);
      onUpdateField('posX_ar', posX);
      onUpdateField('posY_ar', posY);
    } else {
      const posX = Math.round(clickX);
      const posY = Math.round(clickY);
      onUpdateField('posX_en', posX);
      onUpdateField('posY_en', posY);
    }
  };

  const handleResetPinpoint = () => {
    if (previewLang === 'ar') {
      onUpdateField('posX_ar', undefined);
      onUpdateField('posY_ar', undefined);
    } else {
      onUpdateField('posX_en', undefined);
      onUpdateField('posY_en', undefined);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-stone-900 border-b border-stone-200">
      {/* Top Bar: Language Switcher + Click Map notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-white">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-amber-400 flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>الصورة الإعلانية التفاعلية (معاينة حية ومباشرة بالكامل)</span>
          </span>
          <span className="text-[11px] text-stone-400 hidden md:inline">
            • انقر في أي مكان داخل الصورة لنقل الموضع فوراً
          </span>
        </div>

        {/* Language preview switcher */}
        <div className="flex items-center gap-2 bg-stone-800/90 p-1 rounded-xl border border-stone-700">
          <span className="text-[11px] font-bold text-stone-400 px-1.5 flex items-center gap-1">
            <Languages className="w-3 h-3 text-blue-400" />
            <span>معاينة اللغة:</span>
          </span>
          <button
            type="button"
            onClick={() => onLanguageChange('ar')}
            className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              previewLang === 'ar' ? 'bg-blue-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
            }`}
          >
            🇸🇦 العربية
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('fr')}
            className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              previewLang === 'fr' ? 'bg-blue-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
            }`}
          >
            🇫🇷 Français
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              previewLang === 'en' ? 'bg-blue-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {/* Interactive Screen Canvas with Real-Time Updates */}
      <div
        onClick={handleCanvasClick}
        className="relative w-full h-[280px] sm:h-[360px] md:h-[420px] rounded-2xl overflow-hidden shadow-2xl border border-stone-700/80 bg-stone-950 cursor-crosshair select-none group/canvas"
        title="انقر في أي مكان داخل الصورة لنقل النصوص فوراً"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Background Image */}
        <img
          src={slide?.image}
          alt="Slide Live Preview"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Overlays / Gradients */}
        {overlay === 'charcoal-gradient' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent sm:hidden pointer-events-none" />
            <div className={`absolute inset-0 hidden sm:block pointer-events-none ${
              isAr
                ? 'bg-gradient-to-tl from-stone-950/95 via-stone-950/50 to-transparent to-70%'
                : 'bg-gradient-to-tr from-stone-950/95 via-stone-950/50 to-transparent to-70%'
            }`} />
          </>
        )}

        {overlay === 'light-gradient' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent sm:hidden pointer-events-none" />
            <div className={`absolute inset-0 hidden sm:block pointer-events-none ${
              isAr
                ? 'bg-gradient-to-tl from-white/95 via-white/60 to-transparent to-70%'
                : 'bg-gradient-to-tr from-white/95 via-white/60 to-transparent to-70%'
            }`} />
          </>
        )}

        {overlay === 'solid-tint' && (
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        )}

        {/* Subtle Click-to-Position Target Grid on hover */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:10%_25%] pointer-events-none opacity-0 group-hover/canvas:opacity-100 transition-opacity duration-300" />

        {/* Pinpoint Target Marker if coordinates are active */}
        {hasCoord && (
          <div
            style={{
              top: `${pY}%`,
              ...(isAr ? { right: `${pX}%` } : { left: `${pX}%` }),
              transform: 'translate(-50%, -50%)'
            }}
            className="absolute z-30 pointer-events-none flex flex-col items-center animate-in fade-in zoom-in duration-300"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-black animate-bounce">
              <Target className="w-4 h-4" />
            </div>
            <span className="bg-stone-950/95 text-emerald-300 text-[9px] font-mono px-2 py-0.5 rounded-md shadow-lg mt-1 whitespace-nowrap border border-emerald-500/30">
              {isAr ? `يمين: ${pX}% | أعلى: ${pY}%` : `X: ${pX}% | Y: ${pY}%`}
            </span>
          </div>
        )}

        {/* Live Text Content Rendering in Canvas */}
        <div className={`relative z-20 h-full w-full ${hasCoord ? 'overflow-hidden pointer-events-none' : `flex flex-col ${vPos} p-6 sm:p-8 md:p-10 pointer-events-none`}`}>
          {hasCoord ? (
            <div
              style={{
                position: 'absolute',
                top: `${Math.min(85, Math.max(10, pY!))}%`,
                ...(isAr ? { right: `${Math.min(85, Math.max(5, pX!))}%` } : { left: `${Math.min(85, Math.max(5, pX!))}%` }),
                maxWidth: spreadMode === 'extended' ? '85%' : `${maxW}%`,
                transform: `translate(${isAr ? (pX! > 50 ? '30%' : '0') : (pX! > 50 ? '-30%' : '0')}, ${pY! > 50 ? '-50%' : '0'})`
              }}
              className={`w-auto min-w-[240px] p-3 ${fontF} space-y-2 pointer-events-none ${
                tAlign === 'center' ? 'text-center' : isAr ? 'text-right' : 'text-left'
              }`}
            >
              {previewBadge && (
                <span className="inline-block text-[10px] font-bold px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 backdrop-blur-md">
                  {previewBadge}
                </span>
              )}

              <h3 className={`text-lg sm:text-2xl md:text-3xl font-black leading-tight drop-shadow-md ${
                isDark ? 'text-stone-950' : 'text-white'
              }`}>
                {previewTitle}
              </h3>

              {previewSubtitle && (
                <p className={`text-xs sm:text-sm font-medium leading-relaxed drop-shadow-xs ${
                  isDark ? 'text-stone-700' : 'text-stone-200'
                } ${spreadMode === 'extended' ? '' : 'line-clamp-3'}`}>
                  {previewSubtitle}
                </p>
              )}

              <div className="pt-1">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg ${
                  ctaStyle === 'dark-solid'
                    ? 'bg-stone-950 text-white'
                    : ctaStyle === 'outline'
                    ? isDark ? 'border-2 border-stone-950 text-stone-950 bg-white/20' : 'border-2 border-white text-white bg-black/20'
                    : ctaStyle === 'accent'
                    ? 'bg-[#C5A265] text-stone-950 font-black'
                    : 'bg-white text-stone-950'
                }`}>
                  <span>{previewCta}</span>
                  <span>{isAr ? '←' : '→'}</span>
                </span>
              </div>
            </div>
          ) : (
            <div className={`flex w-full ${spreadMode === 'split' ? '' : hJustify}`}>
              {spreadMode === 'split' ? (
                <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div 
                    style={{ maxWidth: maxW === 100 ? '100%' : `${Math.max(maxW, 65)}%` }}
                    className={`flex-1 min-w-0 ${fontF} space-y-2 ${
                      tAlign === 'center' ? 'text-center' : isAr ? 'text-right' : 'text-left'
                    }`}
                  >
                    {previewBadge && (
                      <span className="inline-block text-[10px] font-bold px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 backdrop-blur-md">
                        {previewBadge}
                      </span>
                    )}

                    <h3 className={`text-lg sm:text-2xl md:text-3xl font-black leading-tight drop-shadow-md ${
                      isDark ? 'text-stone-950' : 'text-white'
                    }`}>
                      {previewTitle}
                    </h3>

                    {previewSubtitle && (
                      <p className={`text-xs sm:text-sm font-medium leading-relaxed max-w-2xl drop-shadow-xs ${
                        isDark ? 'text-stone-700' : 'text-stone-200'
                      }`}>
                        {previewSubtitle}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 pt-1 md:pt-0">
                    <span className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-xl ${
                      ctaStyle === 'dark-solid'
                        ? 'bg-stone-950 text-white'
                        : ctaStyle === 'outline'
                        ? isDark ? 'border-2 border-stone-950 text-stone-950 bg-white/20' : 'border-2 border-white text-white bg-black/20'
                        : ctaStyle === 'accent'
                        ? 'bg-[#C5A265] text-stone-950 font-black'
                        : 'bg-white text-stone-950'
                    }`}>
                      <span>{previewCta}</span>
                      <span>{isAr ? '←' : '→'}</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div 
                  style={{ 
                    maxWidth: spreadMode === 'extended' 
                      ? (maxW === 100 ? '100%' : `${Math.max(maxW, 80)}%`) 
                      : `${maxW}%` 
                  }}
                  className={`w-full min-w-[240px] ${fontF} space-y-2.5 ${
                    tAlign === 'center' ? 'text-center' : isAr ? 'text-right' : 'text-left'
                  }`}
                >
                  {previewBadge && (
                    <span className="inline-block text-[10px] font-bold px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 backdrop-blur-md">
                      {previewBadge}
                    </span>
                  )}

                  <h3 className={`text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight drop-shadow-md ${
                    isDark ? 'text-stone-950' : 'text-white'
                  }`}>
                    {previewTitle}
                  </h3>

                  {previewSubtitle && (
                    <p className={`text-xs sm:text-sm font-medium leading-relaxed drop-shadow-xs ${
                      isDark ? 'text-stone-700' : 'text-stone-200'
                    } ${spreadMode === 'extended' ? '' : 'line-clamp-3'}`}>
                      {previewSubtitle}
                    </p>
                  )}

                  <div className="pt-1">
                    <span className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-xl ${
                      ctaStyle === 'dark-solid'
                        ? 'bg-stone-950 text-white'
                        : ctaStyle === 'outline'
                        ? isDark ? 'border-2 border-stone-950 text-stone-950 bg-white/20' : 'border-2 border-white text-white bg-black/20'
                        : ctaStyle === 'accent'
                        ? 'bg-[#C5A265] text-stone-950 font-black'
                        : 'bg-white text-stone-950'
                    }`}>
                      <span>{previewCta}</span>
                      <span>{isAr ? '←' : '→'}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Coordinates Info & Reset Pinpoint bar */}
      <div className="flex flex-wrap items-center justify-between pt-2.5 text-xs text-stone-300 gap-2">
        <div className="flex items-center gap-3">
          <span>
            🇸🇦 <strong className="text-white">موضع العربية:</strong>{' '}
            {typeof slide?.posX_ar === 'number' ? `يمين ${slide.posX_ar}%، أعلى ${slide.posY_ar}%` : 'تلقائي (افتراضي)'}
          </span>
          <span>
            🇬🇧 <strong className="text-white">موضع الإنجليزية:</strong>{' '}
            {typeof slide?.posX_en === 'number' ? `يسار ${slide.posX_en}%، أعلى ${slide.posY_en}%` : 'تلقائي (افتراضي)'}
          </span>
        </div>

        {hasCoord && (
          <button
            type="button"
            onClick={handleResetPinpoint}
            className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
          >
            إلغاء التثبيت والعودة للموضع الافتراضي ({isAr ? 'العربية' : 'الإنجليزية'})
          </button>
        )}
      </div>
    </div>
  );
}
