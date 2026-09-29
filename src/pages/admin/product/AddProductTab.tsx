import React, { FormEvent, useState, useEffect, useMemo } from 'react';
import {
  Package,
  ShieldAlert,
  CheckCircle,
  ShoppingBag,
  Loader2,
  Plus,
  Trash2,
  Star,
  UploadCloud,
  Layers,
  Sparkles,
  Tag,
  Globe
} from 'lucide-react';
import { ProductStyle } from '../../../types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { classifyProduct, ProductClassification } from '../../../utils/productClassifier';
import { getSubcategoriesForCategory } from '../../../constants/categories';

export interface AddProductTabProps {
  productsCount: number;
  onGoToInventory: () => void;
}

// 1. نوع المنتج فقط (3 أقسام أساسية - الحذاء أولاً، ثم الملابس، ثم الإكسسوارات)
const PRODUCT_CATEGORIES: { id: 'shoes' | 'clothes' | 'accessories'; nameAr: string; nameEn: string; icon: string }[] = [
  { id: 'shoes', nameAr: 'أحذية', nameEn: 'Shoes', icon: '👟' },
  { id: 'clothes', nameAr: 'ملابس', nameEn: 'Clothes', icon: '👕' },
  { id: 'accessories', nameAr: 'إكسسوارات', nameEn: 'Accessories', icon: '🕶️' },
];

// 2. ستايل المنتج فقط (5 أنماط رئيسية)
const STYLE_OPTIONS: { id: ProductStyle; nameAr: string; nameEn: string; desc: string; icon: string }[] = [
  { id: 'old_money', nameAr: 'أولد ماني', nameEn: 'Old Money', desc: 'أناقة كلاسيكية هادئة وفاخرة', icon: '👑' },
  { id: 'classic', nameAr: 'كلاسيك', nameEn: 'Classic', desc: 'رسمي وأنيق لجميع المناسبات', icon: '👔' },
  { id: 'streetwear', nameAr: 'ستريت وير', nameEn: 'Streetwear', desc: 'طابع شبابي عصري وأوفر سايز', icon: '🔥' },
  { id: 'sportswear', nameAr: 'سبورتس وير', nameEn: 'Sportswear', desc: 'ملابس وأحذية رياضية عملية', icon: '⚡' },
  { id: 'casual', nameAr: 'كاجوال', nameEn: 'Casual', desc: 'إطلالة يومية مريحة وعملية', icon: '👖' },
];

// مقاسات مقترحة حسب نوع المنتج
const PRESET_SIZES = {
  shoes: ['39', '40', '41', '42', '43', '44', '45'],
  clothes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
  accessories: ['قياس موحد (One Size)'],
};

export function AddProductTab({ productsCount, onGoToInventory }: AddProductTabProps) {
  // 1. أولاً وثانياً: نوع المنتج وتصنيفه الفرعي (إجباري للدقة)
  const [category, setCategory] = useState<'shoes' | 'clothes' | 'accessories'>('shoes');
  const [subcategory, setSubcategory] = useState<string>('sneakers');
  const [isManualSelection, setIsManualSelection] = useState(false);
  const [style, setStyle] = useState<ProductStyle>('old_money');

  // قائمة الأقسام الفرعية التابعة لنوع المنتج المختار حالياً
  const currentSubcategories = useMemo(() => {
    return getSubcategoriesForCategory(category);
  }, [category]);

  // 2. الأسماء باللغات الثلاث
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameFr, setNameFr] = useState('');

  // 3. الأوصاف باللغات الثلاث
  const [descriptionAr, setDescriptionAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionFr, setDescriptionFr] = useState('');

  // 4. الكلمات المفتاحية باللغات الثلاث
  const [keywordsAr, setKeywordsAr] = useState('');
  const [keywordsEn, setKeywordsEn] = useState('');
  const [keywordsFr, setKeywordsFr] = useState('');

  // تبويب اللغة النشط لتسهيل وتنسيق الإدخال
  const [activeLangTab, setActiveLangTab] = useState<'ar' | 'en' | 'fr'>('ar');

  // 5. السعر
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');

  // 6. المقاسات والمخزون
  const [inventoryList, setInventoryList] = useState<{ size: string; stock: number }[]>([
    { size: '40', stock: 5 },
    { size: '41', stock: 5 },
    { size: '42', stock: 5 },
    { size: '43', stock: 5 },
  ]);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [bulkStockVal, setBulkStockVal] = useState('5');

  // 7. الصور
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');

  // حالة الإرسال والرسائل
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({
    type: '',
    text: '',
  });

  // الخوارزمية الذكية لتصنيف المنتج تلقائياً من الاسم والوصف
  const detectedClassification = useMemo(() => {
    return classifyProduct(nameAr || nameEn || nameFr, descriptionAr, [keywordsAr, keywordsEn, keywordsFr]);
  }, [nameAr, nameEn, nameFr, descriptionAr, keywordsAr, keywordsEn, keywordsFr]);

  // مزامنة الفئة والمقاسات تلقائياً عند كتابة اسم المنتج إن لم يحددها المستخدم يدوياً
  useEffect(() => {
    if (!isManualSelection && (nameAr.trim().length >= 2 || nameEn.trim().length >= 2 || nameFr.trim().length >= 2)) {
      if (detectedClassification.category && detectedClassification.category !== category) {
        setCategory(detectedClassification.category);
        const subcats = getSubcategoriesForCategory(detectedClassification.category);
        if (detectedClassification.subcategory) {
          setSubcategory(detectedClassification.subcategory);
        } else if (subcats.length > 0) {
          setSubcategory(subcats[0].id);
        }
      }
      if (detectedClassification.suggestedStyle && style === 'old_money') {
        setStyle(detectedClassification.suggestedStyle);
      }
    }
  }, [detectedClassification.category, detectedClassification.subcategory, detectedClassification.suggestedStyle, isManualSelection]);

  // تحديث المقاسات المقترحة وتصنيف الفئة عند تغيير نوع المنتج
  const handleCategoryChange = (newCat: 'clothes' | 'shoes' | 'accessories') => {
    setIsManualSelection(true);
    setCategory(newCat);
    const subcats = getSubcategoriesForCategory(newCat);
    if (subcats.length > 0) {
      setSubcategory(subcats[0].id);
    } else {
      setSubcategory('');
    }

    if (newCat === 'shoes') {
      setInventoryList([
        { size: '39', stock: 4 },
        { size: '40', stock: 5 },
        { size: '41', stock: 5 },
        { size: '42', stock: 5 },
        { size: '43', stock: 5 },
        { size: '44', stock: 4 },
        { size: '45', stock: 3 },
      ]);
    } else if (newCat === 'clothes') {
      setInventoryList([
        { size: 'S', stock: 5 },
        { size: 'M', stock: 5 },
        { size: 'L', stock: 5 },
        { size: 'XL', stock: 5 },
        { size: 'XXL', stock: 5 },
      ]);
    } else {
      setInventoryList([{ size: 'قياس موحد (One Size)', stock: 10 }]);
    }
  };

  // التحكم في المقاسات
  const togglePresetSize = (sz: string) => {
    const exists = inventoryList.some((item) => item.size === sz);
    if (exists) {
      if (inventoryList.length === 1) return; // الحفاظ على مقاس واحد على الأقل
      setInventoryList((prev) => prev.filter((item) => item.size !== sz));
    } else {
      setInventoryList((prev) => [...prev, { size: sz, stock: parseInt(bulkStockVal, 10) || 5 }]);
    }
  };

  const handleStockChange = (sizeName: string, newStock: number) => {
    setInventoryList((prev) =>
      prev.map((item) => (item.size === sizeName ? { ...item, stock: Math.max(0, newStock) } : item))
    );
  };

  const handleAddCustomSize = () => {
    const val = customSizeInput.trim().toUpperCase();
    if (!val) return;
    if (!inventoryList.some((item) => item.size === val)) {
      setInventoryList((prev) => [...prev, { size: val, stock: parseInt(bulkStockVal, 10) || 5 }]);
    }
    setCustomSizeInput('');
  };

  const handleApplyUniformStock = () => {
    const num = parseInt(bulkStockVal, 10);
    if (isNaN(num) || num < 0) return;
    setInventoryList((prev) => prev.map((item) => ({ ...item, stock: num })));
  };

  const totalCalculatedStock = useMemo(() => {
    return inventoryList.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
  }, [inventoryList]);

  // التحكم في الصور
  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    setImageFiles((prev) => [...prev, ...newFiles]);
  };

  const handleAddDirectUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setImageUrls((prev) => [...prev, trimmed]);
    setUrlInput('');
  };

  const removeImageFile = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImageUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const setPrimaryFile = (index: number) => {
    if (index === 0) return;
    setImageFiles((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
  };

  // إرسال وحفظ المنتج
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormMessage({ type: '', text: '' });

    if (!category) {
      setFormMessage({ type: 'error', text: 'يرجى اختيار نوع المنتج (أحذية، ملابس، أو إكسسوارات) أولاً كطلب ضروري.' });
      return;
    }

    if (!subcategory) {
      setFormMessage({
        type: 'error',
        text: category === 'shoes'
          ? 'يرجى تحديد تصنيف الحذاء بدقة (سنيكرز، أحذية كلاسيكية وموكاسان، جري، صنادل، أو بوت) كطلب ضروري.'
          : 'يرجى تحديد التصنيف التفصيلي للمنتج كطلب ضروري.'
      });
      return;
    }

    if (!nameAr.trim()) {
      setFormMessage({ type: 'error', text: 'يرجى إدخال اسم المنتج بالعربية على الأقل.' });
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormMessage({ type: 'error', text: 'يرجى إدخال سعر بيع صحيح للمنتج.' });
      return;
    }

    if (imageFiles.length === 0 && imageUrls.length === 0) {
      setFormMessage({ type: 'error', text: 'يرجى إضافة صورة واحدة على الأقل للمنتج.' });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. رفع الصور الجديدة إن وجدت إلى Cloudinary بالطريقة الموقعة الآمنة (Signed Upload)
      const uploadedUrls: string[] = [...imageUrls];

      if (imageFiles.length > 0) {
        // جلب التصريح والتوقيع المشفر من السيرفر بشكل آمن دون كشف الـ Secret Key
        const signatureRes = await fetch('/api/cloudinary-sign');
        
        let signatureData: any = null;
        try {
          signatureData = await signatureRes.json();
        } catch {
          throw new Error('تعذر الاتصال بمسار التوقيع الأمني للسيرفر (/api/cloudinary-sign). يرجى التأكد من تشغيل السيرفر أو إعداد متغيرات البيئة في الاستضافة.');
        }

        if (!signatureRes.ok || !signatureData || !signatureData.signature) {
          throw new Error(signatureData?.error || 'فشل الحصول على تصريح رفع الصور من السيرفر.');
        }

        const { timestamp, signature, apiKey, cloudName } = signatureData;
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const uploadFormData = new FormData();
          uploadFormData.append('file', file);
          uploadFormData.append('api_key', apiKey);
          uploadFormData.append('timestamp', timestamp.toString());
          uploadFormData.append('signature', signature);

          const uploadRes = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: uploadFormData,
          });

          let uploadData: any = null;
          try {
            uploadData = await uploadRes.json();
          } catch {
            throw new Error(`فشل استلام رد سليم من Cloudinary أثناء رفع الصورة رقم ${i + 1}`);
          }

          if (!uploadRes.ok || !uploadData.secure_url) {
            throw new Error(uploadData?.error?.message || `خطأ أثناء رفع الصورة رقم ${i + 1} إلى Cloudinary`);
          }

          uploadedUrls.push(uploadData.secure_url);
        }
      }

      const primaryImage = uploadedUrls[0];
      const secondaryImage = uploadedUrls.length > 1 ? uploadedUrls[1] : null;

      // 2. معالجة الكلمات المفتاحية
      const parseKeywords = (str: string) =>
        str
          .split(/[,،\n]+/)
          .map((k) => k.trim())
          .filter((k) => k.length > 0);

      const parsedKwAr = parseKeywords(keywordsAr);
      const parsedKwEn = parseKeywords(keywordsEn);
      const parsedKwFr = parseKeywords(keywordsFr);
      const allTags = Array.from(new Set([...parsedKwAr, ...parsedKwEn, ...parsedKwFr]));

      // 3. إنشاء كائن المنتج الآمن لـ Firestore (بدون أي قيم undefined)
      const cleanTitle = nameAr.trim();
      const rawProductPayload = {
        title: cleanTitle,
        name: cleanTitle,
        nameAr: cleanTitle,
        nameEn: nameEn.trim() || null,
        nameFr: nameFr.trim() || null,

        description: descriptionAr.trim() || cleanTitle,
        descriptionAr: descriptionAr.trim() || cleanTitle,
        descriptionEn: descriptionEn.trim() || null,
        descriptionFr: descriptionFr.trim() || null,

        keywordsAr: parsedKwAr,
        keywordsEn: parsedKwEn,
        keywordsFr: parsedKwFr,
        tags: allTags,

        price: priceNum,
        compare_at_price: originalPrice ? parseFloat(originalPrice) : null,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,

        // الأقسام والستايل (تم تحديدها أولاً وبشكل إجباري لدقة التصنيف)
        category: category,
        category_id: category,
        subcategory: subcategory,
        subcategory_id: subcategory,
        style: style || detectedClassification.suggestedStyle || 'casual',

        // القياس والمخزون
        inventory: inventoryList,
        sizes: inventoryList.map((i) => i.size),

        // الصور
        image: primaryImage || '',
        secondaryImage: secondaryImage || null,
        images: uploadedUrls,

        // قيم افتراضية متوافقة
        brand: 'RACHID SHOP',
        brand_id: 'rachid-shop',
        badge: 'none',
        createdAt: serverTimestamp(),
      };

      // إزالة أي قيمة undefined بشكل قطعي لتفادي أخطاء Firestore
      const productPayload = Object.fromEntries(
        Object.entries(rawProductPayload).filter(([_, v]) => v !== undefined)
      );

      await addDoc(collection(db, 'products'), productPayload);

      // إعادة ضبط الحقول
      setNameAr('');
      setNameEn('');
      setNameFr('');
      setDescriptionAr('');
      setDescriptionEn('');
      setDescriptionFr('');
      setKeywordsAr('');
      setKeywordsEn('');
      setKeywordsFr('');
      setPrice('');
      setOriginalPrice('');
      setImageFiles([]);
      setImageUrls([]);

      setFormMessage({
        type: 'success',
        text: `تمت إضافة المنتج "${cleanTitle}" بنجاح وتحديث المتجر!`,
      });
    } catch (err: any) {
      console.error('Error adding product:', err);
      setFormMessage({
        type: 'error',
        text: `فشل حفظ المنتج: ${err.message || 'حدث خطأ غير متوقع'}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-16 font-cairo">
      {/* Header & Quick Navigation */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">إضافة منتج جديد</h2>
            <p className="text-xs text-gray-500">إدخال مباشر ومبسط للمنتجات والمخزون</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoToInventory}
          className="inline-flex items-center gap-2 text-xs text-gray-700 hover:text-gray-950 font-bold bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition-all cursor-pointer border border-gray-200/80"
        >
          <Package className="w-4 h-4 text-gray-600" />
          <span>المخزون الحالي</span>
          <span className="bg-white px-2 py-0.5 rounded-md text-[11px] font-bold text-gray-900 border border-gray-300">
            {productsCount}
          </span>
        </button>
      </div>

      {/* Global Alerts */}
      {formMessage.text && (
        <div
          className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm font-medium transition-all ${
            formMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              {formMessage.type === 'error' ? (
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <span className="font-bold">{formMessage.text}</span>
            </div>
            {formMessage.type === 'success' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onGoToInventory}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  عرض المخزون
                </button>
                <button
                  type="button"
                  onClick={() => setFormMessage({ type: '', text: '' })}
                  className="text-xs text-emerald-700 hover:underline font-bold px-2 py-1 cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* الخطوة 1: أولاً - نوع المنتج الرئيسي (إجباري) */}
        <div className="bg-white p-5 rounded-2xl border-2 border-stone-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-stone-950 text-white flex items-center justify-center text-xs font-black">1</span>
              <h3 className="text-sm font-black text-stone-950">أولاً: نوع المنتج (Product Type)</h3>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                * طلب ضروري وإجباري
              </span>
            </div>
            <span className="text-xs text-stone-500 font-medium">القسم العام للمنتج</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRODUCT_CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 text-right ${
                    isSelected
                      ? 'border-stone-950 bg-stone-950 text-white shadow-md ring-2 ring-stone-950/20'
                      : 'border-stone-200 hover:border-stone-400 bg-stone-50/50 text-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <p className="text-sm font-black">{cat.nameAr}</p>
                      <p className={`text-[11px] font-medium ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                        {cat.nameEn}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-white text-stone-950 flex items-center justify-center text-xs font-black">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* الخطوة 2: ثانياً - تصنيفات الحذاء أو الملابس أو الإكسسوارات (إجباري للدقة) */}
        <div className="bg-white p-5 rounded-2xl border-2 border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-stone-950 text-white flex items-center justify-center text-xs font-black">2</span>
              <h3 className="text-sm font-black text-stone-950">
                ثانياً: {category === 'shoes' ? 'تصنيفات الحذاء (Shoe Classification)' : category === 'clothes' ? 'تصنيفات الملابس (Clothing Classification)' : 'تصنيفات الإكسسوارات'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                * طلب ضروري لتصنيف دقيق
              </span>
            </div>
            <span className="text-xs text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg font-bold">
              {category === 'shoes' ? '👟 اختر موديل ونوع الحذاء المطلوب بدقة' : 'اختر القسم التفصيلي بدقة'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {currentSubcategories.map((sub) => {
              const isSelected = subcategory === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    setIsManualSelection(true);
                    setSubcategory(sub.id);
                  }}
                  className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? 'border-stone-950 bg-stone-900 text-white font-black shadow-sm ring-2 ring-stone-950/20'
                      : 'border-stone-200 hover:border-stone-400 bg-white text-stone-800 font-medium'
                  }`}
                >
                  <span className="text-xs font-bold leading-tight">{sub.nameAr}</span>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                    {sub.nameEn}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-amber-300 mt-0.5">✓ تم الاختيار</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* الخطوة 3: ثالثاً - ستايل ونمط الموضة */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-200 text-stone-800 flex items-center justify-center text-xs font-bold">3</span>
              <h3 className="text-sm font-bold text-stone-900">ثالثاً: ستايل المظهر (Fashion Style)</h3>
            </div>
            <span className="text-xs text-stone-500">لربط المنتج بأقسام المتجر</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStyle(opt.id)}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  style === opt.id
                    ? 'border-stone-950 bg-stone-950 text-white shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-white text-stone-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">{opt.icon}</span>
                    {style === opt.id && (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </div>
                  <p className="text-xs font-bold">{opt.nameAr}</p>
                  <p className={`text-[10px] font-mono ${style === opt.id ? 'text-stone-300' : 'text-stone-400'}`} dir="ltr">
                    {opt.nameEn}
                  </p>
                </div>
                <p className={`text-[10px] mt-2 leading-tight ${style === opt.id ? 'text-stone-300' : 'text-stone-500'}`}>
                  {opt.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 4. الإسم والوصف والكلمات المفتاحية باللغات الثلاث */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-900">رابعاً: الإسم، الوصف، والكلمات المفتاحية (3 لغات)</h3>
            </div>

            {/* أزرار التبديل السريع بين اللغات */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveLangTab('ar')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeLangTab === 'ar' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🇲🇦 العربية {nameAr.trim() && '✓'}
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeLangTab === 'en' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🇬🇧 English {nameEn.trim() && '✓'}
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab('fr')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeLangTab === 'fr' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🇫🇷 Français {nameFr.trim() && '✓'}
              </button>
            </div>
          </div>

          {/* محتوى اللغة العربية */}
          {activeLangTab === 'ar' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-2.5 bg-blue-50/50 rounded-xl text-[11px] text-blue-800 font-bold flex items-center gap-1.5">
                <span>🇲🇦 إدخال البيانات باللغة العربية (اللغة الرئيسية)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  اسم المنتج بالعربية <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: قميص لينين كلاسيك، سنيكرز أبيض، تيشيرت أوفرسايز، عطر، ساعة..."
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-gray-50/30 font-medium"
                />
                {nameAr.trim().length >= 2 && (
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50/70 border border-emerald-200/80 px-2.5 py-1 rounded-lg animate-in fade-in">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>
                      تم التعرف تلقائياً: <strong>{detectedClassification.category === 'clothes' ? '👔 ملابس' : detectedClassification.category === 'shoes' ? '👟 أحذية' : '🕶️ إكسسوارات'}</strong>
                      {detectedClassification.subcategory && ` (${detectedClassification.subcategory})`}
                      {detectedClassification.suggestedStyle && ` • ستايل: ${detectedClassification.suggestedStyle}`}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  وصف المنتج بالعربية
                </label>
                <textarea
                  rows={3}
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  placeholder="اكتب وصفاً مميزاً للقطعة ونوع القماش وتعليمات الغسيل..."
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-gray-50/30 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  الكلمات المفتاحية بالعربية (Keywords)
                </label>
                <input
                  type="text"
                  value={keywordsAr}
                  onChange={(e) => setKeywordsAr(e.target.value)}
                  placeholder="افصل بين الكلمات بفواصل، مثال: قميص، كتان، صيفي، رجالي، كلاسيك"
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-gray-50/30"
                />
              </div>
            </div>
          )}

          {/* محتوى اللغة الإنجليزية */}
          {activeLangTab === 'en' && (
            <div className="space-y-4 animate-in fade-in duration-150" dir="ltr">
              <div className="p-2.5 bg-indigo-50/50 rounded-xl text-[11px] text-indigo-800 font-bold flex items-center gap-1.5" dir="ltr">
                <span>🇬🇧 English Information (Title, Description, Keywords)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Product Title (English)
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Classic Luxury Linen Shirt"
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-gray-50/30 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Product Description (English)
                </label>
                <textarea
                  rows={3}
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="Premium breathable fabric, comfortable tailored fit..."
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-gray-50/30 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Keywords in English (comma separated)
                </label>
                <input
                  type="text"
                  value={keywordsEn}
                  onChange={(e) => setKeywordsEn(e.target.value)}
                  placeholder="e.g. shirt, linen, luxury, menswear, summer"
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-gray-50/30"
                />
              </div>
            </div>
          )}

          {/* محتوى اللغة الفرنسية */}
          {activeLangTab === 'fr' && (
            <div className="space-y-4 animate-in fade-in duration-150" dir="ltr">
              <div className="p-2.5 bg-purple-50/50 rounded-xl text-[11px] text-purple-800 font-bold flex items-center gap-1.5" dir="ltr">
                <span>🇫🇷 Informations en Français (Titre, Description, Mots-clés)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Titre du produit (Français)
                </label>
                <input
                  type="text"
                  value={nameFr}
                  onChange={(e) => setNameFr(e.target.value)}
                  placeholder="ex. Chemise en Lin Haut de Gamme"
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden bg-gray-50/30 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Description du produit (Français)
                </label>
                <textarea
                  rows={3}
                  value={descriptionFr}
                  onChange={(e) => setDescriptionFr(e.target.value)}
                  placeholder="Tissu en lin de haute qualité, coupe moderne et confortable..."
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden bg-gray-50/30 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Mots-clés en Français (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={keywordsFr}
                  onChange={(e) => setKeywordsFr(e.target.value)}
                  placeholder="ex. chemise, lin, homme, été, luxe"
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden bg-gray-50/30"
                />
              </div>
            </div>
          )}
        </div>

        {/* 5. السعر */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Tag className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-gray-900">خامساً: السعر (Price)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                سعر البيع (MAD درهم) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="مثال: 299"
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-gray-50/30 font-bold text-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                السعر الأصلي قبل التخفيض (اختياري)
              </label>
              <input
                type="number"
                step="any"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="مثال: 450"
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:outline-hidden bg-gray-50/30 text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* 6. القياس والمخزون */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900">سادساً: القياس والمخزون (Sizes & Stock)</h3>
            </div>
            <div className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
              إجمالي القطع المتوفرة: {totalCalculatedStock}
            </div>
          </div>

          {/* نوع المقاسات المرتبطة بنوع المنتج المختار */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-700">
                المقاسات المتوفرة (مرتبطة بـ {category === 'shoes' ? '👟 الأحذية' : category === 'clothes' ? '👕 الملابس' : '🕶️ الإكسسوارات'}):
              </label>
              <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-lg border border-stone-200">
                {category === 'shoes' ? 'مقاسات الأحذية' : category === 'clothes' ? 'مقاسات الملابس' : 'قياس موحد'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESET_SIZES[category].map((sz) => {
                const isSelected = inventoryList.some((item) => item.size === sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => togglePresetSize(sz)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-stone-950 text-white shadow-2xs'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {sz} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* إضافة مقاس مخصص وتطبيق كمية موحدة */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                placeholder="مقاس مخصص..."
                className="w-28 px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50/50"
              />
              <button
                type="button"
                onClick={handleAddCustomSize}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-lg cursor-pointer"
              >
                + إضافة
              </button>
            </div>

            <div className="flex items-center gap-2 mr-auto">
              <span className="text-xs text-gray-500">كمية موحدة:</span>
              <input
                type="number"
                min="0"
                value={bulkStockVal}
                onChange={(e) => setBulkStockVal(e.target.value)}
                className="w-14 px-2 py-1 text-xs border border-gray-200 rounded-lg text-center"
              />
              <button
                type="button"
                onClick={handleApplyUniformStock}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                تطبيق للكل
              </button>
            </div>
          </div>

          {/* جدول كميات المقاسات المختارة */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2">
            {inventoryList.map((item) => (
              <div
                key={item.size}
                className="p-2.5 bg-gray-50/70 border border-gray-200 rounded-xl flex items-center justify-between gap-2"
              >
                <span className="text-xs font-bold text-gray-900 shrink-0">{item.size}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400">الكمية:</span>
                  <input
                    type="number"
                    min="0"
                    value={item.stock}
                    onChange={(e) => handleStockChange(item.size, parseInt(e.target.value, 10) || 0)}
                    className="w-14 px-2 py-1 text-xs border border-gray-300 rounded-lg text-center bg-white font-bold text-gray-900"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. الصور */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900">سابعاً: صور المنتج (Product Images)</h3>
            </div>
            <span className="text-xs text-gray-400 font-bold">
              {imageFiles.length + imageUrls.length} صور محددة
            </span>
          </div>

          {/* منطقة رفع الصور */}
          <label className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer block bg-gray-50/40 hover:bg-blue-50/20 transition-all">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFilesAdded(e.target.files)}
              className="hidden"
            />
            <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-700 mb-1">
              اضغط هنا لاختيار صور من جهازك أو اسحبها وأفلتها
            </p>
            <p className="text-[10px] text-gray-400">JPG, PNG, WEBP (يمكنك اختيار عدة صور معاً)</p>
          </label>

          {/* إضافة رابط صورة خارجي اختياري */}
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="أو الصق رابط صورة مباشر (https://...)..."
              dir="ltr"
              className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50/50"
            />
            <button
              type="button"
              onClick={handleAddDirectUrl}
              className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg cursor-pointer shrink-0"
            >
              + إضافة الرابط
            </button>
          </div>

          {/* معاينة الصور المضافة */}
          {(imageFiles.length > 0 || imageUrls.length > 0) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {/* الصور المرفوعة من الجهاز */}
              {imageFiles.map((file, idx) => {
                const previewUrl = URL.createObjectURL(file);
                const isPrimary = idx === 0 && imageUrls.length === 0;
                return (
                  <div
                    key={`file-${idx}`}
                    className="relative group border border-gray-200 rounded-xl overflow-hidden bg-gray-100 aspect-square"
                  >
                    <img src={previewUrl} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    {isPrimary && (
                      <span className="absolute top-1.5 right-1.5 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                        <Star className="w-2.5 h-2.5" /> رئيسية
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryFile(idx)}
                          title="تعيين كصورة رئيسية"
                          className="p-1.5 bg-white text-gray-900 rounded-lg hover:bg-blue-50 text-[10px] font-bold cursor-pointer"
                        >
                          رئيسية
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImageFile(idx)}
                        title="حذف"
                        className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* روابط الصور المباشرة */}
              {imageUrls.map((url, idx) => (
                <div
                  key={`url-${idx}`}
                  className="relative group border border-gray-200 rounded-xl overflow-hidden bg-gray-100 aspect-square"
                >
                  <img src={url} alt={`URL Preview ${idx}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeImageUrl(idx)}
                      title="حذف"
                      className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* زر النشر النهائي */}
        <div className="sticky bottom-6 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-200/90 flex items-center justify-between gap-4">
          <div className="text-xs text-gray-500 font-bold hidden sm:block">
            <span>جاهز لنشر المنتج بالمتجر؟</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onGoToInventory}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              إلغاء والعودة
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 sm:flex-initial px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري رفع الصور والحفظ...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>نشر وحفظ المنتج بالمتجر</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
