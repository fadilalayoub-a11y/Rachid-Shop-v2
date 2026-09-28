import React, { useState } from 'react';
import { 
  Type, 
  Tag, 
  AlignRight, 
  MousePointerClick, 
  Navigation, 
  Layout, 
  Maximize2, 
  Sliders, 
  MoveHorizontal, 
  MoveVertical, 
  Palette, 
  Sparkles, 
  Globe,
  Copy,
  CheckCircle2,
  Languages
} from 'lucide-react';
import { HeroSlide, Language } from '../../../types';

interface HeroSlideControlsProps {
  slide: HeroSlide;
  slideIndex: number;
  activeLang?: Language;
  onSelectLang?: (lang: Language) => void;
  onUpdateField: (field: keyof HeroSlide, value: any) => void;
}

export function HeroSlideControls({
  slide,
  slideIndex,
  activeLang = 'ar',
  onSelectLang,
  onUpdateField
}: HeroSlideControlsProps) {
  const [internalLang, setInternalLang] = useState<Language>('ar');
  const currentLang = onSelectLang ? activeLang : internalLang;

  const handleSwitchLanguage = (lang: Language) => {
    if (onSelectLang) {
      onSelectLang(lang);
    } else {
      setInternalLang(lang);
    }
  };

  // Check language completion status
  const hasArTitle = Boolean(slide?.title_ar?.trim() || slide?.title?.trim());
  const hasFrTitle = Boolean(slide?.title_fr?.trim());
  const hasEnTitle = Boolean(slide?.title_en?.trim());

  // Copy Arabic values to current language
  const handleCopyFromArabic = () => {
    if (currentLang === 'fr') {
      if (slide?.title) onUpdateField('title_fr', slide.title_ar || slide.title);
      if (slide?.subtitle) onUpdateField('subtitle_fr', slide.subtitle_ar || slide.subtitle);
      if (slide?.badge) onUpdateField('badge_fr', slide.badge_ar || slide.badge);
      if (slide?.ctaText) onUpdateField('ctaText_fr', slide.ctaText_ar || slide.ctaText);
    } else if (currentLang === 'en') {
      if (slide?.title) onUpdateField('title_en', slide.title_ar || slide.title);
      if (slide?.subtitle) onUpdateField('subtitle_en', slide.subtitle_ar || slide.subtitle);
      if (slide?.badge) onUpdateField('badge_en', slide.badge_ar || slide.badge);
      if (slide?.ctaText) onUpdateField('ctaText_en', slide.ctaText_ar || slide.ctaText);
    }
  };

  return (
    <div className="p-5 sm:p-6 space-y-6">
      {/* ========================================================================= */}
      {/* SECTION 1: 3-LANGUAGE TABS & TEXT CONTENT EDITING */}
      {/* ========================================================================= */}
      <div className="bg-stone-50/80 rounded-2xl border border-stone-200 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
          <div>
            <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <Languages className="w-4 h-4 text-blue-600" />
              <span>تعديل نصوص الإعلان حسب اللغة (دعم كامل لـ 3 لغات):</span>
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              اختر اللغة لتعديل نصوصها بشكل مستقل ومعاينتها فوراً في الصورة بالأعلى ⚡
            </p>
          </div>

          {/* Quick copy tool for foreign languages */}
          {currentLang !== 'ar' && (
            <button
              type="button"
              onClick={handleCopyFromArabic}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-100/80 hover:bg-blue-200/80 rounded-xl transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
              title="نسخ محتوى النصوص من اللغة العربية لتعديلها وترجمتها بسرعة"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ من العربية كنقطة بداية</span>
            </button>
          )}
        </div>

        {/* 3 Prominent Language Tabs */}
        <div className="grid grid-cols-3 gap-2">
          {/* Tab 1: Arabic */}
          <button
            type="button"
            onClick={() => handleSwitchLanguage('ar')}
            className={`p-3 rounded-xl border font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              currentLang === 'ar'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100/80'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-base">🇸🇦</span>
              <span>العربية (الأساسية)</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              currentLang === 'ar' 
                ? 'bg-blue-700/80 text-blue-100' 
                : hasArTitle ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-500'
            }`}>
              {hasArTitle ? 'مكتملة ✓' : 'جاهزة للتعديل'}
            </span>
          </button>

          {/* Tab 2: French */}
          <button
            type="button"
            onClick={() => handleSwitchLanguage('fr')}
            className={`p-3 rounded-xl border font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              currentLang === 'fr'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100/80'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-base">🇫🇷</span>
              <span>Français</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              currentLang === 'fr' 
                ? 'bg-blue-700/80 text-blue-100' 
                : hasFrTitle ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {hasFrTitle ? 'مخصصة يدوياً ✓' : 'ترجمة تلقائية (أو خصصها)'}
            </span>
          </button>

          {/* Tab 3: English */}
          <button
            type="button"
            onClick={() => handleSwitchLanguage('en')}
            className={`p-3 rounded-xl border font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              currentLang === 'en'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100/80'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-base">🇬🇧</span>
              <span>English</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              currentLang === 'en' 
                ? 'bg-blue-700/80 text-blue-100' 
                : hasEnTitle ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {hasEnTitle ? 'مخصصة يدوياً ✓' : 'ترجمة تلقائية (أو خصصها)'}
            </span>
          </button>
        </div>

        {/* Input Fields for Currently Selected Language */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-4">
          {/* Header indicator */}
          <div className="flex items-center justify-between text-xs font-bold text-stone-800 bg-stone-50 px-3 py-2 rounded-lg border border-stone-200">
            <span className="flex items-center gap-2">
              <span>{currentLang === 'ar' ? '🇸🇦' : currentLang === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
              <span>
                {currentLang === 'ar' 
                  ? 'أنت تعدل حالياً النصوص باللغة العربية:' 
                  : currentLang === 'fr' 
                  ? 'Vous modifiez les textes en Français :' 
                  : 'You are editing texts in English:'}
              </span>
            </span>
            <span className="text-[11px] font-mono text-blue-600">
              {currentLang.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title Input */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-800 mb-1 flex items-center justify-between">
                <span>
                  {currentLang === 'ar' ? 'العنوان الرئيسي للإعلان:' : currentLang === 'fr' ? 'Titre principal de la bannière :' : 'Main Banner Title:'}
                </span>
                <span className="text-[10px] text-stone-400 font-normal">
                  {currentLang === 'ar' ? 'يظهر بالخط العريض' : 'Displayed prominently'}
                </span>
              </label>
              <input
                type="text"
                dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
                value={
                  currentLang === 'ar'
                    ? (slide?.title_ar || slide?.title || '')
                    : currentLang === 'fr'
                    ? (slide?.title_fr || '')
                    : (slide?.title_en || '')
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (currentLang === 'ar') {
                    onUpdateField('title_ar', val);
                    onUpdateField('title', val);
                  } else if (currentLang === 'fr') {
                    onUpdateField('title_fr', val);
                  } else {
                    onUpdateField('title_en', val);
                  }
                }}
                placeholder={
                  currentLang === 'ar' 
                    ? 'مثال: عالم متكامل من الأناقة والتميز...' 
                    : currentLang === 'fr' 
                    ? 'Ex: Un univers d\'élégance et d\'excellence...' 
                    : 'Ex: A world of elegance and excellence...'
                }
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold text-gray-900 bg-white"
              />
            </div>

            {/* Subtitle Input */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1">
                <AlignRight className="w-3.5 h-3.5 text-gray-500" />
                <span>
                  {currentLang === 'ar' ? 'الوصف التوضيحي تحت العنوان:' : currentLang === 'fr' ? 'Sous-titre / Description :' : 'Subtitle / Description:'}
                </span>
              </label>
              <textarea
                rows={2}
                dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
                value={
                  currentLang === 'ar'
                    ? (slide?.subtitle_ar || slide?.subtitle || '')
                    : currentLang === 'fr'
                    ? (slide?.subtitle_fr || '')
                    : (slide?.subtitle_en || '')
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (currentLang === 'ar') {
                    onUpdateField('subtitle_ar', val);
                    onUpdateField('subtitle', val);
                  } else if (currentLang === 'fr') {
                    onUpdateField('subtitle_fr', val);
                  } else {
                    onUpdateField('subtitle_en', val);
                  }
                }}
                placeholder={
                  currentLang === 'ar'
                    ? 'اكتب تفاصيل الإعلان أو التشكيلة...'
                    : currentLang === 'fr'
                    ? 'Description de la collection ou de la bannière...'
                    : 'Describe the collection or banner offer...'
                }
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-gray-700 bg-white resize-none"
              />
            </div>

            {/* Badge Input */}
            <div>
              <label className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {currentLang === 'ar' ? 'الشارة العلوية (اختياري):' : currentLang === 'fr' ? 'Badge supérieur (optionnel) :' : 'Top Badge (optional):'}
                </span>
              </label>
              <input
                type="text"
                dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
                value={
                  currentLang === 'ar'
                    ? (slide?.badge_ar !== undefined ? slide.badge_ar : (slide?.badge || ''))
                    : currentLang === 'fr'
                    ? (slide?.badge_fr || '')
                    : (slide?.badge_en || '')
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (currentLang === 'ar') {
                    onUpdateField('badge_ar', val);
                    onUpdateField('badge', val);
                  } else if (currentLang === 'fr') {
                    onUpdateField('badge_fr', val);
                  } else {
                    onUpdateField('badge_en', val);
                  }
                }}
                placeholder={currentLang === 'ar' ? 'اتركه فارغاً للإخفاء' : 'Laisser vide pour masquer'}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-gray-800 bg-white"
              />
            </div>

            {/* Button CTA text */}
            <div>
              <label className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1">
                <MousePointerClick className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {currentLang === 'ar' ? 'نص زر الشراء (CTA):' : currentLang === 'fr' ? 'Texte du bouton CTA :' : 'Button CTA text:'}
                </span>
              </label>
              <input
                type="text"
                dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
                value={
                  currentLang === 'ar'
                    ? (slide?.ctaText_ar || slide?.ctaText || '')
                    : currentLang === 'fr'
                    ? (slide?.ctaText_fr || '')
                    : (slide?.ctaText_en || '')
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (currentLang === 'ar') {
                    onUpdateField('ctaText_ar', val);
                    onUpdateField('ctaText', val);
                  } else if (currentLang === 'fr') {
                    onUpdateField('ctaText_fr', val);
                  } else {
                    onUpdateField('ctaText_en', val);
                  }
                }}
                placeholder={
                  currentLang === 'ar' ? 'استكشف التشكيلة' : currentLang === 'fr' ? 'Découvrir la collection' : 'Explore Collection'
                }
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-gray-800 bg-white font-bold"
              />
            </div>
          </div>
        </div>

        {/* CTA Link Destination (Shared) */}
        <div>
          <label className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-indigo-600" />
            <span>وجهة الزر عند النقر (أين يوجه الزائر؟):</span>
          </label>
          <select
            value={slide?.ctaLink || '#products'}
            onChange={(e) => onUpdateField('ctaLink', e.target.value)}
            className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-gray-800 bg-white cursor-pointer font-medium"
          >
            <option value="#products">قسم المنتجات في الصفحة الرئيسية</option>
            <option value="clothes">قسم الملابس (Clothes)</option>
            <option value="shoes">قسم الأحذية (Shoes)</option>
            <option value="accessories">قسم الإكسسوارات (Accessories)</option>
            <option value="collection:denim-casual">تشكيلة: جينز وكاجوال</option>
            <option value="collection:sportswear-gym">تشكيلة: ملابس رياضية</option>
            <option value="collection:summer-essentials">تشكيلة: أساسيات الصيف</option>
            <option value="collection:watches-fragrances">تشكيلة: ساعات وعطور</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: TEXT SPREAD & WIDTH CONTROLS */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <label className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-indigo-600" />
              <span>طريقة توزيع وتمديد الكتابة (تجميع أو تمديد):</span>
            </label>
            <p className="text-[11px] text-indigo-700/80 mt-0.5">
              اختر ما إذا كنت ترغب في تجميع النصوص ككتلة واحدة في الزاوية، أو تمديدها لتأخذ راحتها بعرض فسيح عبر البانر
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
            تحكم مرن في التمدد ↔️
          </span>
        </div>

        {/* Spread Mode Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => onUpdateField('textSpreadMode', 'grouped')}
            className={`p-3 rounded-xl border text-right transition-all flex flex-col gap-1 cursor-pointer ${
              (slide?.textSpreadMode || 'grouped') === 'grouped'
                ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-white/70 border-indigo-100 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                <span>📦</span>
                <span>مجمعة في مكان واحد</span>
              </span>
              {(slide?.textSpreadMode || 'grouped') === 'grouped' && (
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
              )}
            </div>
            <span className="text-[10px] text-stone-500 leading-tight">
              العنوان والوصف والزر مكدسة معاً في زاوية محددة
            </span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateField('textSpreadMode', 'extended')}
            className={`p-3 rounded-xl border text-right transition-all flex flex-col gap-1 cursor-pointer ${
              slide?.textSpreadMode === 'extended'
                ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-white/70 border-indigo-100 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                <span>↔️</span>
                <span>ممتدة وفسيحة أفقياً</span>
              </span>
              {slide?.textSpreadMode === 'extended' && (
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
              )}
            </div>
            <span className="text-[10px] text-stone-500 leading-tight">
              تمديد الكتابة لتأخذ مساحة أوسع دون تراكم الأسطر
            </span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateField('textSpreadMode', 'split')}
            className={`p-3 rounded-xl border text-right transition-all flex flex-col gap-1 cursor-pointer ${
              slide?.textSpreadMode === 'split'
                ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-white/70 border-indigo-100 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                <span>⚡</span>
                <span>موزعة على الأطراف</span>
              </span>
              {slide?.textSpreadMode === 'split' && (
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
              )}
            </div>
            <span className="text-[10px] text-stone-500 leading-tight">
              النصوص في جانب، وزر الشراء في الجانب المقابل
            </span>
          </button>
        </div>

        {/* Width Percentage & Stretch Quick Selectors */}
        <div className="pt-2 border-t border-indigo-100/80 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-stone-700 flex items-center gap-1">
              <Maximize2 className="w-3 h-3 text-stone-500" />
              <span>نسبة عرض وتمدد المساحة للكتابة:</span>
            </span>
            <span className="font-mono font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
              {slide?.maxWidthPercent || 55}%
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { val: 35, label: '35% ضيق' },
              { val: 50, label: '50% متوازن' },
              { val: 65, label: '65% ممتد' },
              { val: 80, label: '80% واسع' },
              { val: 100, label: '100% كامل العرض' }
            ].map((preset) => (
              <button
                key={preset.val}
                type="button"
                onClick={() => onUpdateField('maxWidthPercent', preset.val)}
                className={`px-3 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  (slide?.maxWidthPercent || 55) === preset.val
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: ADVANCED LAYOUT & APPEARANCE */}
      {/* ========================================================================= */}
      <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>تخصيص المظهر، نوع الخط، التعتيم وزر الشراء</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Horizontal Position (Fallback) */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
              <MoveHorizontal className="w-3.5 h-3.5 text-gray-500" />
              <span>الموضع الافتراضي:</span>
            </label>
            <select
              value={slide?.contentPosition || 'start'}
              onChange={(e) => onUpdateField('contentPosition', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
            >
              <option value="start">الجانب الافتراضي (يمين بالعربي / يسار بالإنجليزي)</option>
              <option value="center">في المنتصف تماماً</option>
              <option value="end">الجانب المعاكس (يسار بالعربي / يمين بالإنجليزي)</option>
            </select>
          </div>

          {/* Vertical Align */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
              <MoveVertical className="w-3.5 h-3.5 text-gray-500" />
              <span>المحاذاة العمودية:</span>
            </label>
            <select
              value={slide?.verticalAlign || 'bottom'}
              onChange={(e) => onUpdateField('verticalAlign', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
            >
              <option value="bottom">في الجزء السفلي</option>
              <option value="center">في وسط الارتفاع</option>
              <option value="top">في الجزء العلوي</option>
            </select>
          </div>

          {/* Color theme */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-gray-500" />
              <span>لون خط النصوص:</span>
            </label>
            <select
              value={slide?.textColorTheme || 'light'}
              onChange={(e) => onUpdateField('textColorTheme', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
            >
              <option value="light">أبيض (للصور الداكنة أو المظللة)</option>
              <option value="dark">داكن (للصور الفاتحة أو البيضاء)</option>
            </select>
          </div>

          {/* Font Family */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
              <Type className="w-3.5 h-3.5 text-gray-500" />
              <span>نمط الخط:</span>
            </label>
            <select
              value={slide?.fontFamily || 'cairo'}
              onChange={(e) => onUpdateField('fontFamily', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white font-medium"
            >
              <optgroup label="✨ خطوط عربية فاخرة وحديثة:">
                <option value="cairo">القاهرة - Cairo (الافتراضي: بارز وواضح جداً)</option>
                <option value="almarai">المراعي - Almarai (عصري وفخم - نمط Apple والموضة)</option>
                <option value="tajawal">تجوال - Tajawal (هندسي مريح وموزون)</option>
                <option value="ibm">IBM Plex Arabic (تقني احترافي للبراندات)</option>
                <option value="amiri">أميري - Amiri (كلاسيكي شرقي فاخر)</option>
              </optgroup>
              <optgroup label="👑 خطوط عالمية / لاتينية للموضة:">
                <option value="cinzel">Cinzel (دور الأزياء العالمية الفاخرة - Zara / Dior)</option>
                <option value="cormorant">Cormorant Garamond (سيريف إيطالي راقي)</option>
                <option value="montserrat">Montserrat (مودرن كلاسيكي قوي)</option>
                <option value="playfair">Playfair Display (فخامة كلاسيكية للمجلات)</option>
                <option value="mono">Monospace (طابع رقمي مميز)</option>
              </optgroup>
            </select>
          </div>

          {/* Title Size */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5 text-gray-500" />
              <span>حجم العنوان الرئيسي:</span>
            </label>
            <select
              value={slide?.titleSize || 'xlarge'}
              onChange={(e) => onUpdateField('titleSize', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white font-medium"
            >
              <option value="normal">عادي (مناسب للنصوص الطويلة)</option>
              <option value="large">كبير وبارز</option>
              <option value="xlarge">ضخم جداً وفاخر</option>
            </select>
          </div>

          {/* Overlay Style */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-gray-500" />
              <span>تدرج حماية القراءة:</span>
            </label>
            <select
              value={slide?.overlayStyle || 'charcoal-gradient'}
              onChange={(e) => onUpdateField('overlayStyle', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
            >
              <option value="charcoal-gradient">تدرج فحمي ناعم (Dark)</option>
              <option value="light-gradient">تدرج أبيض ناعم (Light)</option>
              <option value="solid-tint">تعتيم خفيف كامل</option>
              <option value="none">بدون تدرج (طبيعي)</option>
            </select>
          </div>

          {/* Button Style */}
          <div className="sm:col-span-2">
            <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
              <MousePointerClick className="w-3.5 h-3.5 text-gray-500" />
              <span>تصميم زر الشراء:</span>
            </label>
            <select
              value={slide?.ctaStyle || 'white-solid'}
              onChange={(e) => onUpdateField('ctaStyle', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
            >
              <option value="white-solid">زر أبيض وظل ناعم</option>
              <option value="dark-solid">زر أسود فاحم</option>
              <option value="outline">زر شفاف بإطار أنيق</option>
              <option value="accent">زر بلون المتجر الزيتي/الذهبي</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
