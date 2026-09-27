import { useState, useMemo } from 'react';
import { Filter, X, Check, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Product } from '../types';
import { extractAvailableSizes } from '../utils/collections';

export interface FilterState {
  size: string | null;
  categoryType: string | null;
  brand: string | null;
  priceRange: string | null; // 'under-200' | '200-400' | '400-plus' | null
  inStockOnly: boolean;
}

interface FacetedFilterProps {
  products: Product[];
  filterState: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  availableCategoryTypes?: { id: string; nameAr: string; nameEn: string }[];
  totalResultsCount: number;
}

export function FacetedFilter({
  products,
  filterState,
  onFilterChange,
  availableCategoryTypes = [],
  totalResultsCount,
}: FacetedFilterProps) {
  const { language } = useLanguage();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // استخراج المقاسات المتوفرة بالمخزون فقط (Variants with stock > 0)
  const availableSizes = useMemo(() => {
    return extractAvailableSizes(products);
  }, [products]);

  // استخراج الماركات المتوفرة
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach(p => {
      if (p.brand && p.brand.trim()) {
        brands.add(p.brand.trim());
      }
    });
    return Array.from(brands);
  }, [products]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterState.size) count++;
    if (filterState.categoryType) count++;
    if (filterState.brand) count++;
    if (filterState.priceRange) count++;
    return count;
  }, [filterState]);

  const handleSizeToggle = (size: string) => {
    onFilterChange({
      ...filterState,
      size: filterState.size === size ? null : size,
    });
  };

  const handleTypeToggle = (typeId: string) => {
    onFilterChange({
      ...filterState,
      categoryType: filterState.categoryType === typeId ? null : typeId,
    });
  };

  const handleBrandToggle = (brand: string) => {
    onFilterChange({
      ...filterState,
      brand: filterState.brand === brand ? null : brand,
    });
  };

  const handlePriceToggle = (range: string) => {
    onFilterChange({
      ...filterState,
      priceRange: filterState.priceRange === range ? null : range,
    });
  };

  const handleClearAll = () => {
    onFilterChange({
      size: null,
      categoryType: null,
      brand: null,
      priceRange: null,
      inStockOnly: true,
    });
  };

  return (
    <div className="w-full mb-8">
      {/* 1. الشريط العلوي للفلترة السريعة (Desktop & Mobile Quick Bar) */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col gap-3">
          
          {/* الرأس: العنوان، عدد المنتجات، وزر الفلترة المتقدمة للجوال */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-stone-950 text-white flex items-center justify-center">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-black tracking-wide text-stone-950 uppercase">
                {language === 'ar' ? 'تصفية المقاس والنوع' : 'Size & Facet Filters'}
              </span>
              <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                {language === 'ar' ? `${totalResultsCount} متوفر` : `${totalResultsCount} items`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{language === 'ar' ? 'إعادة ضبط' : 'Reset'}</span>
                </button>
              )}

              {/* زر إظهار كافة الفلاتر للشاشات الصغيرة */}
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'خيارات الفلترة' : 'All Filters'}</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-stone-950 text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 2. قسم المقاسات (SIZE-FIRST FILTERING) البارز دائماً */}
          {availableSizes.length > 0 && (
            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-950"></span>
                  {language === 'ar' ? 'اختر مقاسك أولاً (المتوفر بالمخزون فقط):' : 'Select your size (In-stock variants only):'}
                </span>
                {filterState.size && (
                  <span className="text-[10px] font-bold text-stone-500">
                    {language === 'ar' ? `المحدد: ${filterState.size}` : `Active: ${filterState.size}`}
                  </span>
                )}
              </div>

              {/* رقاقات المقاسات سريعة النقر */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar flex-wrap">
                <button
                  onClick={() => onFilterChange({ ...filterState, size: null })}
                  className={`min-h-[38px] px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                    filterState.size === null
                      ? 'bg-stone-950 text-white border-stone-950 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {language === 'ar' ? 'جميع المقاسات' : 'All Sizes'}
                </button>

                {availableSizes.map((size) => {
                  const isSelected = filterState.size === size;
                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`min-h-[38px] min-w-[42px] px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-stone-950 text-white border-stone-950 shadow-sm scale-105 ring-2 ring-stone-950/20'
                          : 'bg-white text-stone-800 border-stone-300 hover:border-stone-950 hover:bg-stone-50'
                      }`}
                    >
                      <span>{size}</span>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. تصنيفات القطع (Jeans, Shirts, Jackets, Sneakers, etc.) على سطح المكتب */}
          {availableCategoryTypes.length > 0 && (
            <div className="hidden md:flex items-center gap-2 pt-2 border-t border-stone-100 flex-wrap">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                {language === 'ar' ? 'نوع القطعة:' : 'Item Type:'}
              </span>

              <button
                onClick={() => onFilterChange({ ...filterState, categoryType: null })}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer border ${
                  filterState.categoryType === null
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {language === 'ar' ? 'الكل' : 'All'}
              </button>

              {availableCategoryTypes.map((cat) => {
                const isSelected = filterState.categoryType === cat.id;
                const label = language === 'ar' ? cat.nameAr : cat.nameEn;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleTypeToggle(cat.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. نافذة الفلترة الشاملة للهاتف (Mobile Drawer Modal) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-stone-950" />
                <h3 className="text-base font-black text-stone-950 uppercase tracking-wide">
                  {language === 'ar' ? 'خيارات الفلترة والتصفية' : 'Filter Options'}
                </h3>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* تصنيف القطع للهاتف */}
            {availableCategoryTypes.length > 0 && (
              <div className="mb-5">
                <span className="block text-xs font-black text-stone-900 uppercase tracking-wider mb-2.5">
                  {language === 'ar' ? 'نوع القطعة' : 'Item Type'}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleTypeToggle('')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border ${
                      filterState.categoryType === null
                        ? 'bg-stone-950 text-white border-stone-950'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    {language === 'ar' ? 'جميع الأنواع' : 'All Types'}
                  </button>
                  {availableCategoryTypes.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleTypeToggle(cat.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border ${
                        filterState.categoryType === cat.id
                          ? 'bg-stone-950 text-white border-stone-950'
                          : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      {language === 'ar' ? cat.nameAr : cat.nameEn}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* نطاق السعر */}
            <div className="mb-5">
              <span className="block text-xs font-black text-stone-900 uppercase tracking-wider mb-2.5">
                {language === 'ar' ? 'السعر' : 'Price Range'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'under-200', labelAr: 'أقل من 200 د.م', labelEn: '< 200 DH' },
                  { id: '200-400', labelAr: 'من 200 إلى 400 د.م', labelEn: '200 - 400 DH' },
                  { id: '400-plus', labelAr: 'أكثر من 400 د.م', labelEn: '> 400 DH' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => handlePriceToggle(p.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border text-center ${
                      filterState.priceRange === p.id
                        ? 'bg-stone-950 text-white border-stone-950'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    {language === 'ar' ? p.labelAr : p.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* أزرار الإجراء السفلية */}
            <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
              <button
                onClick={handleClearAll}
                className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 cursor-pointer"
              >
                {language === 'ar' ? 'إعادة ضبط' : 'Reset'}
              </button>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="flex-1 py-3 rounded-xl bg-stone-950 text-white font-bold text-xs hover:bg-stone-900 shadow-md cursor-pointer"
              >
                {language === 'ar' ? `عرض النتائج (${totalResultsCount})` : `Show Results (${totalResultsCount})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
