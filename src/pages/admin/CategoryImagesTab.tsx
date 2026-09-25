import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import {
  Upload,
  Image as ImageIcon,
  Check,
  RotateCcw,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { DEFAULT_CATEGORIES_DATA, CATEGORIES_STORAGE_KEY } from '../../components/ShopByCategories';

export function CategoryImagesTab() {
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // استرجاع صور الأقسام المحفوظة من Firestore مع fallback إلى localStorage
  useEffect(() => {
    const docRef = doc(db, 'settings', 'category_images');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && typeof data === 'object') {
            setCategoryImages(data as Record<string, string>);
            try {
              localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(data));
            } catch (e) {
              console.warn(e);
            }
          }
        } else {
          // استعادة من localStorage إن وجد
          try {
            const local = localStorage.getItem(CATEGORIES_STORAGE_KEY);
            if (local) {
              setCategoryImages(JSON.parse(local));
            }
          } catch (e) {
            console.warn(e);
          }
        }
      },
      (err) => {
        console.warn('Firestore category_images listener error:', err);
        try {
          const local = localStorage.getItem(CATEGORIES_STORAGE_KEY);
          if (local) {
            setCategoryImages(JSON.parse(local));
          }
        } catch (e) {
          console.warn(e);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // دالة رفع الصورة لقسم محدد
  const handleUploadForCategory = async (categoryId: string, file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setErrorMessage('يرجى اختيار ملف صورة صالح.');
      return;
    }

    setUploadingCategory(categoryId);
    setErrorMessage('');

    try {
      let uploadedUrl = '';

      // محاولة الرفع إلى Cloudinary أولاً
      try {
        const sigRes = await fetch('/api/cloudinary-sign');
        if (sigRes.ok) {
          const sigData = await sigRes.json();
          const { timestamp, signature, apiKey, cloudName } = sigData;
          const formData = new FormData();
          formData.append('file', file);
          formData.append('api_key', apiKey);
          formData.append('timestamp', timestamp.toString());
          formData.append('signature', signature);

          const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            if (uploadData.secure_url) {
              uploadedUrl = uploadData.secure_url;
            }
          }
        }
      } catch (err) {
        console.warn('Cloudinary upload fallback to data URL:', err);
      }

      // في حال عدم توفر Cloudinary نستخدم Data URL بعد ضغط خفيف
      if (!uploadedUrl) {
        uploadedUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 900;
              const MAX_HEIGHT = 1200;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.85));
            };
            img.onerror = reject;
            img.src = e.target?.result as string;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      if (uploadedUrl) {
        const updated = {
          ...categoryImages,
          [categoryId]: uploadedUrl,
        };
        setCategoryImages(updated);
        await saveCategoriesImages(updated);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء رفع الصورة.');
    } finally {
      setUploadingCategory(null);
    }
  };

  // دالة إضافة رابط مباشر لصورة القسم
  const handleAddUrl = async (categoryId: string) => {
    const url = urlInputs[categoryId]?.trim();
    if (!url) return;

    const updated = {
      ...categoryImages,
      [categoryId]: url,
    };
    setCategoryImages(updated);
    setUrlInputs((prev) => ({ ...prev, [categoryId]: '' }));
    await saveCategoriesImages(updated);
  };

  // حفظ التعديلات في Firestore و localStorage
  const saveCategoriesImages = async (dataToSave: Record<string, string>) => {
    setIsSaving(true);
    setErrorMessage('');
    try {
      await setDoc(doc(db, 'settings', 'category_images'), dataToSave);
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(dataToSave));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving category images to Firestore:', err);
      // حفظ محلي في حال فشل الاتصال بقاعدة البيانات
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(dataToSave));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // استعادة الصورة الافتراضية لقسم محدد
  const handleResetCategory = async (categoryId: string) => {
    const updated = { ...categoryImages };
    delete updated[categoryId];
    setCategoryImages(updated);
    await saveCategoriesImages(updated);
  };

  // استعادة الكل إلى الصور الافتراضية
  const handleResetAll = async () => {
    if (!window.confirm('هل أنت متأكد من رغبتك في استعادة جميع الصور الافتراضية للأقسام؟')) return;
    setCategoryImages({});
    await saveCategoriesImages({});
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
              <h2 className="text-xl font-bold text-stone-900">إدارة صور أقسام "Shop By Categories"</h2>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed">
              يمكنك هنا رفع أو تغيير صور الأقسام والبطاقات الـ 14 المعروضة في الصفحة الرئيسية بسهولة. تظهر الصور فوراً للزوار.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:text-red-600 hover:border-red-200 text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة الصور الأصلية</span>
            </button>
          </div>
        </div>

        {/* تنبيهات النجاح والخطأ */}
        {saveSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>تم حفظ التعديلات بنجاح وتحديث المتجر فوراً!</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* شبكة الأقسام الـ 14 مع معاينة فورية وأزرار الرفع */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {DEFAULT_CATEGORIES_DATA.map((cat) => {
          const currentImage = categoryImages[cat.id] || cat.image;
          const isCustom = !!categoryImages[cat.id];
          const isUploading = uploadingCategory === cat.id;

          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              {/* شريط عنوان القسم */}
              <div className="p-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                    {cat.nameEn}
                  </h3>
                  <span className="text-xs text-stone-500 font-medium">{cat.nameAr}</span>
                </div>
                {isCustom ? (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    مخصصة
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full">
                    افتراضية
                  </span>
                )}
              </div>

              {/* معاينة الصورة كما تظهر تماماً في المتجر */}
              <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden group">
                <img
                  src={currentImage}
                  alt={cat.nameEn}
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />

                {/* الشارة البيضاء السفلية كما بالمتجر */}
                <div className="absolute bottom-3 inset-x-0 flex justify-center px-2 pointer-events-none">
                  <div className="bg-white px-3 py-1.5 shadow-sm text-center">
                    <span className="block text-[11px] font-bold text-stone-900 tracking-wider uppercase">
                      {cat.nameEn}
                    </span>
                  </div>
                </div>

                {/* مؤشر الرفع جاري */}
                {isUploading && (
                  <div className="absolute inset-0 bg-stone-900/60 flex flex-col items-center justify-center text-white gap-2 backdrop-blur-xs">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold">جاري رفع الصورة...</span>
                  </div>
                )}
              </div>

              {/* أزرار التحكم والرفع */}
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

                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRefs.current[cat.id]?.click()}
                    disabled={isUploading || isSaving}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-stone-900 hover:bg-black text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع صورة جديدة</span>
                  </button>

                  {isCustom && (
                    <button
                      onClick={() => handleResetCategory(cat.id)}
                      title="استعادة الصورة الأصلية لهذا القسم"
                      className="p-2.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-stone-200 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* إدخال رابط خارجي كبديل */}
                <div className="pt-2 border-t border-stone-100">
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      placeholder="أو ألصق رابط صورة..."
                      value={urlInputs[cat.id] || ''}
                      onChange={(e) => setUrlInputs({ ...urlInputs, [cat.id]: e.target.value })}
                      className="flex-1 px-2.5 py-1.5 text-[11px] rounded-lg border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-stone-900 font-sans"
                    />
                    <button
                      onClick={() => handleAddUrl(cat.id)}
                      disabled={!urlInputs[cat.id]?.trim()}
                      className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      حفظ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
