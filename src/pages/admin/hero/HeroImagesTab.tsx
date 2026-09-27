import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../../lib/firebase';
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
  Link2,
  Layers
} from 'lucide-react';
import { 
  DEFAULT_HERO_SLIDES, 
  HERO_STORAGE_KEY, 
  HERO_SLIDES_STORAGE_KEY,
  normalizeHeroSlides
} from '../../../components/Hero';
import { HeroSlide } from '../../../types';
import { Language } from '../../../context/LanguageContext';
import { HeroInteractivePreview } from './HeroInteractivePreview';
import { HeroSlideControls } from './HeroSlideControls';

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
      const sigRes = await fetch('/api/cloudinary-sign');
      if (!sigRes.ok) {
        const errData = await sigRes.json().catch(() => ({}));
        throw new Error(
          errData.error ||
            'إعدادات Cloudinary غير متوفرة في السيرفر. يرجى استخدام خيار "رابط صورة مباشر".'
        );
      }

      const sigData = await sigRes.json();
      const { timestamp, signature, apiKey, cloudName } = sigData;
      const newSlides: HeroSlide[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.secure_url) {
          throw new Error(uploadData.error?.message || 'فشل رفع إحدى الصور إلى Cloudinary.');
        }

        const uploadedUrl = uploadData.secure_url;
        newSlides.push({
          image: uploadedUrl,
          badge: '',
          title: 'عالم متكامل من الأناقة والتميز',
          subtitle: 'تشكيلة رائعة تناسب ذوقك وتمنحك إطلالة فريدة ومتميزة.',
          ctaText: 'استكشف التشكيلة',
          contentPosition: 'start',
          verticalAlign: 'bottom',
          textAlign: 'start',
          maxWidthPercent: 55,
          textSpreadMode: 'grouped',
          textColorTheme: 'light',
          fontFamily: 'sans',
          titleSize: 'xlarge',
          overlayStyle: 'charcoal-gradient',
          ctaStyle: 'white-solid'
        });
      }

      if (newSlides.length > 0) {
        const nextIndex = slides.length;
        setSlides((prev) => [...prev, ...newSlides]);
        setPreviewIndex(nextIndex);
      } else {
        setUploadError('يرجى اختيار ملفات صور صالحة.');
      }
    } catch (err: any) {
      console.error('Error uploading to Cloudinary:', err);
      setUploadError(err.message || 'حدث خطأ أثناء رفع الصور إلى Cloudinary');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) return;
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('/')) {
      setUploadError('يرجى إدخال رابط صالح يبدأ بـ https:// أو مسار صورة');
      return;
    }
    const nextIndex = slides.length;
    setSlides((prev) => [
      ...prev,
      {
        image: cleanUrl,
        badge: '',
        title: 'عالم متكامل من الأناقة والتميز',
        subtitle: 'تشكيلة رائعة تناسب ذوقك وتمنحك إطلالة فريدة ومتميزة.',
        ctaText: 'استكشف التشكيلة',
        contentPosition: 'start',
        verticalAlign: 'bottom',
        textAlign: 'start',
        maxWidthPercent: 55,
        textSpreadMode: 'grouped',
        textColorTheme: 'light',
        fontFamily: 'sans',
        titleSize: 'xlarge',
        overlayStyle: 'charcoal-gradient',
        ctaStyle: 'white-solid'
      }
    ]);
    setUrlInput('');
    setUploadError('');
    setPreviewIndex(nextIndex);
  };

  const handleUpdateSlideField = (index: number, field: keyof HeroSlide, value: any) => {
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
    if (slides.length <= 1) {
      setUploadError('يجب الإبقاء على إعلان واحد على الأقل في المتجر.');
      return;
    }
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
      const cleanSlide = (slide: HeroSlide) => {
        const cleanObj: Record<string, any> = {
          image: slide.image || '',
          badge: slide.badge || '',
          title: slide.title || '',
          subtitle: slide.subtitle || '',
          ctaText: slide.ctaText || 'استكشف التشكيلة',
          contentPosition: slide.contentPosition || 'start',
          verticalAlign: slide.verticalAlign || 'bottom',
          textAlign: slide.textAlign || 'start',
          maxWidthPercent: typeof slide.maxWidthPercent === 'number' ? slide.maxWidthPercent : 55,
          textSpreadMode: slide.textSpreadMode || 'grouped',
          textColorTheme: slide.textColorTheme || 'light',
          fontFamily: slide.fontFamily || 'sans',
          titleSize: slide.titleSize || 'xlarge',
          overlayStyle: slide.overlayStyle || 'charcoal-gradient',
          ctaStyle: slide.ctaStyle || 'white-solid',
          ctaLink: slide.ctaLink || '#products'
        };

        // Optional language strings
        if (slide.title_ar?.trim()) cleanObj.title_ar = slide.title_ar.trim();
        if (slide.title_fr?.trim()) cleanObj.title_fr = slide.title_fr.trim();
        if (slide.title_en?.trim()) cleanObj.title_en = slide.title_en.trim();
        if (slide.subtitle_ar?.trim()) cleanObj.subtitle_ar = slide.subtitle_ar.trim();
        if (slide.subtitle_fr?.trim()) cleanObj.subtitle_fr = slide.subtitle_fr.trim();
        if (slide.subtitle_en?.trim()) cleanObj.subtitle_en = slide.subtitle_en.trim();
        if (slide.badge_ar?.trim()) cleanObj.badge_ar = slide.badge_ar.trim();
        if (slide.badge_fr?.trim()) cleanObj.badge_fr = slide.badge_fr.trim();
        if (slide.badge_en?.trim()) cleanObj.badge_en = slide.badge_en.trim();
        if (slide.ctaText_ar?.trim()) cleanObj.ctaText_ar = slide.ctaText_ar.trim();
        if (slide.ctaText_fr?.trim()) cleanObj.ctaText_fr = slide.ctaText_fr.trim();
        if (slide.ctaText_en?.trim()) cleanObj.ctaText_en = slide.ctaText_en.trim();

        // Optional numeric coordinates (only valid finite numbers)
        if (typeof slide.posX_ar === 'number' && !isNaN(slide.posX_ar)) cleanObj.posX_ar = Math.round(slide.posX_ar);
        if (typeof slide.posY_ar === 'number' && !isNaN(slide.posY_ar)) cleanObj.posY_ar = Math.round(slide.posY_ar);
        if (typeof slide.posX_en === 'number' && !isNaN(slide.posX_en)) cleanObj.posX_en = Math.round(slide.posX_en);
        if (typeof slide.posY_en === 'number' && !isNaN(slide.posY_en)) cleanObj.posY_en = Math.round(slide.posY_en);

        return cleanObj;
      };

      const cleanedSlides = slides.map(cleanSlide);
      const imagesOnly = cleanedSlides
        .map((s) => s.image)
        .filter((img): img is string => typeof img === 'string' && img.trim() !== '');

      // Deeply sanitize payload using JSON parse/stringify to guarantee zero undefined values
      const payload = JSON.parse(
        JSON.stringify({
          images: imagesOnly,
          slides: cleanedSlides,
          updatedAt: new Date().toISOString()
        })
      );

      await setDoc(doc(db, 'settings', 'hero'), payload);

      localStorage.setItem(HERO_SLIDES_STORAGE_KEY, JSON.stringify(cleanedSlides));
      localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(imagesOnly));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving hero slides:', err);
      try {
        localStorage.setItem(HERO_SLIDES_STORAGE_KEY, JSON.stringify(slides));
        localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(slides.map(s => s.image)));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (locErr) {
        setUploadError('تعذر الحفظ في قاعدة البيانات. يرجى التحقق من الاتصال.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const activeSlideIndex = Math.min(previewIndex, Math.max(0, slides.length - 1));
  const activeSlide = slides[activeSlideIndex] || slides[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Save Action */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-blue-600" />
            <span>لوحة التحكم بالإعلانات والبانر الرئيسي</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            عدّل النصوص والمواضع والتمدد مع رؤية التغييرات فوراً في الصورة أدناه
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="إعادة تعيين للشريحة الافتراضية"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الافتراضي</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
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
            className="text-xs text-red-500 hover:text-red-700 font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Main Single-Flow Editor: Interactive Top Screen + Bottom Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Slides Navigation Bar */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 max-w-full">
            <span className="text-xs font-bold text-stone-500 shrink-0 flex items-center gap-1">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>الشرائح ({slides.length}):</span>
            </span>
            {slides.map((slide, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPreviewIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer border ${
                  activeSlideIndex === idx
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span>إعلان {idx + 1}</span>
                {slide.title && (
                  <span className="max-w-[120px] truncate text-[11px] opacity-85">
                    ({slide.title})
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleMoveUp(activeSlideIndex)}
              disabled={activeSlideIndex === 0}
              className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-30 transition-colors cursor-pointer"
              title="تحريك الشريحة لأعلى"
            >
              <ArrowUp className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleMoveDown(activeSlideIndex)}
              disabled={activeSlideIndex === slides.length - 1}
              className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-30 transition-colors cursor-pointer"
              title="تحريك الشريحة لأسفل"
            >
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleRemoveSlide(activeSlideIndex)}
              className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
              title="حذف هذا الإعلان"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1. THE LIVE INTERACTIVE CANVAS (Component 1) */}
        <HeroInteractivePreview
          slide={activeSlide}
          slideIndex={activeSlideIndex}
          previewLang={previewLang}
          onLanguageChange={setPreviewLang}
          onUpdateField={(field, val) => handleUpdateSlideField(activeSlideIndex, field, val)}
        />

        {/* 2. THE EDITING CONTROLS (Component 2) */}
        <HeroSlideControls
          slide={activeSlide}
          slideIndex={activeSlideIndex}
          onUpdateField={(field, val) => handleUpdateSlideField(activeSlideIndex, field, val)}
        />
      </div>

      {/* 3. UPLOADER & ADD NEW SLIDE SECTION */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-600" />
          <span>إضافة شريحة أو صورة إعلانية جديدة</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50/70 hover:bg-blue-50/30 transition-all rounded-xl p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />

            <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-gray-500 group-hover:text-blue-600 transition-all">
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>

            <p className="text-xs font-bold text-gray-800">
              {isUploading ? 'جاري رفع الصور...' : 'انقر لرفع صورة جديدة من جهازك'}
            </p>
          </div>

          {/* URL Input Alternative */}
          <form onSubmit={handleAddUrl} className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="أو ضع رابط صورة مباشر (https://...)"
                className="w-full pr-9 pl-3 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
