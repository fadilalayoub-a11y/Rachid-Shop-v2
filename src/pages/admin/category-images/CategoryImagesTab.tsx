import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import {
  Upload,
  Check,
  RotateCcw,
  Layers,
  Type,
  CheckCircle2
} from 'lucide-react';
import { DEFAULT_CATEGORIES_DATA, CATEGORIES_STORAGE_KEY } from '../../../components/ShopByCategories';

export interface CategoryCustomNames {
  ar?: string;
  en?: string;
}

export function CategoryImagesTab() {
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [categoryNames, setCategoryNames] = useState<Record<string, CategoryCustomNames>>({});
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [savedCategoryId, setSavedCategoryId] = useState<string | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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
                if (key !== 'images' && key !== 'names' && key !== 'updatedAt' && typeof val === 'string' && val.trim() !== '') {
                  cleanImages[key] = val;
                }
              });
            }

            if (data.names && typeof data.names === 'object') {
              Object.entries(data.names).forEach(([key, val]) => {
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
        DEFAULT_CATEGORIES_DATA.forEach(cat => {
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
      setCategoryImages(prev => ({
        ...prev,
        [categoryId]: uploadedUrl
      }));

      setSavedCategoryId(categoryId);
      setTimeout(() => setSavedCategoryId(null), 3000);
    } catch (err: any) {
      console.error('Error uploading category image:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploadingCategory(null);
    }
  };

  const handleNameChange = (categoryId: string, lang: 'ar' | 'en', value: string) => {
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
    const defaultCat = DEFAULT_CATEGORIES_DATA.find(c => c.id === categoryId);
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            <span>تخصيص صور وعناوين الأقسام (تسوق حسب الفئات)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            قم بتغيير صورة أي قسم أو تعديل اسمه ليظهر فوراً في الواجهة الرئيسية للمتجر
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          {isSaving ? (
            <span>جاري الحفظ...</span>
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>تم الحفظ بنجاح!</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>حفظ جميع التغييرات</span>
            </>
          )}
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
          {errorMessage}
        </div>
      )}

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEFAULT_CATEGORIES_DATA.map((category) => {
          const currentImage = categoryImages[category.id] || category.image;
          const customNameAr = categoryNames[category.id]?.ar || '';
          const customNameEn = categoryNames[category.id]?.en || '';
          const isUploadingThis = uploadingCategory === category.id;
          const isJustSaved = savedCategoryId === category.id;

          return (
            <div
              key={category.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:border-blue-200 transition-all group"
            >
              {/* Category Image Box */}
              <div className="relative aspect-4/3 w-full bg-gray-100 overflow-hidden">
                <img
                  src={currentImage}
                  alt={category.nameAr}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-between p-4">
                  <span className="self-start px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold rounded-lg">
                    {category.nameEn}
                  </span>

                  <div>
                    <h3 className="text-white font-black text-lg drop-shadow-sm">
                      {customNameAr || category.nameAr}
                    </h3>
                  </div>
                </div>

                {isUploadingThis && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold gap-2">
                    <span className="animate-spin text-lg">⏳</span>
                    <span>جاري رفع الصورة...</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                      <Type className="w-3 h-3 text-blue-600" />
                      <span>الاسم بالعربية:</span>
                    </label>
                    <input
                      type="text"
                      value={customNameAr}
                      onChange={(e) => handleNameChange(category.id, 'ar', e.target.value)}
                      placeholder={category.nameAr}
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                      <Type className="w-3 h-3 text-gray-400" />
                      <span>الاسم بالإنجليزية (English):</span>
                    </label>
                    <input
                      type="text"
                      value={customNameEn}
                      onChange={(e) => handleNameChange(category.id, 'en', e.target.value)}
                      placeholder={category.nameEn}
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
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
                    className="flex-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>تغيير الصورة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReset(category.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="استعادة الصورة والاسم الافتراضي"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isJustSaved && (
                  <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>تم تحديث صورة القسم!</span>
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
