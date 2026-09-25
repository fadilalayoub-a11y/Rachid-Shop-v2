import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import {
  Upload,
  Check,
  RotateCcw,
  Layers,
  Type,
  CheckCircle2
} from 'lucide-react';
import { DEFAULT_CATEGORIES_DATA, CATEGORIES_STORAGE_KEY } from '../../components/ShopByCategories';

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

  // استرجاع صور وأسماء الأقسام المحفوظة حصرياً من Firestore (قاعدة البيانات الأساسية)
  useEffect(() => {
    const docRef = doc(db, 'settings', 'category_images');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && typeof data === 'object') {
            // تصفية الصور النقية
            const cleanImages: Record<string, string> = {};
            for (const [key, val] of Object.entries(data)) {
              if (key !== 'customNames' && typeof val === 'string' && !val.startsWith('data:')) {
                cleanImages[key] = val;
              }
            }
            setCategoryImages(cleanImages);

            // استرجاع الأسماء المخصصة للأقسام إن وجدت
            if (data.customNames && typeof data.customNames === 'object') {
              setCategoryNames(data.customNames as Record<string, CategoryCustomNames>);
            } else {
              setCategoryNames({});
            }

            try {
              localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(cleanImages));
            } catch (e) {
              console.warn(e);
            }
          }
        } else {
          setCategoryImages({});
          setCategoryNames({});
          try {
            localStorage.removeItem(CATEGORIES_STORAGE_KEY);
          } catch (e) {
            console.warn(e);
          }
        }
      },
      (err) => {
        console.warn('Firestore category_images listener error:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // حفظ التعديلات كاملة في Firestore
  const saveCategoriesData = async (
    imagesToSave: Record<string, string>,
    namesToSave: Record<string, CategoryCustomNames>
  ) => {
    setIsSaving(true);
    setErrorMessage('');
    try {
      const dataToSave = {
        ...imagesToSave,
        customNames: namesToSave,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'settings', 'category_images'), dataToSave);

      try {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(imagesToSave));
      } catch (e) {
        console.warn(e);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving categories data to Firestore:', err);
      setErrorMessage(
        `فشل الحفظ في قاعدة البيانات Firebase: ${err.message || 'يرجى التأكد من اتصال الإنترنت والصلاحيات'}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  // دالة رفع الصورة لقسم محدد مباشرة إلى Cloudinary
  const handleUploadForCategory = async (categoryId: string, file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setErrorMessage('يرجى اختيار ملف صورة صالح.');
      return;
    }

    setUploadingCategory(categoryId);
    setErrorMessage('');

    try {
      // 1. طلب تصريح الرفع الآمن إلى Cloudinary من السيرفر
      const sigRes = await fetch('/api/cloudinary-sign');
      if (!sigRes.ok) {
        const errData = await sigRes.json().catch(() => ({}));
        throw new Error(
          errData.error ||
            'إعدادات Cloudinary غير مكتملة في السيرفر. يرجى ضبط مفاتيح Cloudinary في ملف .env ليتم رفع الصورة بنجاح.'
        );
      }

      const sigData = await sigRes.json();
      const { timestamp, signature, apiKey, cloudName } = sigData;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);

      // 2. رفع الصورة مباشرة إلى Cloudinary
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.secure_url) {
        throw new Error(uploadData.error?.message || 'فشل رفع الصورة إلى Cloudinary.');
      }

      const uploadedUrl = uploadData.secure_url;

      // 3. تحديث وحفظ رابط Cloudinary في قاعدة البيانات Firestore
      const updatedImages = {
        ...categoryImages,
        [categoryId]: uploadedUrl,
      };
      setCategoryImages(updatedImages);
      await saveCategoriesData(updatedImages, categoryNames);
    } catch (err: any) {
      console.error('Upload category image error:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء رفع الصورة.');
    } finally {
      setUploadingCategory(null);
    }
  };

  // تعديل اسم وعنوان القسم
  const handleUpdateCategoryName = (categoryId: string, lang: 'ar' | 'en', val: string) => {
    setCategoryNames((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [lang]: val,
      },
    }));
  };

  // حفظ اسم قسم محدد
  const handleSaveCategoryName = async (categoryId: string) => {
    setSavedCategoryId(categoryId);
    await saveCategoriesData(categoryImages, categoryNames);
    setTimeout(() => setSavedCategoryId(null), 2500);
  };

  // استعادة الاسم الافتراضي لقسم محدد
  const handleResetCategoryName = async (categoryId: string) => {
    const updated = { ...categoryNames };
    delete updated[categoryId];
    setCategoryNames(updated);
    await saveCategoriesData(categoryImages, updated);
  };

  // استعادة الصورة الافتراضية لقسم محدد
  const handleResetCategoryImage = async (categoryId: string) => {
    const updated = { ...categoryImages };
    delete updated[categoryId];
    setCategoryImages(updated);
    await saveCategoriesData(updated, categoryNames);
  };

  // استعادة الكل إلى الافتراضي
  const handleResetAll = async () => {
    if (!window.confirm('هل أنت متأكد من استعادة كافة الصور والأسماء الافتراضية الأصلية لجميع الأقسام؟')) return;
    setCategoryImages({});
    setCategoryNames({});
    await saveCategoriesData({}, {});
  };

  return (
    <div className="space-y-6">
      {/* رأس الصفحة والشرح */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-2 rounded-xl bg-stone-900 text-white">
                <Layers className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-stone-900">إدارة صور وعناوين أقسام "Shop By Categories"</h2>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed">
              يمكنك هنا رفع صورة كل قسم وتعديل اسمه وعنوانه (بالعربية والإنجليزية) ليتم حفظها مباشرة في قاعدة البيانات وعرضها لكافة الزوار.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:text-red-600 hover:border-red-200 text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة الإعدادات الأصلية</span>
            </button>
          </div>
        </div>

        {/* تنبيهات النجاح والخطأ */}
        {saveSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>تم حفظ التعديلات بنجاح في قاعدة البيانات وتحديث المتجر فوراً!</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* شبكة الأقسام الـ 14 مع معاينة فورية وتعديل الاسم والصورة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {DEFAULT_CATEGORIES_DATA.map((cat) => {
          const currentImage = categoryImages[cat.id] || cat.image;
          const isCustomImage = !!categoryImages[cat.id];
          const isUploading = uploadingCategory === cat.id;

          const customNameObj = categoryNames[cat.id];
          const displayArName = customNameObj?.ar?.trim() || cat.nameAr;
          const displayEnName = customNameObj?.en?.trim() || cat.nameEn;
          const isCustomName = !!(customNameObj?.ar?.trim() || customNameObj?.en?.trim());
          const isJustSaved = savedCategoryId === cat.id;

          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              {/* شريط عنوان القسم الحالي */}
              <div className="p-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide truncate">
                    {displayEnName}
                  </h3>
                  <span className="text-xs text-stone-500 font-medium truncate block">
                    {displayArName}
                  </span>
                </div>
                <div className="flex gap-1 shrink-0">
                  {isCustomImage && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                      صورة مخصصة
                    </span>
                  )}
                  {isCustomName && (
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                      اسم معدل
                    </span>
                  )}
                </div>
              </div>

              {/* معاينة الصورة كما تظهر تماماً في المتجر */}
              <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden group">
                <img
                  src={currentImage}
                  alt={displayEnName}
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />

                {/* الشارة البيضاء السفلية كما بالمتجر تماماً مع الاسم المعدل */}
                <div className="absolute bottom-3 inset-x-0 flex justify-center px-2 pointer-events-none">
                  <div className="bg-white px-3 py-1.5 shadow-sm text-center max-w-[90%]">
                    <span className="block text-[11px] font-bold text-stone-900 tracking-wider uppercase truncate">
                      {displayEnName}
                    </span>
                    {customNameObj?.ar?.trim() && (
                      <span className="block text-[10px] text-stone-600 font-medium truncate">
                        {customNameObj.ar.trim()}
                      </span>
                    )}
                  </div>
                </div>

                {/* مؤشر الرفع جاري */}
                {isUploading && (
                  <div className="absolute inset-0 bg-stone-900/60 flex flex-col items-center justify-center text-white gap-2 backdrop-blur-xs">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold">جاري رفع الصورة إلى Cloudinary...</span>
                  </div>
                )}
              </div>

              {/* أزرار التحكم بالصورة وتعديل اسم القسم */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3 bg-white">
                <input
                  type="file"
                  accept="image/*"
                  ref={(el) => (fileInputRefs.current[cat.id] = el)}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadForCategory(cat.id, file);
                    e.target.value = '';
                  }}
                  className="hidden"
                />

                {/* زر رفع الصورة وزر استعادتها */}
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRefs.current[cat.id]?.click()}
                    disabled={isUploading || isSaving}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-stone-900 hover:bg-black text-white text-xs font-bold py-2 px-3 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع صورة جديدة</span>
                  </button>

                  {isCustomImage && (
                    <button
                      onClick={() => handleResetCategoryImage(cat.id)}
                      title="استعادة الصورة الأصلية لهذا القسم"
                      className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-stone-200 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* قسم تعديل اسم / عنوان القسم (بديل للرابط) */}
                <div className="pt-3 border-t border-stone-100 space-y-2 bg-stone-50/60 p-3 rounded-xl border border-stone-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-800 flex items-center gap-1">
                      <Type className="w-3.5 h-3.5 text-blue-600" />
                      <span>تعديل اسم القسم:</span>
                    </span>

                    {isCustomName && (
                      <button
                        onClick={() => handleResetCategoryName(cat.id)}
                        className="text-[10px] text-stone-400 hover:text-red-600 font-bold cursor-pointer"
                        title="استعادة الاسم الأصلي"
                      >
                        استعادة الأصلي
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div>
                      <input
                        type="text"
                        placeholder={`بالعربية: ${cat.nameAr}`}
                        value={categoryNames[cat.id]?.ar ?? ''}
                        onChange={(e) => handleUpdateCategoryName(cat.id, 'ar', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-stone-900 bg-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder={`بالإنجليزية: ${cat.nameEn}`}
                        value={categoryNames[cat.id]?.en ?? ''}
                        onChange={(e) => handleUpdateCategoryName(cat.id, 'en', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-stone-900 bg-white font-sans"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveCategoryName(cat.id)}
                    disabled={isSaving}
                    className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 ${
                      isJustSaved
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-900 hover:bg-black text-white disabled:opacity-40'
                    }`}
                  >
                    {isJustSaved ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تم حفظ الاسم!</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>حفظ اسم القسم</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
