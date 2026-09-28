import React, { useState } from 'react';
import {
  Tag,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Globe,
  Layers,
  Loader2,
  CheckCircle2,
  Languages
} from 'lucide-react';
import {
  MAIN_CATEGORIES,
  STORE_SUBCATEGORIES,
  getSubcategoriesForCategory
} from '../../../constants/categories';
import { STORE_BRANDS } from '../../../constants/brands';
import { ProductStyle, ProductBadge } from '../../../types';
import { requestProductAiTranslation } from '../../../utils/productLocalization';

export const STYLE_OPTIONS: { id: ProductStyle; nameAr: string; nameEn: string; desc: string; icon: string }[] = [
  {
    id: 'old_money',
    nameAr: 'أولد ماني (Old Money)',
    nameEn: 'Old Money',
    desc: 'فخامة هادئة، بولو راقي، قمصان كتان وموكاسان لوفر',
    icon: '👑',
  },
  {
    id: 'classic',
    nameAr: 'كلاسيكي ورسمي',
    nameEn: 'Classic',
    desc: 'قمصان راقية، سراويل قماش، وأحذية جلدية كلاسيكية',
    icon: '👔',
  },
  {
    id: 'streetwear',
    nameAr: 'ستريت وير (لبس الشارع)',
    nameEn: 'Streetwear',
    desc: 'قصات أوفرسايز، ستايل أوربان عصري، بولو واسع وسنيكرز',
    icon: '🔥',
  },
  {
    id: 'sportswear',
    nameAr: 'رياضي وجيم',
    nameEn: 'Sportswear',
    desc: 'كيطمات، هوديز، شورتات تمرين وسنيكرز رياضية',
    icon: '⚡',
  },
  {
    id: 'casual',
    nameAr: 'كاجوال ويومي',
    nameEn: 'Casual',
    desc: 'جينز مريح، قمصان يومية خفيفة وأحذية مريحة',
    icon: '☕',
  },
];

export const BADGE_OPTIONS: { id: ProductBadge; label: string; color: string; border: string }[] = [
  { id: 'none', label: 'بدون شارة (None)', color: 'bg-gray-100 text-gray-700', border: 'border-gray-200' },
  { id: 'new', label: 'وصل حديثاً (New)', color: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-300' },
  { id: 'sale', label: 'تخفيض (Sale / Solde)', color: 'bg-rose-100 text-rose-800', border: 'border-rose-300' },
  { id: 'best_seller', label: 'الأكثر مبيعاً (Best Seller)', color: 'bg-amber-100 text-amber-900', border: 'border-amber-300' },
  { id: 'trendy', label: 'تريندي (Trendy)', color: 'bg-purple-100 text-purple-800', border: 'border-purple-300' },
  { id: 'free_shipping', label: 'توصيل مجاني (Free Shipping)', color: 'bg-blue-100 text-blue-800', border: 'border-blue-300' },
];

export const POPULAR_TAGS = [
  'قطن 100%',
  'مريح',
  'صيفي 2026',
  'شتوي',
  'أوفرسايز',
  'جلد طبيعي',
  'مقاوم للماء',
  'فاخر',
  'إصدار محدود',
  'يومي كاجوال',
];

interface ProductBasicInfoSectionProps {
  title: string;
  setTitle: (val: string) => void;
  titleEn?: string;
  setTitleEn?: (val: string) => void;
  titleFr?: string;
  setTitleFr?: (val: string) => void;
  brandId: string;
  setBrandId: (val: string) => void;
  customBrandName: string;
  setCustomBrandName: (val: string) => void;
  style: ProductStyle;
  setStyle: (val: ProductStyle) => void;
  categoryId: 'clothes' | 'shoes' | 'accessories';
  onCategoryChange: (cat: 'clothes' | 'shoes' | 'accessories') => void;
  subcategoryId: string;
  setSubcategoryId: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  descriptionEn?: string;
  setDescriptionEn?: (val: string) => void;
  descriptionFr?: string;
  setDescriptionFr?: (val: string) => void;
  badge: ProductBadge;
  setBadge: (val: ProductBadge) => void;
  tagsList: string[];
  tagInput: string;
  setTagInput: (val: string) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  isSeoOpen: boolean;
  setIsSeoOpen: (val: boolean) => void;
  metaTitle: string;
  setMetaTitle: (val: string) => void;
  metaDescription: string;
  setMetaDescription: (val: string) => void;
  slug: string;
  setSlug: (val: string) => void;
}

export function ProductBasicInfoSection({
  title,
  setTitle,
  titleEn,
  setTitleEn,
  titleFr,
  setTitleFr,
  brandId,
  setBrandId,
  customBrandName,
  setCustomBrandName,
  style,
  setStyle,
  categoryId,
  onCategoryChange,
  subcategoryId,
  setSubcategoryId,
  description,
  setDescription,
  descriptionEn,
  setDescriptionEn,
  descriptionFr,
  setDescriptionFr,
  badge,
  setBadge,
  tagsList,
  tagInput,
  setTagInput,
  onAddTag,
  onRemoveTag,
  isSeoOpen,
  setIsSeoOpen,
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  slug,
  setSlug
}: ProductBasicInfoSectionProps) {
  const currentSubcategories = getSubcategoriesForCategory(categoryId);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationSuccess, setTranslationSuccess] = useState(false);
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);

  const handleAutoTranslate = async () => {
    if (!title.trim() || isTranslating) return;
    setIsTranslating(true);
    setTranslationSuccess(false);
    try {
      const result = await requestProductAiTranslation(title, description, 'ar');
      if (result) {
        if (setTitleEn && result.en?.name) setTitleEn(result.en.name);
        if (setTitleFr && result.fr?.name) setTitleFr(result.fr.name);
        if (setDescriptionEn && result.en?.description) setDescriptionEn(result.en.description);
        if (setDescriptionFr && result.fr?.description) setDescriptionFr(result.fr.description);
        if (setMetaTitle && !metaTitle && result.en?.name) {
          setMetaTitle(`${result.en.name} | RACHID SHOP`);
        }
        setIsLanguagesOpen(true);
        setTranslationSuccess(true);
        setTimeout(() => setTranslationSuccess(false), 4500);
      }
    } catch (e) {
      console.error('Translation error in admin:', e);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Basic Information Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>المعلومات الأساسية والتصنيف (Basic Info & Category)</span>
          </div>

          <button
            type="button"
            onClick={handleAutoTranslate}
            disabled={!title.trim() || isTranslating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 transition-all cursor-pointer active:scale-95"
            title="ترجمة فورية بالذكاء الاصطناعي للاسم والوصف إلى الإنجليزية والفرنسية"
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>جاري الترجمة الفورية...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>⚡ ترجمة فورية للاسم والوصف</span>
              </>
            )}
          </button>
        </h3>

        {/* Product Title */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-gray-800">
              اسم المنتج (Product Title) <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsLanguagesOpen(!isLanguagesOpen)}
              className="text-[11px] font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{isLanguagesOpen ? 'إخفاء حقول اللغات' : 'عرض حقول الترجمة (EN / FR)'}</span>
            </button>
          </div>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: قميص كتان كلاسيكي راقي (Classic Linen Shirt)"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold text-gray-900 bg-gray-50/50"
          />
        </div>

        {/* Translation Alert Banner */}
        {translationSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>تمت ترجمة اسم ووصف المنتج فورياً بنجاح وبدقة عالية إلى الإنجليزية والفرنسية!</span>
          </div>
        )}

        {/* Collapsible / Expandable Multilingual Fields */}
        {isLanguagesOpen && (
          <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl space-y-3 animate-in fade-in">
            <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5 mb-1">
              <Globe className="w-3.5 h-3.5 text-purple-600" />
              <span>الأسماء والأوصاف باللغات الأخرى (تُعرض تلقائياً للزوار حسب لغة الموقع)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  🇬🇧 اسم المنتج بالإنجليزية (English Title)
                </label>
                <input
                  type="text"
                  value={titleEn || ''}
                  onChange={(e) => setTitleEn && setTitleEn(e.target.value)}
                  placeholder="e.g. Classic Luxury Linen Shirt"
                  dir="ltr"
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  🇫🇷 اسم المنتج بالفرنسية (Titre en Français)
                </label>
                <input
                  type="text"
                  value={titleFr || ''}
                  onChange={(e) => setTitleFr && setTitleFr(e.target.value)}
                  placeholder="ex. Chemise en Lin Haut de Gamme"
                  dir="ltr"
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  🇬🇧 وصف المنتج بالإنجليزية (English Description)
                </label>
                <textarea
                  rows={2}
                  value={descriptionEn || ''}
                  onChange={(e) => setDescriptionEn && setDescriptionEn(e.target.value)}
                  placeholder="English description for international customers..."
                  dir="ltr"
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  🇫🇷 وصف المنتج بالفرنسية (Description en Français)
                </label>
                <textarea
                  rows={2}
                  value={descriptionFr || ''}
                  onChange={(e) => setDescriptionFr && setDescriptionFr(e.target.value)}
                  placeholder="Description en français..."
                  dir="ltr"
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Brand & Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Brand */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              الماركة / البراند (Brand)
            </label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {STORE_BRANDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
              <option value="custom">+ ماركة أخرى مخصصة...</option>
            </select>

            {brandId === 'custom' && (
              <input
                type="text"
                value={customBrandName}
                onChange={(e) => setCustomBrandName(e.target.value)}
                placeholder="اكتب اسم الماركة..."
                className="mt-2 w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Main Category */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              القسم الرئيسي (Category) <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => onCategoryChange(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold bg-white text-gray-900"
            >
              {MAIN_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameAr} ({cat.nameEn})
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              القسم الفرعي (Subcategory) <span className="text-rose-500">*</span>
            </label>
            <select
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold bg-white text-gray-900"
            >
              {currentSubcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.nameAr} ({sub.nameEn})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Style Selection Cards */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-2">
            ستايل ونمط الموضة (Fashion Style) <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStyle(opt.id)}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  style === opt.id
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">{opt.icon}</span>
                    {style === opt.id && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-gray-900">{opt.nameAr}</p>
                  <p className="text-[10px] text-gray-400 font-mono" dir="ltr">
                    {opt.nameEn}
                  </p>
                </div>
                <p className="text-[10px] text-gray-500 mt-2 leading-tight">
                  {opt.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1">
            وصف المنتج والمواصفات (Description)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اكتب وصفاً جذاباً يتضمن نوع القماش، تعليمات الغسيل، ومميزات القطعة..."
            className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-gray-800 bg-gray-50/30"
          />
        </div>
      </div>

      {/* 2. Badges & Tags Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>الشارات والعلامات الترويجية (Badges & Tags)</span>
        </h3>

        {/* Badges Select */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1.5">
            شارة المنتج البارزة (Product Ribbon / Badge)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {BADGE_OPTIONS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBadge(b.id)}
                className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  badge === b.id
                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-gray-200 bg-gray-50/50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className={`inline-block px-1.5 py-0.5 rounded-sm text-[10px] ${b.color}`}>
                  {b.label.split(' ')[0]}
                </span>
                <span className="block text-[10px] mt-1 text-gray-500 truncate">
                  {b.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tags & Keywords */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1.5">
            الكلمات الدلالية والوسوم (Tags)
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {tagsList.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-bold"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className="text-blue-500 hover:text-rose-600 cursor-pointer text-xs"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (tagInput.trim()) {
                    onAddTag(tagInput);
                    setTagInput('');
                  }
                }
              }}
              placeholder="اكتب وسماً ثم اضغط Enter..."
              className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => {
                if (tagInput.trim()) {
                  onAddTag(tagInput);
                  setTagInput('');
                }
              }}
              className="px-4 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              إضافة وسم
            </button>
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[10px] text-gray-400 font-bold">وسوم مقترحة:</span>
            {POPULAR_TAGS.map((pt) => (
              <button
                key={pt}
                type="button"
                onClick={() => onAddTag(pt)}
                disabled={tagsList.includes(pt)}
                className="text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md disabled:opacity-40 cursor-pointer"
              >
                +{pt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Collapsible SEO Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsSeoOpen(!isSeoOpen)}
          className="w-full p-5 flex items-center justify-between text-right hover:bg-gray-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-gray-900">
              إعدادات محركات البحث ومشاركة الرابط (SEO & URL Handle)
            </span>
          </div>
          {isSeoOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {isSeoOpen && (
          <div className="p-5 border-t border-gray-100 bg-gray-50/40 space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                الرابط الدائم للمنتج (Slug / Handle)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="oversized-cotton-tshirt"
                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg font-mono bg-white"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                عنوان صفحة المنتج في جوجل (SEO Title)
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="العنوان الذي يظهر في نتائج بحث جوجل..."
                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                وصف الميتا في جوجل (Meta Description)
              </label>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="الوصف الترويجي القصير لمحركات البحث..."
                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white resize-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
