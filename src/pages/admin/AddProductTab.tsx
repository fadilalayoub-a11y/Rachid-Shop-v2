import { FormEvent, useState, useRef, useEffect, useMemo } from 'react';
import {
  Plus,
  Image as ImageIcon,
  CheckCircle,
  Trash2,
  UploadCloud,
  Star,
  Package,
  ShieldAlert,
  Tag,
  DollarSign,
  Sparkles,
  Globe,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Shuffle,
  Eye,
  Percent,
  Palette,
  Sliders,
  Check,
  X,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import {
  MAIN_CATEGORIES,
  STORE_SUBCATEGORIES,
  getSubcategoriesForCategory,
  isValidSubcategoryForCategory,
} from '../../constants/categories';
import { STORE_BRANDS } from '../../constants/brands';
import { ProductStyle, ProductBadge, ProductVariant } from '../../types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface AddProductTabProps {
  productsCount: number;
  onGoToInventory: () => void;
}

// Preset color options with swatches and bilingual labels
interface ColorPreset {
  name: string;
  nameEn: string;
  hex: string;
  isLight?: boolean;
}

const COLOR_PRESETS: ColorPreset[] = [
  { name: 'أسود', nameEn: 'Black', hex: '#111827' },
  { name: 'أبيض', nameEn: 'White', hex: '#FFFFFF', isLight: true },
  { name: 'رمادي', nameEn: 'Grey', hex: '#6B7280' },
  { name: 'كحلي', nameEn: 'Navy', hex: '#1E3A8A' },
  { name: 'بيج', nameEn: 'Beige', hex: '#E5D3B3', isLight: true },
  { name: 'بني', nameEn: 'Brown', hex: '#78350F' },
  { name: 'زيتي', nameEn: 'Olive', hex: '#4D7C0F' },
  { name: 'أزرق سماوي', nameEn: 'Sky Blue', hex: '#60A5FA' },
  { name: 'أحمر نبيذي', nameEn: 'Burgundy', hex: '#991B1B' },
  { name: 'أخضر', nameEn: 'Green', hex: '#15803D' },
];

// Preset size suggestions by main category
const SIZE_PRESETS: Record<'clothes' | 'shoes' | 'accessories', string[]> = {
  clothes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
  shoes: ['39', '40', '41', '42', '43', '44', '45'],
  accessories: ['قياس موحد (One Size)', '40mm', '42mm'],
};

// Preset tags suggestions
const POPULAR_TAGS = [
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

// Fixed Styles Configuration
const STYLE_OPTIONS: { id: ProductStyle; nameAr: string; nameEn: string; desc: string; icon: string }[] = [
  {
    id: 'streetwear',
    nameAr: 'ستريت وير (لبس الشارع)',
    nameEn: 'Streetwear',
    desc: 'قصات أوفرسايز، ستايل أوربان عصري، بولو واسع وسنيكرز',
    icon: '🔥',
  },
  {
    id: 'classic',
    nameAr: 'كلاسيكي ورسمي',
    nameEn: 'Classic',
    desc: 'قمصان راقية، سراويل قماش، وأحذية جلدية كلاسيكية',
    icon: '👔',
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

// Product Badges
const BADGE_OPTIONS: { id: ProductBadge; label: string; color: string; border: string }[] = [
  { id: 'none', label: 'بدون شارة (None)', color: 'bg-gray-100 text-gray-700', border: 'border-gray-200' },
  { id: 'new', label: 'وصل حديثاً (New)', color: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-300' },
  { id: 'sale', label: 'تخفيض (Sale / Solde)', color: 'bg-rose-100 text-rose-800', border: 'border-rose-300' },
  { id: 'best_seller', label: 'الأكثر مبيعاً (Best Seller)', color: 'bg-amber-100 text-amber-900', border: 'border-amber-300' },
  { id: 'trendy', label: 'تريندي (Trendy)', color: 'bg-purple-100 text-purple-800', border: 'border-purple-300' },
  { id: 'free_shipping', label: 'توصيل مجاني (Free Shipping)', color: 'bg-blue-100 text-blue-800', border: 'border-blue-300' },
];

export function AddProductTab({ productsCount, onGoToInventory }: AddProductTabProps) {
  // A. Basic Info & Style
  const [title, setTitle] = useState('');
  const [brandId, setBrandId] = useState<string>('rachid-shop');
  const [customBrandName, setCustomBrandName] = useState('');
  const [style, setStyle] = useState<ProductStyle>('streetwear');
  const [categoryId, setCategoryId] = useState<'clothes' | 'shoes' | 'accessories'>('clothes');
  const [subcategoryId, setSubcategoryId] = useState<string>('t-shirts');
  const [description, setDescription] = useState('');

  // B. Pricing & Inventory
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
  const [collectionsList, setCollectionsList] = useState<string[]>(['denim-casual']);

  // E. Media
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Sync slug and SEO title with title changes if user hasn't edited them manually
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

  // Dynamic Variants Matrix Generator
  // Automatically calculates combinations: Color × Size
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

  // Add / Remove Colors
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

  // Add / Remove Sizes
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

  // Apply Uniform Stock to All Rows
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

  // Add Tag
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

    // Strict validation
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

      // 2. Upload All Images sequentially or in parallel
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
        name: title.trim(), // backward compat for store
        description: description.trim() || title.trim(),
        price: parseFloat(price),
        compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
        originalPrice: compareAtPrice ? parseFloat(compareAtPrice) : null, // backward compat
        cost_price: costPrice ? parseFloat(costPrice) : null,
        sku: sku.trim() || generateSku(),

        // Strict category foreign keys
        category_id: categoryId,
        category: categoryId, // backward compat
        subcategory_id: subcategoryId,
        subcategory: subcategoryId, // backward compat

        // Strict Brand & Style
        brand_id: brandId,
        brand: resolvedBrandName,
        style: style, // strictly one of 'streetwear' | 'classic' | 'sportswear' | 'casual'

        // Badges & Tags
        badge: badge,
        tags: tagsList,
        collections: collectionsList,

        // Variants Matrix & Colors/Sizes
        colors: selectedColors,
        sizes: selectedSizes,
        variants: variantsMatrix,
        inventory: aggregatedInventory, // for store cards, filters & cart compatibility

        // Media
        image: primaryImageUrl,
        secondaryImage: secondaryImageUrl,
        images: uploadedUrls,

        // SEO Fields
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
      setDescription('');
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
                نظام إدارة منتجات احترافي وفق معايير Shopify & WooCommerce
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
                  className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  إغلاق التنبيه
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* =========================================================================
            SECTION A: Basic Information & Style
        ========================================================================= */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-100 pb-3 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                A
              </span>
              <h3 className="text-base font-bold text-gray-900">
                المعلومات الأساسية والستايل (Basic Information & Style)
              </h3>
            </div>
            <span className="text-[11px] text-gray-400 font-medium">مطلوبة *</span>
          </div>

          <div className="space-y-5">
            {/* 1. Product Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                عنوان المنتج (Product Title) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slug) setSlug(generateSlug(e.target.value));
                  if (!metaTitle) setMetaTitle(`${e.target.value} | RACHID SHOP`);
                }}
                placeholder="مثال: حذاء سنيكرز كاجوال رمادي بنعل مريح"
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium"
              />
            </div>

            {/* 2. Brand Dropdown & Custom Option */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  الماركة أو العلامة التجارية (Brand) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm cursor-pointer font-medium"
                >
                  <optgroup label="العلامات الشائعة">
                    {STORE_BRANDS.filter((b) => b.isPopular).map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name} {brand.nameAr ? `(${brand.nameAr})` : ''}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="خيارات إضافية">
                    {STORE_BRANDS.filter((b) => !b.isPopular).map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name} {brand.nameAr ? `(${brand.nameAr})` : ''}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {brandId === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-1.5">
                    اسم الماركة المخصصة (Custom Brand Name)
                  </label>
                  <input
                    type="text"
                    value={customBrandName}
                    onChange={(e) => setCustomBrandName(e.target.value)}
                    placeholder="اكتب اسم العلامة هنا..."
                    className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
              )}
            </div>

            {/* 3. Style (Mandatory Exactly 4 Options) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  ستايل ومظهر المنتج (Style) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-blue-600 font-bold">
                  محدد: {STYLE_OPTIONS.find((s) => s.id === style)?.nameAr}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {STYLE_OPTIONS.map((item) => {
                  const isSelected = style === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setStyle(item.id)}
                      className={`relative p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 select-none flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-100'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item.icon}</span>
                          <div>
                            <span className="block text-xs font-black text-gray-900 leading-tight">
                              {item.nameEn}
                            </span>
                            <span className="block text-[11px] font-bold text-gray-600">
                              {item.nameAr}
                            </span>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="product_style"
                          checked={isSelected}
                          onChange={() => setStyle(item.id)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer mt-0.5"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Category Structure (Strict Hierarchical Foreign Keys) */}
            <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/80">
              <div className="mb-3">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  الهيكل الهرمي للتصنيف (Strict Category Hierarchy)
                </span>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  ضمان انتماء المنتج لقسم فرعي واحد فقط لمنع أخطاء التكرار في المتجر
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Main Category (category_id) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    القسم الرئيسي (Main Category ID) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) =>
                      handleCategoryChange(e.target.value as 'clothes' | 'shoes' | 'accessories')
                    }
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-900 cursor-pointer"
                  >
                    {MAIN_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory (subcategory_id) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    القسم الفرعي التابع حصراً (Primary Subcategory ID){' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-blue-50/60 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-blue-950 cursor-pointer"
                  >
                    {getSubcategoriesForCategory(categoryId).map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-gray-500">
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                  FK: {categoryId} &gt; {subcategoryId}
                </span>
                <span>(مرتبط بمعرّف فريد)</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                وصف المنتج ومميزاته (Description)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (!metaDescription) setMetaDescription(e.target.value.slice(0, 160));
                }}
                placeholder="اكتب تفاصيل الخامة، إرشادات المقاس والغسيل، ونقاط قوة المنتج..."
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION B: Pricing & Inventory
        ========================================================================= */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-100 pb-3 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                B
              </span>
              <h3 className="text-base font-bold text-gray-900">
                التسعير والرمز التعريفي (Pricing & Inventory)
              </h3>
            </div>
            {profitStats && (
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                هامش الربح: +{profitStats.profit} د.م ({profitStats.margin}%)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sale Price */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                سعر البيع (Sale Price) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="مثال: 249"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-black text-gray-900 pl-12"
                />
                <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-bold">
                  د.م (DH)
                </span>
              </div>
            </div>

            {/* Compare At Price */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  السعر الأصلي (Compare-at)
                </label>
                {discountPercentage !== null && (
                  <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded">
                    -{discountPercentage}%
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  placeholder="لإظهار خصم (مثال: 349)"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold pl-12"
                />
                <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">
                  د.م (DH)
                </span>
              </div>
            </div>

            {/* Cost Price (Internal Admin only) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                سعر التكلفة (Cost Price - داخلي)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="لحساب الربح (مثال: 120)"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 outline-none transition-all text-sm font-medium pl-12"
                />
                <span className="absolute left-3 top-2.5 text-xs text-stone-400 font-bold">
                  د.م (DH)
                </span>
              </div>
            </div>

            {/* SKU Code */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  رمز المنتج (SKU Code)
                </label>
                <button
                  type="button"
                  onClick={generateSku}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 cursor-pointer"
                  title="توليد SKU تلقائي"
                >
                  <Shuffle className="w-3 h-3" />
                  توليد
                </button>
              </div>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="RCD-NK-SHOE-1234"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs font-mono font-bold uppercase tracking-wider"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION C: Variants & Stock Management (Colors & Sizes Matrix)
        ========================================================================= */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-100 pb-3 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                C
              </span>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  مصفوفة المتغيرات والمخزون (Dynamic Variants Matrix)
                </h3>
                <p className="text-xs text-gray-500">
                  حدد الألوان والمقاسات لتوليد جدول التركيبات التلقائي [اللون + المقاس + الكمية]
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold text-gray-700 bg-purple-50 text-purple-900 border border-purple-200 px-3 py-1 rounded-xl">
                إجمالي المخزون: {totalCalculatedStock} قطعة
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Colors Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-purple-600" />
                1. الألوان المتاحة (Available Colors)
              </label>

              {/* Presets Chips */}
              <div className="flex flex-wrap gap-2 mb-3">
                {COLOR_PRESETS.map((color) => {
                  const isSelected = selectedColors.includes(color.name);
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => toggleColorPreset(color.name)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-2xs'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-purple-600 ml-0.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Color */}
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  value={customColorInput}
                  onChange={(e) => setCustomColorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomColor();
                    }
                  }}
                  placeholder="لون آخر (مثال: برتقالي فسفوري)..."
                  className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={addCustomColor}
                  className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  + إضافة لون
                </button>
              </div>
            </div>

            {/* Step 2: Sizes Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-purple-600" />
                2. المقاسات المتاحة (Available Sizes)
              </label>

              {/* Category-based presets */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {SIZE_PRESETS[categoryId].map((sz) => {
                  const isSelected = selectedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSize(sz)}
                      className={`min-w-10 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>

              {/* Custom Size Input */}
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomSize();
                    }
                  }}
                  placeholder="مقاس مخصص (مثال: 46 أو 4XL)..."
                  className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={addCustomSize}
                  className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  + إضافة مقاس
                </button>
              </div>
            </div>

            {/* Step 3: Automatically Generated Variants Matrix Table */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    جدول التركيبات والمخزون التفصيلي ({variantsMatrix.length} تركيبات)
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    يمكنك تعديل كمية كل متغير مباشرة أو تطبيق قيمة موحدة
                  </p>
                </div>

                {/* Bulk stock applicator */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500">تطبيق على الكل:</span>
                  <input
                    type="number"
                    min="0"
                    value={uniformBulkStock}
                    onChange={(e) => setUniformBulkStock(e.target.value)}
                    className="w-16 px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs font-bold text-center"
                  />
                  <button
                    type="button"
                    onClick={applyUniformStock}
                    className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    تطبيق
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-2xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2.5">اللون (Color)</th>
                      <th className="px-4 py-2.5">المقاس (Size)</th>
                      <th className="px-4 py-2.5">رمز المتغير (Variant SKU)</th>
                      <th className="px-4 py-2.5">الكمية بالمخزون (Stock)</th>
                      <th className="px-4 py-2.5 text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {variantsMatrix.map((item, idx) => {
                      const colorPreset = COLOR_PRESETS.find((c) => c.name === item.color);
                      return (
                        <tr key={item.id || idx} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2 font-bold text-gray-900">
                              {colorPreset && (
                                <span
                                  className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                                  style={{ backgroundColor: colorPreset.hex }}
                                />
                              )}
                              <span>{item.color}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="font-mono font-bold bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                              {item.size}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-gray-500 text-[11px]">
                            {item.sku || `${sku}-${item.color}-${item.size}`}
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              min="0"
                              value={item.stock}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setVariantsMatrix((prev) =>
                                  prev.map((row, i) =>
                                    i === idx ? { ...row, stock: isNaN(val) ? 0 : val } : row
                                  )
                                );
                              }}
                              className="w-24 px-2.5 py-1 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-purple-500 outline-none text-center"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setVariantsMatrix((prev) => prev.filter((_, i) => i !== idx));
                              }}
                              className="text-gray-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                              title="حذف هذا المتغير"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION D: Badges & Tags
        ========================================================================= */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-100 pb-3 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                D
              </span>
              <h3 className="text-base font-bold text-gray-900">
                الشارات والوسوم (Badges & Tags)
              </h3>
            </div>
            <span className="text-[11px] text-gray-400">للفلترة والعروض</span>
          </div>

          <div className="space-y-5">
            {/* 1. Product Badge (Single Selector) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                شارة المنتج المميزة (Product Badge)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {BADGE_OPTIONS.map((item) => {
                  const isSelected = badge === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setBadge(item.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all text-xs font-bold cursor-pointer text-right ${
                        isSelected
                          ? `ring-2 ring-amber-400 border-amber-500 ${item.color} shadow-xs`
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-amber-700" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Tags Field (Comma separated + Suggestions) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-600" />
                الوسوم والكلمات الدلالية للفلترة (Filter Tags)
              </label>

              {/* Tag Input */}
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddTag(tagInput);
                      setTagInput('');
                    }
                  }}
                  placeholder="اكتب الوسم واضغط Enter (مثال: جلد، خفيف، صيفي)..."
                  className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-amber-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    handleAddTag(tagInput);
                    setTagInput('');
                  }}
                  className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  إضافة وسم
                </button>
              </div>

              {/* Current Active Tags */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tagsList.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-bold"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-amber-700 hover:text-amber-950 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-gray-500">
                <span>مقترحات سريعة:</span>
                {POPULAR_TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleAddTag(t)}
                    className="hover:underline text-gray-600 hover:text-blue-600 cursor-pointer"
                  >
                    +{t}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Collections Checkboxes */}
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-700 mb-2">
                ربط المنتج بالمجموعات والتشكيلات الترويجية (Store Collections):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'denim-casual', label: 'جينز وكاجوال' },
                  { id: 'sportswear-gym', label: 'ملابس رياضية' },
                  { id: 'summer-essentials', label: 'أساسيات الصيف' },
                  { id: 'watches-fragrances', label: 'ساعات وعطور' },
                ].map((col) => {
                  const isChecked = collectionsList.includes(col.id);
                  return (
                    <label
                      key={col.id}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold cursor-pointer select-none ${
                        isChecked
                          ? 'bg-blue-50/80 border-blue-300 text-blue-900'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCollectionsList((prev) => [...prev, col.id]);
                          } else {
                            setCollectionsList((prev) => prev.filter((c) => c !== col.id));
                          }
                        }}
                        className="w-3.5 h-3.5 text-blue-600 rounded cursor-pointer"
                      />
                      <span>{col.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION E: Media & SEO Settings
        ========================================================================= */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-100 pb-3 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                E
              </span>
              <h3 className="text-base font-bold text-gray-900">
                وسائط المنتج وإعدادات السيو (Media & SEO)
              </h3>
            </div>
            <span className="text-xs bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              {imageFiles.length} {imageFiles.length === 1 ? 'صورة' : 'صور'}
            </span>
          </div>

          <div className="space-y-6">
            {/* Drag and Drop Multi-Image Uploader with Reordering */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    صور المنتج (Multi-Image Drag & Drop with Reordering){' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-gray-500">
                    الصورة #1 هي الصورة الرئيسية، والصورة #2 تظهر تلقائياً عند تمرير الفأرة (Hover).
                    استخدم الأسهم لإعادة الترتيب.
                  </p>
                </div>

                <label className="cursor-pointer inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-2xs transition-colors shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                  <span>رفع صور إضافية</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      handleFilesAdded(e.target.files);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>

              {/* Drag Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFilesAdded(e.dataTransfer.files);
                }}
                className={`border-2 border-dashed rounded-2xl p-4 transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                }`}
              >
                {imageFiles.length === 0 ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="text-center py-10 cursor-pointer group"
                  >
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:border-blue-400 transition-all shadow-2xs">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-gray-800">
                      اضغط هنا لرفع الصور أو اسحبها وأفلتها في هذه المساحة
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      يدعم صور متعددة بصيغ JPG, PNG, WEBP بدقة عالية
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {imageFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className={`relative group/img rounded-xl overflow-hidden bg-white border-2 p-1.5 transition-all shadow-2xs flex flex-col justify-between ${
                          idx === 0
                            ? 'border-blue-600 ring-2 ring-blue-100'
                            : idx === 1
                            ? 'border-purple-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Image Preview */}
                        <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-50 mb-1.5 relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`صورة ${idx + 1}`}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />

                          {/* Badge Overlay */}
                          <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 pointer-events-none">
                            {idx === 0 && (
                              <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                الرئيسية
                              </span>
                            )}
                            {idx === 1 && (
                              <span className="bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
                                عند التمرير (Hover)
                              </span>
                            )}
                          </div>

                          <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-mono px-1 rounded">
                            #{idx + 1}
                          </span>
                        </div>

                        {/* Reordering and Controls Bar */}
                        <div className="flex items-center justify-between gap-1 pt-1 border-t border-gray-100">
                          {/* Move Buttons */}
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveImage(idx, 'left')}
                              className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-gray-700"
                              title="تحريك للخلف"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === imageFiles.length - 1}
                              onClick={() => moveImage(idx, 'right')}
                              className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-gray-700"
                              title="تحريك للأمام"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          </div>

                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => setAsPrimary(idx)}
                              className="text-[10px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                            >
                              جعلها رئيسية
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="p-1 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="حذف الصورة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add More Tile */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/30 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-gray-400 hover:text-blue-600 transition-all"
                    >
                      <Plus className="w-6 h-6" />
                      <span className="text-xs font-bold">إضافة المزيد</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Collapsible SEO Accordion */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/60">
              <button
                type="button"
                onClick={() => setIsSeoOpen(!isSeoOpen)}
                className="w-full p-4 flex items-center justify-between text-right cursor-pointer hover:bg-gray-100/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      إعدادات تحسين محركات البحث (SEO Fields - اختياري)
                    </span>
                    <span className="text-[11px] text-gray-500">
                      معاينة مقتطف Google، الرابط الدائم (Slug)، والبيانات الوصفية
                    </span>
                  </div>
                </div>
                {isSeoOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {isSeoOpen && (
                <div className="p-4 sm:p-5 bg-white border-t border-gray-200 space-y-4">
                  {/* URL Slug */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      الرابط الدائم (URL Slug)
                    </label>
                    <div className="flex items-center gap-2" dir="ltr">
                      <span className="text-xs text-gray-400 font-mono">
                        rachidshop.com/product/
                      </span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(generateSlug(e.target.value))}
                        placeholder="white-sneakers-shoes"
                        className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Meta Title */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        عنوان صفحة البحث (Meta Title)
                      </label>
                      <span className="text-[11px] text-gray-400">
                        {metaTitle.length}/60 حرف
                      </span>
                    </div>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="عنوان يظهر في نتائج البحث..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Meta Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        الوصف لمحركات البحث (Meta Description)
                      </label>
                      <span className="text-[11px] text-gray-400">
                        {metaDescription.length}/160 حرف
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="وصف مختصر ومحفز للضغط في محرك بحث جوجل..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {/* Live Google Search Preview Card */}
                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200" dir="ltr">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Google Search Result Snippet Preview:
                    </span>
                    <div className="text-xs text-emerald-800 font-mono truncate">
                      https://rachidshop.com/product/{slug || 'product-slug'}
                    </div>
                    <div className="text-sm font-medium text-blue-700 hover:underline truncate mt-0.5">
                      {metaTitle || `${title || 'عنوان المنتج'} | RACHID SHOP`}
                    </div>
                    <div className="text-xs text-gray-600 line-clamp-2 mt-1">
                      {metaDescription || description || 'وصف المنتج الذي سيظهر في جوجل...'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            Submit Button
        ========================================================================= */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2.5 cursor-pointer text-base"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري رفع الصور وحفظ المنتج في المتجر...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>نشر المنتج في المتجر وحفظه بالمخزون</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
