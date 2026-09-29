import { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Search,
  Layers,
  Save,
  CheckSquare,
  Square,
  AlertCircle,
  Tag,
  Shirt,
  Flame,
  Loader2,
  SlidersHorizontal,
  Wand2,
} from 'lucide-react';
import { doc, writeBatch } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Product, ProductStyle } from '../../../types';
import { isProductInCollection } from '../../../utils/collections';
import { classifyProduct } from '../../../utils/productClassifier';

export interface SectionDefinition {
  id: string;
  type: 'style';
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  icon: any;
}

// قائمة أقسام الستايل الفعلية فقط في المتجر (تم إزالة الفئات)
const ACTIVE_SITE_SECTIONS: SectionDefinition[] = [
  {
    id: 'old-money',
    type: 'style',
    nameAr: 'أولد ماني (Old Money)',
    nameEn: 'Old Money Aesthetic',
    descriptionAr: 'فخامة هادئة، تيشيرتات بولو راقية، قمصان كتان وموكاسان كلاسيكي',
    icon: Sparkles,
  },
  {
    id: 'classic-style',
    type: 'style',
    nameAr: 'كلاسيكي (Classic)',
    nameEn: 'Classic Style',
    descriptionAr: 'قمصان راقية، سراويل قماش، معاطف وأحذية جلدية رسمية',
    icon: Tag,
  },
  {
    id: 'streetwear',
    type: 'style',
    nameAr: 'لبس الشارع (Streetwear)',
    nameEn: 'Streetwear & Urban',
    descriptionAr: 'قصات أوفرسايز، ستايل أوربان، هوديز وسنيكرز عصرية',
    icon: Flame,
  },
  {
    id: 'sportswear-gym',
    type: 'style',
    nameAr: 'ملابس رياضية (Sportswear)',
    nameEn: 'Sportswear & Fitness',
    descriptionAr: 'كيطمات رياضية، شورتات تمرين، وسنيكرز أداء رياضي',
    icon: Flame,
  },
  {
    id: 'denim-casual',
    type: 'style',
    nameAr: 'جينز وكاجوال (Casual)',
    nameEn: 'Denim & Casual',
    descriptionAr: 'جينز مريح، قمصان يومية خفيفة وأحذية كاجوال عملية',
    icon: Layers,
  },
];

interface SectionProductsTabProps {
  products: Product[];
}

export function SectionProductsTab({ products }: SectionProductsTabProps) {
  const [selectedSectionId, setSelectedSectionId] = useState<string>('old-money');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterView, setFilterView] = useState<'all' | 'assigned' | 'unassigned'>('all');

  // خريطة حالة التحديد لكل منتج في القسم المختار (productId -> boolean)
  const [assignedMap, setAssignedMap] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | ''; text: string }>({
    type: '',
    text: '',
  });

  const selectedSection = useMemo(() => {
    return ACTIVE_SITE_SECTIONS.find((s) => s.id === selectedSectionId) || ACTIVE_SITE_SECTIONS[0];
  }, [selectedSectionId]);

  // دالة فحص ما إذا كان المنتج ينتمي للقسم المحدد بدقة وذكاء
  const checkProductBelongsToSection = (product: Product, sectionId: string): boolean => {
    if (!product) return false;

    // 1. فحص صريح في الـ collections
    if (product.collections && product.collections.includes(sectionId)) return true;

    // 2. فحص الستايل المباشر
    if (sectionId === 'old-money') return product.style === 'old_money' || product.style === 'old-money' || (product.collections?.includes('old-money') ?? false);
    if (sectionId === 'classic-style') return product.style === 'classic' || (product.collections?.includes('classic-style') ?? false) || (product.collections?.includes('classic') ?? false);
    if (sectionId === 'streetwear') return product.style === 'streetwear' || (product.collections?.includes('streetwear') ?? false);
    if (sectionId === 'sportswear-gym') return product.style === 'sportswear' || (product.collections?.includes('sportswear-gym') ?? false) || (product.collections?.includes('sportswear') ?? false);
    if (sectionId === 'denim-casual') return product.style === 'casual' || (product.collections?.includes('denim-casual') ?? false) || (product.collections?.includes('casual') ?? false);

    return isProductInCollection(product, sectionId);
  };

  // دالة المزامنة والتصنيف التلقائي الذكي لكافة المنتجات في قاعدة البيانات
  const handleAutoClassifyAllProducts = async () => {
    if (products.length === 0) return;
    setIsAutoSyncing(true);
    setFeedback({ type: '', text: '' });

    try {
      const batch = writeBatch(db);
      let updatedCount = 0;
      let shoesCount = 0;
      let clothesCount = 0;
      let accessoriesCount = 0;

      for (const product of products) {
        const inventorySizes = product.inventory?.map((i) => i.size) || product.sizes || [];
        const detected = classifyProduct(
          product.name || product.title || '',
          product.description || '',
          product.tags || [],
          inventorySizes
        );

        const currentCat = product.category;
        const currentSub = product.subcategory;
        const currentStyle = product.style;

        const needsCatUpdate = currentCat !== detected.category;
        const needsSubUpdate = !currentSub || currentSub === 'general' || (needsCatUpdate && currentSub !== detected.subcategory);
        const needsStyleUpdate = !currentStyle || (detected.suggestedStyle && currentStyle === 'casual' && detected.suggestedStyle !== 'casual');

        if (needsCatUpdate || needsSubUpdate || needsStyleUpdate) {
          updatedCount++;
          const productRef = doc(db, 'products', product.id);

          const payload: Record<string, any> = {
            category: detected.category,
            category_id: detected.category,
            subcategory: detected.subcategory,
            subcategory_id: detected.subcategory,
          };

          if (detected.suggestedStyle) {
            payload.style = detected.suggestedStyle;
          }

          batch.update(productRef, payload);

          if (detected.category === 'shoes') shoesCount++;
          else if (detected.category === 'accessories') accessoriesCount++;
          else clothesCount++;
        }
      }

      if (updatedCount > 0) {
        await batch.commit();
        setFeedback({
          type: 'success',
          text: `تم بنجاح تصنيف ومزامنة ${updatedCount} منتج تلقائياً (${shoesCount} أحذية، ${clothesCount} ملابس، ${accessoriesCount} إكسسوارات) وتحديث المتجر فوراً!`,
        });
      } else {
        setFeedback({
          type: 'success',
          text: 'جميع المنتجات في المتجر مصنفة بدقة عالية ومطابقة لخوارزمية التصنيف الذكية.',
        });
      }
    } catch (err: any) {
      console.error('Error auto classifying products:', err);
      setFeedback({
        type: 'error',
        text: `حدث خطأ أثناء التصنيف التلقائي: ${err.message || 'يرجى إعادة المحاولة'}`,
      });
    } finally {
      setIsAutoSyncing(false);
    }
  };

  // تحديث الخريطة عند تغيير القسم أو عند تحميل المنتجات
  useEffect(() => {
    const map: Record<string, boolean> = {};
    products.forEach((p) => {
      map[p.id] = checkProductBelongsToSection(p, selectedSectionId);
    });
    setAssignedMap(map);
    setFeedback({ type: '', text: '' });
  }, [selectedSectionId, products]);

  // تبديل اختيار منتج
  const handleToggleProduct = (productId: string) => {
    setAssignedMap((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // تحديد كل المنتجات المعروضة
  const handleSelectAllVisible = (filteredList: Product[]) => {
    const updated = { ...assignedMap };
    filteredList.forEach((p) => {
      updated[p.id] = true;
    });
    setAssignedMap(updated);
  };

  // إلغاء تحديد كل المنتجات المعروضة
  const handleDeselectAllVisible = (filteredList: Product[]) => {
    const updated = { ...assignedMap };
    filteredList.forEach((p) => {
      updated[p.id] = false;
    });
    setAssignedMap(updated);
  };

  // قائمة الأقسام العلوية
  const filteredSectionsList = ACTIVE_SITE_SECTIONS;

  // فلترة قائمة المنتجات
  const displayedProducts = useMemo(() => {
    return products.filter((product) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = product.name?.toLowerCase().includes(q) || product.nameAr?.toLowerCase().includes(q) || product.nameEn?.toLowerCase().includes(q);
        const matchesDesc = product.description?.toLowerCase().includes(q);
        const matchesPrice = String(product.price).includes(q);
        if (!matchesName && !matchesDesc && !matchesPrice) return false;
      }

      const isAssigned = !!assignedMap[product.id];
      if (filterView === 'assigned' && !isAssigned) return false;
      if (filterView === 'unassigned' && isAssigned) return false;

      return true;
    });
  }, [products, searchQuery, filterView, assignedMap]);

  // إحصائيات سريعة للقسم المختار
  const currentAssignedCount = useMemo(() => {
    return Object.values(assignedMap).filter(Boolean).length;
  }, [assignedMap]);

  // حفظ التعديلات في Firebase Firestore
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setFeedback({ type: '', text: '' });

    try {
      const batch = writeBatch(db);
      let changesCount = 0;

      for (const product of products) {
        const wasAssigned = checkProductBelongsToSection(product, selectedSectionId);
        const willBeAssigned = !!assignedMap[product.id];

        if (wasAssigned !== willBeAssigned) {
          changesCount++;
          const productRef = doc(db, 'products', product.id);

          let currentCollections = Array.isArray(product.collections) ? [...product.collections] : [];
          let newStyle: ProductStyle | undefined = product.style;

          const styleMap: Record<string, ProductStyle> = {
            'old-money': 'old_money',
            'classic-style': 'classic',
            'streetwear': 'streetwear',
            'sportswear-gym': 'sportswear',
            'denim-casual': 'casual',
          };

          if (willBeAssigned) {
            if (!currentCollections.includes(selectedSectionId)) {
              currentCollections.push(selectedSectionId);
            }
            if (styleMap[selectedSectionId]) {
              newStyle = styleMap[selectedSectionId];
            }
          } else {
            currentCollections = currentCollections.filter(
              (c) => c !== selectedSectionId && c !== styleMap[selectedSectionId]
            );
            if (styleMap[selectedSectionId] && product.style === styleMap[selectedSectionId]) {
              newStyle = 'casual';
            }
          }

          batch.update(productRef, {
            collections: currentCollections,
            ...(newStyle ? { style: newStyle } : {}),
          });
        }
      }

      if (changesCount > 0) {
        await batch.commit();
        setFeedback({
          type: 'success',
          text: `تم بنجاح حفظ وتحديث ${changesCount} منتج في قسم "${selectedSection.nameAr}"!`,
        });
      } else {
        setFeedback({
          type: 'success',
          text: `جميع المنتجات مطابقة لقسم "${selectedSection.nameAr}". لم يتم إجراء تغييرات جديدة.`,
        });
      }
    } catch (err: any) {
      console.error('Error saving section products:', err);
      setFeedback({
        type: 'error',
        text: `حدث خطأ أثناء الحفظ: ${err.message || 'يرجى إعادة المحاولة'}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. رأس الصفحة والتعريف بالتبويب */}
      <div className="bg-stone-950 text-white p-6 rounded-2xl shadow-sm border border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                إدارة الأقسام والستايلات الفعلية
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">تحديد وتخصيص منتجات الأقسام والستايلات</h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
              اختر أي ستايل أو فئة موجودة في الموقع وحدد المنتجات التي تود ظهورها فيها بنقرة زر، مع إمكانية التحديد أو الإلغاء الفوري.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleAutoClassifyAllProducts}
              disabled={isAutoSyncing || isSaving}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer whitespace-nowrap"
              title="فحص كافة المنتجات في قاعدة البيانات وتصنيف الأحذية والملابس والإكسسوارات تلقائياً"
            >
              {isAutoSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
              ) : (
                <Wand2 className="w-4 h-4 text-amber-300" />
              )}
              <span>تصنيف ومزامنة المتجر ذكياً</span>
            </button>

            <button
              onClick={handleSaveChanges}
              disabled={isSaving || isAutoSyncing}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-stone-950 hover:bg-stone-100 font-black text-sm rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-stone-950" /> : <Save className="w-4 h-4" />}
              <span>حفظ تعيينات القسم</span>
            </button>
          </div>
        </div>
      </div>

      {/* رسالة التنبيه */}
      {feedback.text && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span className="font-semibold">{feedback.text}</span>
        </div>
      )}

      {/* 2. اختيار القسم المطلوب إدارته */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-stone-900" />
            <h3 className="text-sm font-bold text-stone-900">1. اختر القسم أو الستايل:</h3>
          </div>

          <div className="flex items-center gap-1 bg-stone-100 px-3 py-1 rounded-xl text-xs font-bold text-stone-700">
            <span>أقسام الستايل المعتمدة ({ACTIVE_SITE_SECTIONS.length})</span>
          </div>
        </div>

        {/* شبكة الأقسام */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {filteredSectionsList.map((sec) => {
            const isSelected = selectedSectionId === sec.id;
            const Icon = sec.icon;
            const assignedCount = products.filter((p) => checkProductBelongsToSection(p, sec.id)).length;

            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSectionId(sec.id)}
                className={`p-3.5 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-2 relative overflow-hidden group ${
                  isSelected
                    ? 'border-stone-950 bg-stone-950 text-white shadow-sm ring-2 ring-stone-950/20'
                    : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50/60 text-stone-800'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-white/15 text-white' : 'bg-stone-100 text-stone-700 group-hover:bg-stone-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {assignedCount} منتج
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-black truncate">{sec.nameAr}</h4>
                  <p
                    className={`text-[10px] font-mono truncate ${
                      isSelected ? 'text-stone-300' : 'text-stone-400'
                    }`}
                    dir="ltr"
                  >
                    {sec.nameEn}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. شبكة المنتجات التابعة للقسم */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-base font-black text-stone-950">
                المنتجات التابعة لـ: <span className="text-stone-900 font-extrabold underline">{selectedSection.nameAr}</span>
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-1">{selectedSection.descriptionAr}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200">
              المحدد: <span className="text-black font-black">{currentAssignedCount}</span> من أصل {products.length} منتج
            </span>

            <button
              type="button"
              onClick={() => handleSelectAllVisible(displayedProducts)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>تحديد المعروض</span>
            </button>

            <button
              type="button"
              onClick={() => handleDeselectAllVisible(displayedProducts)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" />
              <span>إلغاء تحديد المعروض</span>
            </button>
          </div>
        </div>

        {/* حقل البحث والفلاتر */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث عن منتج بالاسم أو السعر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
              >
                مسح
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-bold w-full sm:w-auto justify-center">
            <button
              type="button"
              onClick={() => setFilterView('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterView === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              الكل ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterView('assigned')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterView === 'assigned' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              المضافة فقط ({currentAssignedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterView('unassigned')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterView === 'unassigned' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              غير المضافة ({products.length - currentAssignedCount})
            </button>
          </div>
        </div>

        {/* عرض المنتجات */}
        {displayedProducts.length === 0 ? (
          <div className="text-center py-12 bg-stone-50/60 rounded-2xl border border-dashed border-stone-200">
            <p className="text-stone-500 font-bold text-sm">لا توجد منتجات مطابقة لخيارات البحث أو الفلترة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {displayedProducts.map((product) => {
              const isAssigned = !!assignedMap[product.id];
              const totalStock = product.inventory?.reduce((sum, item) => sum + (Number(item.stock) || 0), 0) ?? 0;

              return (
                <div
                  key={product.id}
                  onClick={() => handleToggleProduct(product.id)}
                  className={`relative p-3 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between group ${
                    isAssigned
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        isAssigned
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'border-2 border-stone-300 bg-white group-hover:border-stone-400'
                      }`}
                    >
                      {isAssigned && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAssigned
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {isAssigned ? 'مضاف للقسم ✓' : 'غير مضاف'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <Shirt className="w-6 h-6 text-stone-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 line-clamp-1 group-hover:text-black">
                        {product.nameAr || product.name || product.title}
                      </h4>
                      <p className="text-[11px] font-black text-stone-950 mt-0.5">
                        {product.price} د.م
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-stone-500">
                        <span>المخزون: {totalStock}</span>
                        <span>•</span>
                        <span className="capitalize">{product.category || 'عام'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="border-t border-stone-100 pt-4 flex items-center justify-between">
          <p className="text-xs text-stone-500">
            اضغط على <strong className="text-stone-900">"حفظ تعيينات القسم"</strong> لتطبيق التغييرات في المتجر فوراً.
          </p>

          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-950 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Save className="w-3.5 h-3.5" />}
            <span>حفظ تعيينات {selectedSection.nameAr}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
