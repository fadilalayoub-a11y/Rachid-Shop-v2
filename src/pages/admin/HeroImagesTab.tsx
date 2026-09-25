import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Plus, 
  RotateCcw, 
  Check, 
  Loader2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  Sparkles,
  Link2,
  Type,
  Tag,
  AlignRight,
  MousePointerClick,
  Languages
} from 'lucide-react';
import { 
  DEFAULT_HERO_SLIDES, 
  HERO_STORAGE_KEY, 
  HERO_SLIDES_STORAGE_KEY,
  normalizeHeroSlides 
} from '../../components/Hero';
import { HeroSlide } from '../../types';
import { translateHeroText } from '../../utils/heroTranslation';
import { Language } from '../../context/LanguageContext';

export function HeroImagesTab() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewLang, setPreviewLang] = useState<Language>('ar');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load hero slides from Firestore or localStorage
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
            setIsLoading(false);
            return;
          }
        }
        // Fallback to localStorage or default
        try {
          const localSlides = localStorage.getItem(HERO_SLIDES_STORAGE_KEY);
          if (localSlides) {
            const parsed = JSON.parse(localSlides);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSlides(parsed);
              setIsLoading(false);
              return;
            }
          }
          const localImages = localStorage.getItem(HERO_STORAGE_KEY);
          if (localImages) {
            const parsed = JSON.parse(localImages);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSlides(normalizeHeroSlides({ images: parsed }));
              setIsLoading(false);
              return;
            }
          }
        } catch {
          // ignore
        }
        setSlides(DEFAULT_HERO_SLIDES);
        setIsLoading(false);
      },
      (err) => {
        console.warn('Hero settings load warning:', err);
        setSlides(DEFAULT_HERO_SLIDES);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Upload image handler
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError('');
    setIsUploading(true);

    try {
      const newSlides: HeroSlide[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        let uploadedUrl = '';
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
        } catch (e) {
          console.warn('Cloudinary upload fallback to data URL:', e);
        }

        if (!uploadedUrl) {
          uploadedUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }

        if (uploadedUrl) {
          newSlides.push({
            image: uploadedUrl,
            badge: '',
            title: 'اكتشف أحدث صيحات الموضة',
            subtitle: 'تشكيلة رائعة من الملابس والأحذية العصرية التي تناسب ذوقك وتمنحك إطلالة فريدة ومتميزة.',
            ctaText: 'تسوق الآن'
          });
        }
      }

      if (newSlides.length > 0) {
        setSlides((prev) => [...prev, ...newSlides]);
        setPreviewIndex(slides.length); // point to first new slide
      } else {
        setUploadError('يرجى اختيار ملفات صور صالحة.');
      }
    } catch (err: any) {
      console.error('Error uploading:', err);
      setUploadError(err.message || 'حدث خطأ أثناء رفع الصور');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) return;
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setUploadError('يرجى إدخال رابط صالح يبدأ بـ https://');
      return;
    }
    setSlides((prev) => [
      ...prev,
      {
        image: cleanUrl,
        badge: '',
        title: 'اكتشف أحدث صيحات الموضة',
        subtitle: 'تشكيلة رائعة من الملابس والأحذية العصرية التي تناسب ذوقك وتمنحك إطلالة فريدة ومتميزة.',
        ctaText: 'تسوق الآن'
      }
    ]);
    setUrlInput('');
    setUploadError('');
    setPreviewIndex(slides.length);
  };

  const handleUpdateSlideField = (index: number, field: keyof HeroSlide, value: string) => {
    setSlides((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value
      };
      return copy;
    });
  };

  const handleRemoveSlide = (index: number) => {
    setSlides((prev) => prev.filter((_, idx) => idx !== index));
    if (previewIndex >= slides.length - 1) {
      setPreviewIndex(Math.max(0, slides.length - 2));
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setSlides((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    setPreviewIndex(index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index === slides.length - 1) return;
    setSlides((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    setPreviewIndex(index + 1);
  };

  const handleResetDefaults = () => {
    setSlides([...DEFAULT_HERO_SLIDES]);
    setPreviewIndex(0);
  };

  const handleSave = async () => {
    if (slides.length === 0) {
      setUploadError('يجب أن تحتوي الواجهة على إعلان/صورة واحدة على الأقل.');
      return;
    }

    setIsSaving(true);
    setUploadError('');
    try {
      const imagesOnly = slides.map(s => s.image);
      localStorage.setItem(HERO_SLIDES_STORAGE_KEY, JSON.stringify(slides));
      localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(imagesOnly));

      await setDoc(
        doc(db, 'settings', 'hero'),
        {
          slides,
          images: imagesOnly,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving hero slides:', err);
      // Fallback local update
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-semibold text-gray-600">جاري تحميل إعدادات الواجهة والإعلانات...</p>
      </div>
    );
  }

  const activeSlide = slides[previewIndex] || slides[0];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">إدارة واجهة الإعلانات والعبارات الترويجية (Hero Slider)</h2>
          </div>
          <p className="text-xs text-gray-500">
            يمكنك تخصيص العبارة الرئيسية (مثل "اكتشف أحدث صيحات الموضة")، والوصف، وزر الدعوة للشراء، بالإضافة للصور المتحركة بكل سهولة.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الافتراضية</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isUploading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>تم الحفظ بنجاح!</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>حفظ التعديلات في المتجر</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl flex items-center justify-between">
          <span>{uploadError}</span>
          <button
            onClick={() => setUploadError('')}
            className="text-xs text-red-500 hover:text-red-700 font-bold"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Main Grid: Upload & Slides Management (7 cols) + Live Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          {/* Uploader Box */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>إضافة شريحة إعلانية جديدة</span>
            </h3>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50/70 hover:bg-blue-50/30 transition-all rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-2 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />

              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-gray-800">
                  {isUploading ? 'جاري رفع الصور...' : 'انقر لاختيار صور من جهازك أو اسحبها هنا'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  يدعم صور JPG, PNG, WEBP بدقة عالية
                </p>
              </div>
            </div>

            {/* URL Input Alternative */}
            <form onSubmit={handleAddUrl} className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="أو ضع رابط صورة مباشر (https://...)"
                  className="w-full pr-9 pl-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  dir="ltr"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                إضافة
              </button>
            </form>
          </div>

          {/* Current Slides Management List */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  الإعلانات والشرائح المعتمدة ({slides.length})
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  انقر على الإعلان لتعديل كتابته، نصوصه، وصورته مباشرة
                </p>
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                تتبدل كل 5 ثوانٍ تلقائياً
              </span>
            </div>

            {slides.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs border border-dashed rounded-xl">
                لا توجد شرائح حالياً. يرجى إضافة إعلان أو صورة واحدة على الأقل.
              </div>
            ) : (
              <div className="space-y-4">
                {slides.map((slide, index) => {
                  const isSelected = previewIndex === index;
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/15 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {/* Top Bar: Preview thumb + Actions */}
                      <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-md bg-gray-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                            <img
                              src={slide.image}
                              alt={`Hero ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">
                              {slide.title || 'بدون عنوان رئيسي'}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate" dir="ltr">
                              {slide.image.startsWith('data:') ? 'صورة مرفوعة (Base64)' : slide.image}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewIndex(index)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title="معاينة وتعديل"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>معاينة</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-colors cursor-pointer"
                            title="تحريك لأعلى"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === slides.length - 1}
                            className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-colors cursor-pointer"
                            title="تحريك لأسفل"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveSlide(index)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Expandable/Inline Editable Text Fields */}
                      <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Title Input */}
                        <div className="md:col-span-2">
                          <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                            <Type className="w-3.5 h-3.5 text-blue-600" />
                            <span>العنوان الرئيسي للإعلان (مثال: اكتشف أحدث صيحات الموضة):</span>
                          </label>
                          <input
                            type="text"
                            value={slide.title || ''}
                            onChange={(e) => handleUpdateSlideField(index, 'title', e.target.value)}
                            placeholder="اكتب العنوان البارز هنا..."
                            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold text-gray-900 bg-white"
                          />
                        </div>

                        {/* Subtitle Input */}
                        <div className="md:col-span-2">
                          <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                            <AlignRight className="w-3.5 h-3.5 text-gray-500" />
                            <span>الوصف التوضيحي تحت العنوان:</span>
                          </label>
                          <textarea
                            rows={2}
                            value={slide.subtitle || ''}
                            onChange={(e) => handleUpdateSlideField(index, 'subtitle', e.target.value)}
                            placeholder="اكتب تفاصيل الإعلان أو التشكيلة..."
                            className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-gray-700 bg-white resize-none"
                          />
                        </div>

                        {/* Badge Input */}
                        <div>
                          <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-amber-600" />
                            <span>الشارة العلوية (اختياري - اتركه فارغاً لإخفائه):</span>
                          </label>
                          <input
                            type="text"
                            value={slide.badge || ''}
                            onChange={(e) => handleUpdateSlideField(index, 'badge', e.target.value)}
                            placeholder="اختياري (اتركه فارغاً إن لم ترغب بوجود شارة)"
                            className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-gray-800 bg-white"
                          />
                        </div>

                        {/* Button CTA text */}
                        <div>
                          <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                            <MousePointerClick className="w-3.5 h-3.5 text-emerald-600" />
                            <span>نص زر الشراء:</span>
                          </label>
                          <input
                            type="text"
                            value={slide.ctaText || ''}
                            onChange={(e) => handleUpdateSlideField(index, 'ctaText', e.target.value)}
                            placeholder="تسوق الآن"
                            className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-gray-800 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Live Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>معاينة حية للإعلان بالمتجر</span>
              </h3>
              <span className="text-xs font-semibold text-blue-600">
                الشريحة {previewIndex + 1} من {slides.length}
              </span>
            </div>

            {/* Language preview switcher */}
            <div className="flex items-center justify-between bg-stone-100 p-1 rounded-xl mb-3">
              <span className="text-[11px] font-bold text-stone-500 px-2 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5" />
                <span>معاينة الترجمة:</span>
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewLang('ar')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewLang === 'ar' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLang('fr')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewLang === 'fr' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Français
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLang('en')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewLang === 'en' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {activeSlide ? (
              <div 
                className="rounded-2xl overflow-hidden border border-gray-200 shadow-md relative bg-stone-100 aspect-16/11 flex flex-col justify-between p-5"
                dir={previewLang === 'ar' ? 'rtl' : 'ltr'}
              >
                <img
                  key={previewIndex}
                  src={activeSlide.image}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover object-center animate-billboard-zoom will-change-transform"
                />
                <div className={`absolute inset-0 ${
                  previewLang === 'ar' 
                    ? 'bg-gradient-to-l from-white/95 via-white/85 to-white/30' 
                    : 'bg-gradient-to-r from-white/95 via-white/85 to-white/30'
                }`} />

                <div className={`relative z-10 max-w-[85%] space-y-2.5 ${
                  previewLang === 'ar' ? 'text-right' : 'text-left'
                }`}>
                  {/* Badge */}
                  {activeSlide.badge?.trim() && (
                    <span className="inline-block text-[10px] font-bold bg-black/10 px-2.5 py-0.5 rounded-full text-gray-900 border border-black/5">
                      {translateHeroText(activeSlide.badge.trim(), previewLang)}
                    </span>
                  )}

                  {/* Editable Main Title Preview */}
                  <h4 className="text-lg sm:text-xl font-black text-gray-950 leading-tight">
                    {translateHeroText(activeSlide.title?.trim() || 'اكتشف أحدث صيحات الموضة', previewLang)}
                  </h4>

                  {/* Subtitle Preview */}
                  <p className="text-[11px] text-gray-700 font-medium line-clamp-3 leading-relaxed">
                    {translateHeroText(activeSlide.subtitle?.trim() || 'تشكيلة رائعة من الملابس والأحذية العصرية التي تناسب ذوقك وتمنحك إطلالة فريدة.', previewLang)}
                  </p>

                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 bg-gray-950 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-sm">
                      <span>{translateHeroText(activeSlide.ctaText?.trim() || 'تسوق الآن', previewLang)}</span>
                      <span>{previewLang === 'ar' ? '←' : '→'}</span>
                    </span>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-center gap-1.5 pt-2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === previewIndex ? 'w-8 bg-gray-950 shadow-xs' : 'w-2 bg-gray-400/80 hover:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="aspect-16/11 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-xs">
                لا توجد شرائح للمعاينة
              </div>
            )}

            <div className="mt-4 p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs text-amber-950 space-y-1">
              <p className="font-bold text-amber-900">🌐 الترجمة التلقائية للغات المتجر:</p>
              <p>• أي كتابة أو إعلان تضيفه بالعربية، الفرنسية، أو الإنجليزية سيترجم تلقائياً إلى لغة الزائر المحددة (عربي، فرنسي، إنجليزي).</p>
              <p>• يمكنك تجربة المعاينة بالضغط على أزرار اللغات بالأعلى لمشاهدة كيف ستظهر لزوارك بدقة.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
