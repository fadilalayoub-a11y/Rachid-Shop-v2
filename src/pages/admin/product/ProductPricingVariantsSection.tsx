import React from 'react';
import {
  DollarSign,
  Percent,
  Palette,
  Sliders,
  Check,
  Package,
  Shuffle
} from 'lucide-react';
import { ProductVariant } from '../../../types';

export interface ColorPreset {
  name: string;
  nameEn: string;
  hex: string;
  isLight?: boolean;
}

export const COLOR_PRESETS: ColorPreset[] = [
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

export const SIZE_PRESETS: Record<'clothes' | 'shoes' | 'accessories', string[]> = {
  clothes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
  shoes: ['39', '40', '41', '42', '43', '44', '45'],
  accessories: ['قياس موحد (One Size)', '40mm', '42mm'],
};

interface ProductPricingVariantsSectionProps {
  price: string;
  setPrice: (val: string) => void;
  compareAtPrice: string;
  setCompareAtPrice: (val: string) => void;
  costPrice: string;
  setCostPrice: (val: string) => void;
  sku: string;
  setSku: (val: string) => void;
  onGenerateSku: () => void;
  discountPercentage: number | null;
  profitStats: { profit: number; margin: number } | null;
  categoryId: 'clothes' | 'shoes' | 'accessories';
  selectedColors: string[];
  onToggleColorPreset: (name: string) => void;
  customColorInput: string;
  setCustomColorInput: (val: string) => void;
  onAddCustomColor: () => void;
  selectedSizes: string[];
  onToggleSize: (size: string) => void;
  customSizeInput: string;
  setCustomSizeInput: (val: string) => void;
  onAddCustomSize: () => void;
  variantsMatrix: ProductVariant[];
  setVariantsMatrix: React.Dispatch<React.SetStateAction<ProductVariant[]>>;
  uniformBulkStock: string;
  setUniformBulkStock: (val: string) => void;
  onApplyUniformStock: () => void;
  totalCalculatedStock: number;
}

export function ProductPricingVariantsSection({
  price,
  setPrice,
  compareAtPrice,
  setCompareAtPrice,
  costPrice,
  setCostPrice,
  sku,
  setSku,
  onGenerateSku,
  discountPercentage,
  profitStats,
  categoryId,
  selectedColors,
  onToggleColorPreset,
  customColorInput,
  setCustomColorInput,
  onAddCustomColor,
  selectedSizes,
  onToggleSize,
  customSizeInput,
  setCustomSizeInput,
  onAddCustomSize,
  variantsMatrix,
  setVariantsMatrix,
  uniformBulkStock,
  setUniformBulkStock,
  onApplyUniformStock,
  totalCalculatedStock
}: ProductPricingVariantsSectionProps) {
  const currentCategorySizePresets = SIZE_PRESETS[categoryId] || SIZE_PRESETS.clothes;

  return (
    <div className="space-y-6">
      {/* 1. Pricing & Profitability Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>التسعير والأرباح ورمز التخزين (Pricing & Financials)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Selling Price */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              سعر البيع للزبون (DH) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="299"
                className="w-full px-3.5 py-2 text-sm font-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-emerald-700 bg-emerald-50/20"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                DH
              </span>
            </div>
          </div>

          {/* Compare at Price (Original Price before Discount) */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              السعر الأصلي قبل التخفيض (DH)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="399"
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-500 line-through bg-gray-50/40"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                DH
              </span>
            </div>
          </div>

          {/* Cost Price */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              سعر تكلفة الشراء عليك (DH)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="150"
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-700 bg-gray-50/40"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                DH
              </span>
            </div>
          </div>
        </div>

        {/* Financial Badges & Insights */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {discountPercentage !== null && (
            <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-xl text-xs font-bold">
              <Percent className="w-3.5 h-3.5" />
              <span>نسبة التخفيض الظاهرة للزبون: {discountPercentage}% خصم</span>
            </div>
          )}

          {profitStats && (
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-bold">
              <span>صافي ربحك في القطعة: {profitStats.profit.toFixed(0)} DH</span>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded-md">
                هامش {profitStats.margin}%
              </span>
            </div>
          )}
        </div>

        {/* Master SKU */}
        <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-800 mb-1">
              رمز التخزين المرجعي الرئيسي (Master SKU)
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="RCD-CLT-TSH-8472"
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl font-mono text-gray-700 bg-white"
              dir="ltr"
            />
          </div>
          <button
            type="button"
            onClick={onGenerateSku}
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 self-end sm:self-auto"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>توليد تلقائي</span>
          </button>
        </div>
      </div>

      {/* 2. Colors & Sizes Variant Setup */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <Palette className="w-4 h-4 text-purple-600" />
          <span>الألوان والمقاسات المتاحة (Colors & Sizes)</span>
        </h3>

        {/* A. Colors Selection */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1.5">
            اختر الألوان المتوفرة لهذا المنتج:
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {COLOR_PRESETS.map((col) => {
              const isSelected = selectedColors.includes(col.name);
              return (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => onToggleColorPreset(col.name)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span>{col.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-blue-600" />}
                </button>
              );
            })}
          </div>

          {/* Add Custom Color */}
          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              value={customColorInput}
              onChange={(e) => setCustomColorInput(e.target.value)}
              placeholder="إضافة لون مخصص آخر (مثال: بترولي)..."
              className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={onAddCustomColor}
              className="px-3.5 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              إضافة
            </button>
          </div>
        </div>

        {/* B. Sizes Selection */}
        <div className="pt-3 border-t border-gray-100">
          <label className="block text-xs font-bold text-gray-800 mb-1.5">
            اختر المقاسات المتوفرة (حسب قسم {categoryId === 'shoes' ? 'الأحذية' : categoryId === 'clothes' ? 'الملابس' : 'الإكسسوارات'}):
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {currentCategorySizePresets.map((sz) => {
              const isSelected = selectedSizes.includes(sz);
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => onToggleSize(sz)}
                  className={`min-w-9 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>

          {/* Add Custom Size */}
          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              value={customSizeInput}
              onChange={(e) => setCustomSizeInput(e.target.value)}
              placeholder="إضافة مقاس مخصص (مثال: 4XL أو 46)..."
              className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={onAddCustomSize}
              className="px-3.5 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              إضافة
            </button>
          </div>
        </div>
      </div>

      {/* 3. Dynamic Stock & Variants Matrix Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>مصفوفة التخزين والكميات لكل مقاس ولون (Variants Inventory)</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              تم توليد {variantsMatrix.length} خيار مختلف تلقائياً (اللون × المقاس)
            </p>
          </div>

          {/* Total Stock Indicator */}
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-900 border border-indigo-200 px-3.5 py-1.5 rounded-xl text-xs font-bold self-start sm:self-auto">
            <Package className="w-4 h-4 text-indigo-600" />
            <span>إجمالي قطع المخزون: {totalCalculatedStock} قطعة</span>
          </div>
        </div>

        {/* Quick Bulk Stock Fill */}
        <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-gray-700">
            تعبئة سريعة للكمية لجميع المقاسات والألوان دفعة واحدة:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={uniformBulkStock}
              onChange={(e) => setUniformBulkStock(e.target.value)}
              className="w-16 px-2.5 py-1 text-xs font-bold border border-gray-300 rounded-lg text-center bg-white"
            />
            <button
              type="button"
              onClick={onApplyUniformStock}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              تطبيق على الكل
            </button>
          </div>
        </div>

        {/* Variants Table */}
        <div className="overflow-x-auto max-h-72 overflow-y-auto border border-gray-200 rounded-xl">
          <table className="w-full text-right text-xs">
            <thead className="bg-gray-100/80 text-gray-700 font-bold sticky top-0 border-b border-gray-200">
              <tr>
                <th className="p-3">اللون</th>
                <th className="p-3">المقاس</th>
                <th className="p-3">الكمية المتوفرة (Stock)</th>
                <th className="p-3">رمز التخزين (Variant SKU)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {variantsMatrix.map((variant, idx) => (
                <tr key={variant.id || idx} className="hover:bg-gray-50/70">
                  <td className="p-3 font-bold text-gray-900">{variant.color}</td>
                  <td className="p-3 font-bold text-blue-600 font-mono">{variant.size}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setVariantsMatrix((prev) => {
                          const copy = [...prev];
                          copy[idx] = { ...copy[idx], stock: val };
                          return copy;
                        });
                      }}
                      className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-center font-bold text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-3 font-mono text-[11px] text-gray-500" dir="ltr">
                    {variant.sku || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
