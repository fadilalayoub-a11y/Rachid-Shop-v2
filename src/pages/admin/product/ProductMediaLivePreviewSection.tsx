import React, { useRef } from 'react';
import {
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Star,
  ArrowRight,
  ArrowLeft,
  Eye,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { ProductBadge, ProductStyle } from '../../../types';
import { BADGE_OPTIONS, STYLE_OPTIONS } from './ProductBasicInfoSection';
import { COLOR_PRESETS } from './ProductPricingVariantsSection';

interface ProductMediaLivePreviewSectionProps {
  imageFiles: File[];
  isDragging: boolean;
  setIsDragging: (val: boolean) => void;
  onFilesAdded: (files: FileList | null) => void;
  onRemoveImage: (index: number) => void;
  onMoveImage: (index: number, direction: 'left' | 'right') => void;
  onSetAsPrimary: (index: number) => void;
  // Preview props
  title: string;
  brandName: string;
  categoryName: string;
  subcategoryName: string;
  style: ProductStyle;
  price: string;
  compareAtPrice: string;
  badge: ProductBadge;
  selectedColors: string[];
  selectedSizes: string[];
  totalCalculatedStock: number;
}

export function ProductMediaLivePreviewSection({
  imageFiles,
  isDragging,
  setIsDragging,
  onFilesAdded,
  onRemoveImage,
  onMoveImage,
  onSetAsPrimary,
  title,
  brandName,
  categoryName,
  subcategoryName,
  style,
  price,
  compareAtPrice,
  badge,
  selectedColors,
  selectedSizes,
  totalCalculatedStock
}: ProductMediaLivePreviewSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedBadgeObj = BADGE_OPTIONS.find((b) => b.id === badge && b.id !== 'none');
  const selectedStyleObj = STYLE_OPTIONS.find((s) => s.id === style);

  const parsedPrice = parseFloat(price) || 0;
  const parsedCompare = parseFloat(compareAtPrice) || 0;
  const hasDiscount = parsedCompare > parsedPrice && parsedPrice > 0;
  const discountPct = hasDiscount ? Math.round(((parsedCompare - parsedPrice) / parsedCompare) * 100) : 0;

  const primaryImagePreviewUrl = imageFiles.length > 0 ? URL.createObjectURL(imageFiles[0]) : null;

  return (
    <div className="space-y-6">
      {/* 1. Media Upload Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <ImageIcon className="w-4 h-4 text-blue-600" />
          <span>صور المنتج (Product Gallery) <span className="text-rose-500">*</span></span>
        </h3>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            onFilesAdded(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-600 bg-blue-50/50 scale-[0.99]'
              : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => onFilesAdded(e.target.files)}
          />

          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3">
            <UploadCloud className="w-7 h-7" />
          </div>

          <p className="text-sm font-bold text-gray-800">
            اسحب الصور وأفلتها هنا، أو <span className="text-blue-600 underline">تصفح ملفاتك</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            يدعم صور JPG, PNG, WEBP بدقة عالية (الصورة الأولى ستكون الغلاف الأساسي)
          </p>
        </div>

        {/* Thumbnails Gallery & Ordering */}
        {imageFiles.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
              <span>الصور المرفوعة ({imageFiles.length}):</span>
              <span className="text-[11px] text-blue-600">يمكنك تبديل ترتيب الصور أو تعيين الصورة الأولى كغلاف</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {imageFiles.map((file, idx) => {
                const previewUrl = URL.createObjectURL(file);
                const isPrimary = idx === 0;

                return (
                  <div
                    key={idx}
                    className={`relative rounded-xl overflow-hidden border bg-gray-50 group transition-all ${
                      isPrimary ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-200'
                    }`}
                  >
                    <div className="aspect-square relative">
                      <img
                        src={previewUrl}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Primary Cover Badge */}
                      {isPrimary && (
                        <span className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          <span>الغلاف الرئيسي</span>
                        </span>
                      )}

                      {/* Action Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSetAsPrimary(idx);
                            }}
                            className="p-1.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            title="تعيين كغلاف رئيسي"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveImage(idx, 'left');
                            }}
                            className="p-1.5 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            title="تحريك لليمين"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {idx < imageFiles.length - 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveImage(idx, 'right');
                            }}
                            className="p-1.5 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            title="تحريك لليسار"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveImage(idx);
                          }}
                          className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                          title="حذف الصورة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-1.5 text-[10px] text-gray-500 truncate text-center font-mono">
                      {file.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Live Store Product Card Simulation (معاينة كارت المنتج في المتجر) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span>معاينة كارت المنتج الحي بالمتجر (Live Store Card Preview)</span>
          </h3>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            تحديث حي وتلقائي ⚡
          </span>
        </div>

        <div className="flex justify-center p-4 bg-stone-100/60 rounded-2xl">
          <div className="w-full max-w-[300px] bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200/80 flex flex-col group">
            {/* Card Image Area */}
            <div className="relative aspect-4/5 w-full bg-stone-200 overflow-hidden">
              {primaryImagePreviewUrl ? (
                <img
                  src={primaryImagePreviewUrl}
                  alt={title || 'Product Preview'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2 p-4 text-center">
                  <ImageIcon className="w-10 h-10 stroke-1 text-gray-300" />
                  <span className="text-xs font-semibold">ارفع صورة للمنتج لمعاينتها هنا</span>
                </div>
              )}

              {/* Discount Badge */}
              {hasDiscount && (
                <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-md">
                  -{discountPct}%
                </span>
              )}

              {/* Custom Ribbon Badge */}
              {selectedBadgeObj && (
                <span className={`absolute top-2.5 left-2.5 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm ${selectedBadgeObj.color}`}>
                  {selectedBadgeObj.label.split(' ')[0]}
                </span>
              )}

              {/* Stock Warning if 0 */}
              {totalCalculatedStock === 0 && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                  <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    نفذت الكمية (Out of Stock)
                  </span>
                </div>
              )}
            </div>

            {/* Card Details */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5 text-right" dir="rtl">
              <div>
                {/* Category & Brand Breadcrumb */}
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold mb-1">
                  <span>{brandName}</span>
                  <span>{subcategoryName || categoryName}</span>
                </div>

                {/* Product Title */}
                <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">
                  {title || 'اسم المنتج سيظهر هنا...'}
                </h4>

                {/* Style indicator */}
                {selectedStyleObj && (
                  <span className="inline-block mt-1 text-[10px] text-stone-500 font-semibold bg-stone-100 px-2 py-0.5 rounded-md">
                    {selectedStyleObj.icon} {selectedStyleObj.nameAr}
                  </span>
                )}
              </div>

              {/* Colors Dots */}
              {selectedColors.length > 0 && (
                <div className="flex items-center gap-1 pt-1">
                  {selectedColors.slice(0, 5).map((colName) => {
                    const preset = COLOR_PRESETS.find((c) => c.name === colName);
                    return (
                      <span
                        key={colName}
                        title={colName}
                        className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-2xs"
                        style={{ backgroundColor: preset ? preset.hex : '#888888' }}
                      />
                    );
                  })}
                  {selectedColors.length > 5 && (
                    <span className="text-[10px] text-gray-400 font-bold">
                      +{selectedColors.length - 5}
                    </span>
                  )}
                </div>
              )}

              {/* Price & CTA Button */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-black text-stone-950">
                      {parsedPrice > 0 ? `${parsedPrice} DH` : '-- DH'}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through">
                        {parsedCompare} DH
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="p-2 bg-stone-950 text-white rounded-xl hover:bg-stone-800 transition-colors shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
