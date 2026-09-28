import React, { FormEvent, useState, useEffect, useMemo } from 'react';
import {
  Package,
  ShieldAlert,
  CheckCircle,
  ShoppingBag,
  Loader2,
  Plus
} from 'lucide-react';
import {
  MAIN_CATEGORIES,
  STORE_SUBCATEGORIES,
  getSubcategoriesForCategory,
  isValidSubcategoryForCategory,
} from '../../../constants/categories';
import { STORE_BRANDS } from '../../../constants/brands';
import { ProductStyle, ProductBadge, ProductVariant } from '../../../types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { ProductBasicInfoSection } from './ProductBasicInfoSection';
import { ProductPricingVariantsSection } from './ProductPricingVariantsSection';
import { ProductMediaLivePreviewSection } from './ProductMediaLivePreviewSection';

export interface AddProductTabProps {
  productsCount: number;
  onGoToInventory: () => void;
}

export function AddProductTab({ productsCount, onGoToInventory }: AddProductTabProps) {
  // A. Basic Info & Style
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [titleFr, setTitleFr] = useState('');
  const [brandId, setBrandId] = useState<string>('rachid-shop');
  const [customBrandName, setCustomBrandName] = useState('');
  const [style, setStyle] = useState<ProductStyle>('streetwear');
  const [categoryId, setCategoryId] = useState<'clothes' | 'shoes' | 'accessories'>('clothes');
  const [subcategoryId, setSubcategoryId] = useState<string>('t-shirts');
  const [description, setDescription] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionFr, setDescriptionFr] = useState('');

  // B. Pricing & Financials
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sku, setSku] = useState('');

  // C. Variants & Stock Matrix (Colors & Sizes)
  const [selectedColors, setSelectedColors] = useState<string[]>(['أسود']);
  const [customColorInput, setCustomColorInput] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M', 'L', 'XL']);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [variantsMatrix, setVariantsMatrix] = useState<ProductVariant[]>([]);
  const [uniformBulkStock, setUniformBulkStock] = useState('5');

  // D. Badges & Tags
  const [badge, setBadge] = useState<ProductBadge>('none');
  const [tagInput, setTagInput] = useState('');
  const [tagsList, setTagsList] = useState<string[]>(['أصلي', 'مريح']);
  const [collectionsList, setCollectionsList] = useState<string[]>([]);

  // E. Media
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // F. SEO Settings (Collapsible)
  const [isSeoOpen, setIsSeoOpen] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [slug, setSlug] = useState('');

  // Submission & Form Messages
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({
    type: '',
    text: '',
  });

  // Auto-generate SKU based on Brand + Category + Random Suffix
  const generateSku = () => {
    const brandPrefix = brandId === 'custom' ? 'CST' : brandId.toUpperCase().slice(0, 3);
    const catPrefix = categoryId === 'clothes' ? 'CLT' : categoryId === 'shoes' ? 'SHO' : 'ACC';
    const subPrefix = subcategoryId ? subcategoryId.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) : 'GEN';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newSku = `RCD-${brandPrefix}-${catPrefix}${subPrefix}-${randomNum}`;
    setSku(newSku);
    return newSku;
  };

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .trim()
      .toLowerCase()
      .replace(/[\s\-_]+/g, '-')
      .replace(/[^\w\u0621-\u064A\-]/g, '')
      .replace(/^-+|-+$/g, '');
  };

  useEffect(() => {
    if (!sku) {
      generateSku();
    }
  }, [categoryId, brandId, subcategoryId]);

  // When Category changes, validate & update subcategory to first valid child
  const handleCategoryChange = (newCat: 'clothes' | 'shoes' | 'accessories') => {
    setCategoryId(newCat);
    const availableSubs = getSubcategoriesForCategory(newCat);
    if (availableSubs.length > 0) {
      setSubcategoryId(availableSubs[0].id);
    } else {
      setSubcategoryId('');
    }

    // Auto-suggest sizes matching category
    if (newCat === 'shoes') {
      setSelectedSizes(['40', '41', '42', '43', '44']);
    } else if (newCat === 'clothes') {
      setSelectedSizes(['S', 'M', 'L', 'XL', 'XXL']);
    } else {
      setSelectedSizes(['قياس موحد (One Size)']);
    }
  };

  // Dynamic Variants Matrix Generator (Color × Size)
  useEffect(() => {
    const activeColors = selectedColors.length > 0 ? selectedColors : ['قياسي'];
    const activeSizes = selectedSizes.length > 0 ? selectedSizes : ['قياس موحد'];

    setVariantsMatrix((prev) => {
      const prevMap = new Map<string, number>();
      prev.forEach((item) => {
        prevMap.set(`${item.color}:::${item.size}`, item.stock);
      });

      const combinations: ProductVariant[] = [];
      activeColors.forEach((color) => {
        activeSizes.forEach((size) => {
          const key = `${color}:::${size}`;
          const existingStock = prevMap.has(key) ? (prevMap.get(key) as number) : 5;
          const variantSku = sku ? `${sku}-${color.toUpperCase().slice(0, 3)}-${size}` : '';

          combinations.push({
            id: key,
            color,
            size,
            stock: existingStock,
            sku: variantSku,
          });
        });
      });

      return combinations;
    });
  }, [selectedColors, selectedSizes, sku]);

  // Calculate Total Combined Stock
  const totalCalculatedStock = useMemo(() => {
    return variantsMatrix.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
  }, [variantsMatrix]);

  // Calculate Profit and Margin
  const profitStats = useMemo(() => {
    const p = parseFloat(price);
    const c = parseFloat(costPrice);
    if (!isNaN(p) && !isNaN(c) && p > 0 && c > 0) {
      const profit = p - c;
      const margin = Math.round((profit / p) * 100);
      return { profit, margin };
    }
    return null;
  }, [price, costPrice]);

  // Calculate Discount Percentage
  const discountPercentage = useMemo(() => {
    const p = parseFloat(price);
    const orig = parseFloat(compareAtPrice);
    if (!isNaN(p) && !isNaN(orig) && orig > p && orig > 0) {
      return Math.round(((orig - p) / orig) * 100);
    }
    return null;
  }, [price, compareAtPrice]);

  // Handle Image Upload & Reordering
  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (newFiles.length > 0) {
      setImageFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= imageFiles.length) return;

    setImageFiles((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const setAsPrimary = (index: number) => {
    if (index === 0) return;
    setImageFiles((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
  };

  // Colors
  const toggleColorPreset = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const addCustomColor = () => {
    const trimmed = customColorInput.trim();
    if (trimmed && !selectedColors.includes(trimmed)) {
      setSelectedColors((prev) => [...prev, trimmed]);
      setCustomColorInput('');
    }
  };

  // Sizes
  const toggleSize = (sizeVal: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeVal) ? prev.filter((s) => s !== sizeVal) : [...prev, sizeVal]
    );
  };

  const addCustomSize = () => {
    const trimmed = customSizeInput.trim().toUpperCase();
    if (trimmed && !selectedSizes.includes(trimmed)) {
      setSelectedSizes((prev) => [...prev, trimmed]);
      setCustomSizeInput('');
    }
  };

  // Apply Uniform Stock
  const applyUniformStock = () => {
    const qty = parseInt(uniformBulkStock, 10);
    if (isNaN(qty) || qty < 0) return;
    setVariantsMatrix((prev) =>
      prev.map((item) => ({
        ...item,
        stock: qty,
      }))
    );
  };

  // Tags
  const handleAddTag = (newTag: string) => {
    const trimmed = newTag.trim();
    if (trimmed && !tagsList.includes(trimmed)) {
      setTagsList((prev) => [...prev, trimmed]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Form Submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormMessage({ type: '', text: '' });

    if (!title.trim()) {
      setFormMessage({ type: 'error', text: 'يرجى إدخال عنوان المنتج (Product Title)' });
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      setFormMessage({ type: 'error', text: 'يرجى إدخال سعر بيع صحيح للمنتج (Sale Price)' });
      return;
    }

    if (!isValidSubcategoryForCategory(categoryId, subcategoryId)) {
      setFormMessage({
        type: 'error',
        text: 'خطأ في الربط الهرمي: القسم التفصيلي لا ينتمي للقسم الرئيسي المختار',
      });
      return;
    }

    if (imageFiles.length === 0) {
      setFormMessage({ type: 'error', text: 'يرجى إرفاق صورة واحدة على الأقل للمنتج' });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Get Signature from secure Serverless Function for Cloudinary
      const signatureRes = await fetch('/api/cloudinary-sign');
      const signatureData = await signatureRes.json();

      if (!signatureRes.ok) {
        throw new Error(signatureData.error || 'فشل الحصول على تصريح رفع الصور');
      }

      const { timestamp, signature, apiKey, cloudName } = signatureData;
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      // 2. Upload All Images
      const uploadedUrls: string[] = [];
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);

        const response = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (!response.ok || !data.secure_url) {
          throw new Error(data.error?.message || 'خطأ أثناء رفع إحدى الصور');
        }

        uploadedUrls.push(data.secure_url);
      }

      const primaryImageUrl = uploadedUrls[0];
      const secondaryImageUrl = uploadedUrls.length > 1 ? uploadedUrls[1] : null;

      // 3. Resolve Brand
      let resolvedBrandName = brandId;
      if (brandId === 'custom') {
        resolvedBrandName = customBrandName.trim() || 'Custom Brand';
      } else {
        const found = STORE_BRANDS.find((b) => b.id === brandId);
        resolvedBrandName = found ? found.name : brandId;
      }

      // 4. Build Backwards-Compatible Aggregated Inventory per Size
      const sizeStockMap = new Map<string, number>();
      variantsMatrix.forEach((v) => {
        const current = sizeStockMap.get(v.size) || 0;
        sizeStockMap.set(v.size, current + (Number(v.stock) || 0));
      });

      const aggregatedInventory = Array.from(sizeStockMap.entries()).map(([sz, stk]) => ({
        size: sz,
        stock: stk,
      }));

      // 5. Final Product Document
      const productPayload = {
        title: title.trim(),
        name: title.trim(),
        nameAr: title.trim(),
        nameEn: titleEn.trim() || undefined,
        nameFr: titleFr.trim() || undefined,
        description: description.trim() || title.trim(),
        descriptionAr: description.trim() || title.trim(),
        descriptionEn: descriptionEn.trim() || undefined,
        descriptionFr: descriptionFr.trim() || undefined,
        price: parseFloat(price),
        compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
        originalPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        cost_price: costPrice ? parseFloat(costPrice) : null,
        sku: sku.trim() || generateSku(),

        category_id: categoryId,
        category: categoryId,
        subcategory_id: subcategoryId,
        subcategory: subcategoryId,

        brand_id: brandId,
        brand: resolvedBrandName,
        style: style,

        badge: badge,
        tags: tagsList,
        collections: collectionsList,

        colors: selectedColors,
        sizes: selectedSizes,
        variants: variantsMatrix,
        inventory: aggregatedInventory,

        image: primaryImageUrl,
        secondaryImage: secondaryImageUrl,
        images: uploadedUrls,

        meta_title: metaTitle.trim() || `${title.trim()} | RACHID SHOP`,
        meta_description:
          metaDescription.trim() ||
          description.trim().slice(0, 160) ||
          `تسوق ${title.trim()} بأفضل الأسعار من متجر رشيد.`,
        slug: slug.trim() || generateSlug(title),

        isTrending: badge === 'trendy' || badge === 'best_seller',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'products'), productPayload);

      // Reset Form State
      setTitle('');
      setTitleEn('');
      setTitleFr('');
      setDescription('');
      setDescriptionEn('');
      setDescriptionFr('');
      setPrice('');
      setCompareAtPrice('');
      setCostPrice('');
      generateSku();
      setImageFiles([]);
      setMetaTitle('');
      setMetaDescription('');
      setSlug('');
      setFormMessage({
        type: 'success',
        text: `تمت إضافة المنتج "${productPayload.title}" بنجاح وتحديث قاعدة البيانات!`,
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

  const resolvedBrandName = useMemo(() => {
    if (brandId === 'custom') return customBrandName.trim() || 'Custom Brand';
    const b = STORE_BRANDS.find((brand) => brand.id === brandId);
    return b ? b.name : brandId;
  }, [brandId, customBrandName]);

  const currentCategoryObj = MAIN_CATEGORIES.find((c) => c.id === categoryId);
  const currentSubcategoryObj = STORE_SUBCATEGORIES.find((s) => s.id === subcategoryId);

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Header & Quick Actions */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">إضافة منتج جديد (Create Product)</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                نظام إدارة منتجات احترافي وفق معايير التجارة الإلكترونية الحديثة
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoToInventory}
          className="inline-flex items-center gap-2 text-xs text-gray-700 hover:text-gray-950 font-bold bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition-all cursor-pointer self-start sm:self-auto border border-gray-200/80 shadow-2xs"
        >
          <Package className="w-4 h-4 text-gray-600" />
          <span>المخزون الحالي</span>
          <span className="bg-white px-2 py-0.5 rounded-md text-[11px] font-bold text-gray-900 border border-gray-300">
            {productsCount}
          </span>
        </button>
      </div>

      {/* Global Alerts / Status */}
      {formMessage.text && (
        <div
          className={`mb-6 p-4 rounded-2xl text-sm font-medium transition-all ${
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
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  عرض في المخزون
                </button>
                <button
                  type="button"
                  onClick={() => setFormMessage({ type: '', text: '' })}
                  className="text-xs text-emerald-700 hover:underline font-bold px-2 py-1"
                >
                  إغلاق
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form with 3 Modular Sections */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Component 1: Basic Info & Category */}
        <ProductBasicInfoSection
          title={title}
          setTitle={setTitle}
          titleEn={titleEn}
          setTitleEn={setTitleEn}
          titleFr={titleFr}
          setTitleFr={setTitleFr}
          brandId={brandId}
          setBrandId={setBrandId}
          customBrandName={customBrandName}
          setCustomBrandName={setCustomBrandName}
          style={style}
          setStyle={setStyle}
          categoryId={categoryId}
          onCategoryChange={handleCategoryChange}
          subcategoryId={subcategoryId}
          setSubcategoryId={setSubcategoryId}
          description={description}
          setDescription={setDescription}
          descriptionEn={descriptionEn}
          setDescriptionEn={setDescriptionEn}
          descriptionFr={descriptionFr}
          setDescriptionFr={setDescriptionFr}
          badge={badge}
          setBadge={setBadge}
          tagsList={tagsList}
          tagInput={tagInput}
          setTagInput={setTagInput}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          isSeoOpen={isSeoOpen}
          setIsSeoOpen={setIsSeoOpen}
          metaTitle={metaTitle}
          setMetaTitle={setMetaTitle}
          metaDescription={metaDescription}
          setMetaDescription={setMetaDescription}
          slug={slug}
          setSlug={setSlug}
        />

        {/* Component 2: Pricing & Variants Matrix */}
        <ProductPricingVariantsSection
          price={price}
          setPrice={setPrice}
          compareAtPrice={compareAtPrice}
          setCompareAtPrice={setCompareAtPrice}
          costPrice={costPrice}
          setCostPrice={setCostPrice}
          sku={sku}
          setSku={setSku}
          onGenerateSku={generateSku}
          discountPercentage={discountPercentage}
          profitStats={profitStats}
          categoryId={categoryId}
          selectedColors={selectedColors}
          onToggleColorPreset={toggleColorPreset}
          customColorInput={customColorInput}
          setCustomColorInput={setCustomColorInput}
          onAddCustomColor={addCustomColor}
          selectedSizes={selectedSizes}
          onToggleSize={toggleSize}
          customSizeInput={customSizeInput}
          setCustomSizeInput={setCustomSizeInput}
          onAddCustomSize={addCustomSize}
          variantsMatrix={variantsMatrix}
          setVariantsMatrix={setVariantsMatrix}
          uniformBulkStock={uniformBulkStock}
          setUniformBulkStock={setUniformBulkStock}
          onApplyUniformStock={applyUniformStock}
          totalCalculatedStock={totalCalculatedStock}
        />

        {/* Component 3: Media Gallery & Live Store Card Preview */}
        <ProductMediaLivePreviewSection
          imageFiles={imageFiles}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          onFilesAdded={handleFilesAdded}
          onRemoveImage={removeImage}
          onMoveImage={moveImage}
          onSetAsPrimary={setAsPrimary}
          title={title}
          brandName={resolvedBrandName}
          categoryName={currentCategoryObj?.nameAr || ''}
          subcategoryName={currentSubcategoryObj?.nameAr || ''}
          style={style}
          price={price}
          compareAtPrice={compareAtPrice}
          badge={badge}
          selectedColors={selectedColors}
          selectedSizes={selectedSizes}
          totalCalculatedStock={totalCalculatedStock}
        />

        {/* Floating Submit Action */}
        <div className="sticky bottom-6 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-200/90 flex items-center justify-between gap-4">
          <div className="hidden sm:block text-xs text-gray-500 font-bold">
            <span>جاهز لإضافة المنتج للمتجر وقاعدة البيانات؟</span>
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
