import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { Eye, ArrowUpLeft } from 'lucide-react';
import { normalizeProductImageUrl } from '../utils/image';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  key?: string;
  product: Product;
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const { t, isRTL, language } = useLanguage();
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount && product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const totalStock = product.inventory?.reduce((sum, item) => sum + item.stock, 0) || 0;
  const isOutOfStock = totalStock === 0;

  // استخراج المقاسات المتوفرة فقط (التي بها مخزون أكبر من صفر)
  const availableSizes = useMemo(() => {
    if (!product.inventory || product.inventory.length === 0) return [];
    return product.inventory
      .filter(i => i.stock > 0 && i.size && i.size.trim())
      .map(i => i.size.trim());
  }, [product.inventory]);

  const hoverImage = (product.secondaryImage && product.secondaryImage.trim() !== '')
    ? product.secondaryImage
    : (product.images && product.images.length > 1 && product.images[1] && product.images[1].trim() !== '' ? product.images[1] : null);

  return (
    <Link 
      to={`/product/${product.id}`}
      onClick={(e) => {
        // إذا كان نقراً عادياً نستخدم onSelect بدون إعادة تحميل الصفحة
        if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
          e.preventDefault();
          onSelect(product);
        }
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`group rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full relative cursor-pointer active:scale-[0.985] p-2.5 sm:p-3 hover:shadow-lg no-underline ${
        isRTL ? 'text-right' : 'text-left'
      } ${
        isOutOfStock ? 'opacity-80' : ''
      }`}
      style={{
        border: '1px solid #E0E0E0',
        backgroundColor: '#faf8f5', // مطابق لخلفية الموقع الأساسية النظيفة بدلاً من الأبيض الصريح
      }}
    >
      {/* 1. حاوية الصورة (Image Container): محددة بلون خلفية أبيض ناصع مع زوايا منحنية ناعمة */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white border border-[#ece7e1] flex items-center justify-center p-3 sm:p-4 shadow-2xs group-hover:border-stone-300 transition-colors">
        
        {/* Top Badges inside the white container */}
        <div className={`absolute top-2.5 ${isRTL ? 'right-2.5' : 'left-2.5'} z-10 flex flex-col gap-1.5 items-start pointer-events-none`}>
          {hasDiscount && !isOutOfStock && (
            <span 
              dir="ltr" 
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-stone-950 text-[#f5ecd0] font-black text-[11px] sm:text-xs tracking-tight shadow-md border border-[#c59a3f]/30 select-none"
            >
              -{discountPercentage}%
            </span>
          )}

          {isOutOfStock && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-stone-800 text-stone-200 font-bold text-[11px] tracking-tight shadow-sm">
              {t.outOfStock}
            </span>
          )}
        </div>

        {/* صورة الحذاء: تظهر نقية داخل الحاوية البيضاء (object-contain لعدم اقتصاص أي تفاصيل) */}
        <img
          src={normalizeProductImageUrl(product.image)}
          alt={product.name}
          className={`max-w-full max-h-full object-contain block transition-transform duration-500 will-change-transform mix-blend-multiply ${
            hoverImage ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
          } ${isOutOfStock ? 'grayscale opacity-60 contrast-90' : ''}`}
        />

        {/* Secondary Image on Hover */}
        {hoverImage && (
          <img
            src={normalizeProductImageUrl(hoverImage)}
            alt={`${product.name} - secondary preview`}
            className={`absolute inset-0 max-w-full max-h-full m-auto p-3 sm:p-4 object-contain transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105 pointer-events-none will-change-transform mix-blend-multiply ${
              isOutOfStock ? 'grayscale opacity-0 group-hover:opacity-60 contrast-90' : ''
            }`}
          />
        )}
        
        {/* Desktop Quick Look Overlay */}
        <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center pointer-events-none rounded-xl">
          <span className="bg-stone-950/90 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200 border border-white/15">
            <Eye className="w-3.5 h-3.5 text-[#e5be6b]" />
            <span>{t.viewDetailsAndSizes}</span>
          </span>
        </div>
      </div>

      {/* 2. قسم النص والزر: بخلفية مطابقة لخلفية البطاقة الأساسية النظيفة (شفافة/منسجمة) وليست بيضاء بالكامل */}
      <div className="pt-3 px-1 pb-1 flex flex-col flex-1 justify-between bg-transparent">
        <div>
          {/* Product Category */}
          {product.category && (
            <div className="mb-1 text-[11px] font-semibold text-stone-500 tracking-wider uppercase">
              {product.category === 'clothes' ? t.navClothes : product.category === 'shoes' ? t.navShoes : t.navAccessories}
            </div>
          )}

          {/* Product Title */}
          <h3 
            className={`text-[13.5px] sm:text-[15px] font-semibold leading-snug line-clamp-2 min-h-[2.4rem] transition-colors group-hover:text-stone-950 ${
              isOutOfStock ? 'text-stone-400' : 'text-stone-800'
            }`}
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-2 flex items-baseline justify-start gap-2 flex-wrap tabular-nums">
            <span className={`text-base sm:text-lg font-black tracking-tight ${isOutOfStock ? 'text-stone-400' : 'text-black'}`}>
              {product.price} <span className="text-xs sm:text-sm font-bold text-stone-700">{t.currency}</span>
            </span>
            {hasDiscount && (
              <span className={`text-xs sm:text-sm line-through font-semibold ${isOutOfStock ? 'text-stone-300' : 'text-stone-400'}`}>
                {product.originalPrice} {t.currency}
              </span>
            )}
          </div>

          {/* شارات المقاسات المتوفرة بالمخزون حالياً فقط */}
          {!isOutOfStock && availableSizes.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                {language === 'ar' ? 'المقاسات:' : 'Sizes:'}
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                {availableSizes.slice(0, 4).map(size => (
                  <span
                    key={size}
                    className="px-1.5 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-900 font-bold text-[10px] tracking-tight"
                  >
                    {size}
                  </span>
                ))}
                {availableSizes.length > 4 && (
                  <span className="text-[10px] font-bold text-stone-500">
                    +{availableSizes.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* تنبيه بالكمية المحدودة إذا تبقى قطعة أو قطعتين فقط */}
          {!isOutOfStock && totalStock > 0 && totalStock <= 2 && (
            <div className="mt-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-amber-800">
                {language === 'ar' 
                  ? (totalStock === 1 ? 'بقي قطعة واحدة فقط!' : 'بقي قطعتان فقط!')
                  : `Only ${totalStock} left in stock!`}
              </span>
            </div>
          )}
        </div>

        {/* 3. زر التفاعل: بخلفية سوداء بالكامل ونص أبيض مع توزيع مريح وهوامش مناسبة */}
        <div className="mt-3.5 pt-2.5 border-t border-stone-200/60">
          <div className="w-full h-11 px-4 rounded-xl bg-black text-white hover:bg-stone-900 transition-all duration-200 flex items-center justify-between text-xs sm:text-sm font-bold shadow-md hover:shadow-lg border border-black active:scale-[0.99]">
            <span className="truncate tracking-wide">{isOutOfStock ? t.requestStockAlert : t.viewDetailsAndSizes}</span>
            <div className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 mx-1">
              <ArrowUpLeft className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110 ${isRTL ? '' : 'rotate-90'}`} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
