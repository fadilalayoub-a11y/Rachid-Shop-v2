import React from 'react';
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
  Globe 
} from 'lucide-react';
import { HeroSlide } from '../../../types';

interface HeroSlideControlsProps {
  slide: HeroSlide;
  slideIndex: number;
  onUpdateField: (field: keyof HeroSlide, value: any) => void;
}

export function HeroSlideControls({
  slide,
  slideIndex,
  onUpdateField
}: HeroSlideControlsProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Section A: Main Texts & Button CTA */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Type className="w-4 h-4 text-blue-600" />
            <span>نصوص الإعلان وزر الشراء</span>
          </h3>
          <span className="text-[11px] text-gray-400">تحديث فوري بالصورة أعلاه ⚡</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title Input */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1">
              <span>العنوان الرئيسي للإعلان:</span>
            </label>
            <input
              type="text"
              value={slide?.title || ''}
              onChange={(e) => onUpdateField('title', e.target.value)}
              placeholder="مثال: عالم متكامل من الأناقة والتميز..."
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold text-gray-900 bg-white"
            />
          </div>

          {/* Subtitle Input */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1">
              <AlignRight className="w-3.5 h-3.5 text-gray-500" />
              <span>الوصف التوضيحي تحت العنوان:</span>
            </label>
            <textarea
              rows={2}
              value={slide?.subtitle || ''}
              onChange={(e) => onUpdateField('subtitle', e.target.value)}
              placeholder="اكتب تفاصيل الإعلان أو التشكيلة لتوضيح تنوع المنتجات..."
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-gray-700 bg-white resize-none"
            />
          </div>

          {/* Badge Input */}
          <div>
            <label className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              <span>الشارة العلوية (اختياري - اتركه فارغاً لإخفائه):</span>
            </label>
            <input
              type="text"
              value={slide?.badge || ''}
              onChange={(e) => onUpdateField('badge', e.target.value)}
              placeholder="اتركه فارغاً إن لم ترغب بوجود شارة"
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-gray-800 bg-white"
            />
          </div>

          {/* Button CTA text */}
          <div>
            <label className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1">
              <MousePointerClick className="w-3.5 h-3.5 text-emerald-600" />
              <span>نص زر الشراء (CTA):</span>
            </label>
            <input
              type="text"
              value={slide?.ctaText || ''}
              onChange={(e) => onUpdateField('ctaText', e.target.value)}
              placeholder="استكشف التشكيلة"
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-gray-800 bg-white"
            />
          </div>

          {/* CTA Link Destination */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-indigo-600" />
              <span>وجهة الزر (أين يوجه الزائر عند النقر؟):</span>
            </label>
            <select
              value={slide?.ctaLink || '#products'}
              onChange={(e) => onUpdateField('ctaLink', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-gray-800 bg-white cursor-pointer"
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
      </div>

      {/* Section B: Text Spread & Width Controls */}
      <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-3">
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

      {/* Section C: Advanced Layout & Appearance */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>تخصيص الموضع والخط والتعتيم وزر الشراء</span>
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
              value={slide?.fontFamily || 'sans'}
              onChange={(e) => onUpdateField('fontFamily', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
            >
              <option value="sans">Sans (عصري قياسي وواضح)</option>
              <option value="serif">Serif (كلاسيكي فاخر ورسمي)</option>
              <option value="mono">Mono (تقني مميز)</option>
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
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
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

      {/* Section D: Optional Multilingual Custom Overrides */}
      <details className="group border border-gray-200 rounded-xl p-3 bg-stone-50/50">
        <summary className="text-xs font-bold text-stone-700 cursor-pointer flex items-center justify-between select-none">
          <span className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>تخصيص الترجمات اليدوية (فرنسي / إنجليزي - اختياري)</span>
          </span>
          <span className="text-[10px] text-blue-600 group-open:rotate-180 transition-transform">▼</span>
        </summary>

        <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 border-t border-gray-200">
          {/* French overrides */}
          <div className="space-y-2 p-3 bg-white rounded-lg border border-gray-200">
            <span className="text-xs font-bold text-stone-800">🇫🇷 اللغة الفرنسية (Français):</span>
            <input
              type="text"
              value={slide?.title_fr || ''}
              onChange={(e) => onUpdateField('title_fr', e.target.value)}
              placeholder="Titre en français..."
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg"
            />
            <textarea
              rows={2}
              value={slide?.subtitle_fr || ''}
              onChange={(e) => onUpdateField('subtitle_fr', e.target.value)}
              placeholder="Description en français..."
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg resize-none"
            />
            <input
              type="text"
              value={slide?.ctaText_fr || ''}
              onChange={(e) => onUpdateField('ctaText_fr', e.target.value)}
              placeholder="Texte du bouton..."
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg"
            />
          </div>

          {/* English overrides */}
          <div className="space-y-2 p-3 bg-white rounded-lg border border-gray-200">
            <span className="text-xs font-bold text-stone-800">🇬🇧 اللغة الإنجليزية (English):</span>
            <input
              type="text"
              value={slide?.title_en || ''}
              onChange={(e) => onUpdateField('title_en', e.target.value)}
              placeholder="Title in English..."
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg"
            />
            <textarea
              rows={2}
              value={slide?.subtitle_en || ''}
              onChange={(e) => onUpdateField('subtitle_en', e.target.value)}
              placeholder="Description in English..."
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg resize-none"
            />
            <input
              type="text"
              value={slide?.ctaText_en || ''}
              onChange={(e) => onUpdateField('ctaText_en', e.target.value)}
              placeholder="Button text in English..."
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg"
            />
          </div>
        </div>
      </details>
    </div>
  );
}
