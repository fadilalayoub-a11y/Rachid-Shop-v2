import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import {
  Upload,
  Check,
  RotateCcw,
  Layers,
  Type,
  CheckCircle2,
  Sparkles,
  Search,
  SlidersHorizontal,
  Globe
} from 'lucide-react';
import { DEFAULT_CATEGORIES_DATA, CATEGORIES_STORAGE_KEY } from '../../../components/ShopByCategories';
import { STYLES_DATA, StyleCard } from '../../../components/ShopByStyle';

export interface CategoryCustomNames {
  ar?: string;
  en?: string;
  fr?: string;
}

export interface UnifiedCategoryItem {
  id: string;
  nameEn: string;
  nameAr: string;
  nameFr: string;
  image: string;
  link: string;
  group: 'products' | 'style';
  groupLabelAr: string;
  groupLabelEn: string;
}

export function CategoryImagesTab() {
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [categoryNames, setCategoryNames] = useState<Record<string, CategoryCustomNames>>({});
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [savedCategoryId, setSavedCategoryId] = useState<string | null>(null);
  
  // UI filter & search states
  const [activeFilterGroup, setActiveFilterGroup] = useState<'all' | 'products' | 'style'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Merge default categories and style categories into a unified list
  const allCategoryItems: UnifiedCategoryItem[] = [
    ...DEFAULT_CATEGORIES_DATA.map((cat) => ({
      ...cat,
      group: 'products' as const,
      groupLabelAr: 'تصنيف منتجات',
      groupLabelEn: 'Product Category',
    })),
    ...STYLES_DATA.map((style: StyleCard) => ({
      id: style.id,
      nameEn: style.nameEn,
      nameAr: style.nameAr,
      nameFr: style.nameFr,
      image: style.image,
      link: style.link,
      group: 'style' as const,
      groupLabelAr: 'قسم ستايل ومظهر',
      groupLabelEn: 'Style & Look Section',
    })),
  ];

  useEffect(() => {
    const docRef = doc(db, 'settings', 'category_images');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && typeof data === 'object') {
            const cleanImages: Record<string, string> = {};
            const cleanNames: Record<string, CategoryCustomNames> = {};

            if (data.images && typeof data.images === 'object') {
              Object.entries(data.images).forEach(([key, val]) => {
                if (typeof val === 'string' && val.trim() !== '') {
                  cleanImages[key] = val;
                }
              });
            } else {
              Object.entries(data).forEach(([key, val]) => {
                if (key !== 'images' && key !== 'names' && key !== 'customNames' && key !== 'updatedAt' && typeof val === 'string' && val.trim() !== '') {
                  cleanImages[key] = val;
                }
              });
            }

            const namesSource = data.names || data.customNames;
            if (namesSource && typeof namesSource === 'object') {
              Object.entries(namesSource).forEach(([key, val]) => {
                if (val && typeof val === 'object') {
                  cleanNames[key] = val as CategoryCustomNames;
                }
              });
            }

            if (Object.keys(cleanImages).length > 0 || Object.keys(cleanNames).length > 0) {
              setCategoryImages(cleanImages);
              setCategoryNames(cleanNames);
              return;
            }
          }
        }
        
        try {
          const localCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
          if (localCategories) {
            const parsed = JSON.parse(localCategories);
            if (parsed && typeof parsed === 'object') {
              setCategoryImages(parsed.images || parsed);
              if (parsed.names) setCategoryNames(parsed.names);
              return;
            }
          }
        } catch {
          // ignore
        }

        const initial: Record<string, string> = {};
        allCategoryItems.forEach(cat => {
          initial[cat.id] = cat.image;
        });
        setCategoryImages(initial);
      },
      (err) => {
        console.warn('Category settings load warning:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleImageUpload = async (categoryId: string, file: File) => {
    setUploadingCategory(categoryId);
    setErrorMessage('');
    
    try {
      const sigRes = await fetch('/api/cloudinary-sign');
      if (!sigRes.ok) {
        throw new Error('إعدادات Cloudinary غير متوفرة في السيرفر.');
      }
      
      const sigData = await sigRes.json();
      const { timestamp, signature, apiKey, cloudName } = sigData;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.secure_url) {
        throw new Error(uploadData.error?.message || 'فشل رفع الصورة إلى Cloudinary.');
      }

      const uploadedUrl = uploadData.secure_url;
      const updatedImages = {
        ...categoryImages,
        [categoryId]: uploadedUrl
      };
      setCategoryImages(updatedImages);

      // Auto save single upload to persistence
      const payload = {
        images: updatedImages,
        names: categoryNames,
        customNames: categoryNames,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'settings', 'category_images'), payload, { merge: true });
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(payload));

      setSavedCategoryId(categoryId);
      setTimeout(() => setSavedCategoryId(null), 3000);
    } catch (err: any) {
      console.error('Error uploading category image:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploadingCategory(null);
    }
  };

  const handleNameChange = (categoryId: string, lang: 'ar' | 'en' | 'fr', value: string) => {
    setCategoryNames(prev => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] || {}),
        [lang]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage('');
    try {
      const payload = JSON.parse(
        JSON.stringify({
          images: categoryImages,
          names: categoryNames,
          customNames: categoryNames,
          updatedAt: new Date().toISOString()
        })
      );

      await setDoc(doc(db, 'settings', 'category_images'), payload);
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(payload));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving category images:', err);
      setErrorMessage('تعذر الحفظ في قاعدة البيانات. تحقق من الاتصال بالإنترنت.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = (categoryId: string) => {
    const defaultCat = allCategoryItems.find(c => c.id === categoryId);
    if (defaultCat) {
      setCategoryImages(prev => ({
        ...prev,
        [categoryId]: defaultCat.image
      }));
      setCategoryNames(prev => {
        const copy = { ...prev };
        delete copy[categoryId];
        return copy;
      });
    }
  };

  // Filtering categories
  const filteredCategories = allCategoryItems.filter(item => {
    const matchesGroup = activeFilterGroup === 'all' || item.group === activeFilterGroup;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesGroup;

    const customName = categoryNames[item.id];
    const matchesName = 
      item.nameAr.toLowerCase().includes(q) ||
      item.nameEn.toLowerCase().includes(q) ||
      item.nameFr.toLowerCase().includes(q) ||
      (customName?.ar && customName.ar.toLowerCase().includes(q)) ||
      (customName?.en && customName.en.toLowerCase().includes(q)) ||
      (customName?.fr && customName.fr.toLowerCase().includes(q));

    return matchesGroup && matchesName;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-stone-900">
              تخصيص صور وعناوين الأقسام (تسوق حسب الفئات + أقسام الستايل والمظهر)
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
            يمكنك تغيير صورة أو تعديل اسم أي قسم (بالعربية، الفرنسية، والإنجليزية) لتظهر التعديلات فوراً وبشكل حي في واجهة المتجر.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-stone-950 hover:bg-stone-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          {isSaving ? (
            <span>جاري الحفظ...</span>
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>تم الحفظ بنجاح!</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>حفظ جميع التعديلات</span>
            </>
          )}
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilterGroup('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilterGroup === 'all'
                ? 'bg-stone-950 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            جميع الأقسام ({allCategoryItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterGroup('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilterGroup === 'products'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>تصنيفات المنتجات (14)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterGroup('style')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilterGroup === 'style'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>أقسام الستايل ({STYLES_DATA.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث عن قسم..."
            className="w-full pl-3 pr-9 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-950 focus:outline-hidden"
          />
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
          {errorMessage}
        </div>
      )}

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => {
          const currentImage = categoryImages[category.id] || category.image;
          const customNameAr = categoryNames[category.id]?.ar || '';
          const customNameFr = categoryNames[category.id]?.fr || '';
          const customNameEn = categoryNames[category.id]?.en || '';
          const isUploadingThis = uploadingCategory === category.id;
          const isJustSaved = savedCategoryId === category.id;

          const isStyleCategory = category.group === 'style';

          return (
            <div
              key={category.id}
              className={`bg-white rounded-2xl shadow-xs border overflow-hidden flex flex-col transition-all group ${
                isStyleCategory ? 'border-purple-200/80 hover:border-purple-300' : 'border-stone-200/80 hover:border-blue-300'
              }`}
            >
              {/* Category Image Box */}
              <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
                <img
                  src={currentImage}
                  alt={category.nameAr}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold rounded-lg uppercase tracking-wider">
                      {category.nameEn}
                    </span>

                    {isStyleCategory ? (
                      <span className="px-2.5 py-1 bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>قسم ستايل ومظهر</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg">
                        تصنيف منتجات
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-white font-black text-lg drop-shadow-sm">
                      {customNameAr || category.nameAr}
                    </h3>
                  </div>
                </div>

                {isUploadingThis && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold gap-2">
                    <span className="animate-spin text-lg">⏳</span>
                    <span>جاري رفع الصورة إلى Cloudinary...</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between bg-stone-50/40">
                <div className="space-y-2.5">
                  {/* Arabic Name */}
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Type className="w-3 h-3 text-blue-600" />
                        <span>الاسم بالعربية (🇸🇦):</span>
                      </span>
                      <span className="text-[10px] text-stone-400 font-normal">الافتراضي: {category.nameAr}</span>
                    </label>
                    <input
                      type="text"
                      value={customNameAr}
                      onChange={(e) => handleNameChange(category.id, 'ar', e.target.value)}
                      placeholder={category.nameAr}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  {/* French Name */}
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-indigo-500" />
                        <span>الاسم بالفرنسية (🇫🇷 Français):</span>
                      </span>
                      <span className="text-[10px] text-stone-400 font-normal" dir="ltr">{category.nameFr}</span>
                    </label>
                    <input
                      type="text"
                      value={customNameFr}
                      onChange={(e) => handleNameChange(category.id, 'fr', e.target.value)}
                      placeholder={category.nameFr}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      dir="ltr"
                    />
                  </div>

                  {/* English Name */}
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Type className="w-3 h-3 text-stone-400" />
                        <span>الاسم بالإنجليزية (🇬🇧 English):</span>
                      </span>
                      <span className="text-[10px] text-stone-400 font-normal" dir="ltr">{category.nameEn}</span>
                    </label>
                    <input
                      type="text"
                      value={customNameEn}
                      onChange={(e) => handleNameChange(category.id, 'en', e.target.value)}
                      placeholder={category.nameEn}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-950 focus:outline-hidden"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(el) => { fileInputRefs.current[category.id] = el; }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(category.id, file);
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[category.id]?.click()}
                    disabled={isUploadingThis}
                    className={`flex-1 px-3 py-2 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                      isStyleCategory 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : 'bg-stone-950 hover:bg-stone-800 text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>تغيير الصورة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReset(category.id)}
                    className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
                    title="استعادة الصورة والاسم الافتراضي"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isJustSaved && (
                  <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تم حفظ صورة وبيانات القسم بنجاح!</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
