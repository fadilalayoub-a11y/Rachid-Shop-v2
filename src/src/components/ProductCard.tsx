import { Link } from 'react-router-dom';
import { Product } from '../types';
import { normalizeProductImageUrl } from '../utils/image';
import { useLanguage } from '../context/LanguageContext';
import { ArrowUpLeft, ArrowLeft, ArrowRight } from 'lucide-react';

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

  const hoverImage = (product.secondaryImage && product.secondaryImage.trim() !== '')
    ? product.secondaryImage
    : (product.images && product.images.length > 1 && product.images[1] && product.images[1].trim() !== '' ? product.images[1] : null);

  return (
    <Link 
      to={`/product/${product.id}`}
      onClick={(e) => {
        // استخدام onSelect للتنقل السلس دون وميض
        if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
          e.preventDefault();
          onSelect(product);
        }
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`group flex flex-col h-full relative cursor-pointer no-underline bg-white rounded-2xl border border-stone-200/90 hover:border-stone-400 p-3 sm:p-3.5 shadow-xs hover:shadow-lg transition-all duration-300 active:scale-[0.985] ${
        isOutOfStock ? 'opacity-75' : ''
      }`}
    >
      {/* 1. مساحة الصورة الشفافة والنقية بدون أي صندوق رمادي داخلي */}
      <div className="relative w-full aspect-square bg-transparent flex items-center justify-center overflow-hidden">
        {/* شارة الخصم أو نفاد الكمية */}
        {hasDiscount && !isOutOfStock && (
          <div className={`absolute top-1 ${isRTL ? 'right-1' : 'left-1'} z-10 pointer-events-none`}>
            <span 
              dir="ltr"
              className="inline-flex items-center px-2 py-0.5 rounded-full bg-stone-950 text-[#f5ecd0] font-black text-[10px] tracking-tight shadow-xs border border-stone-800"
            >
              -{discountPercentage}%
            </span>
          </div>
        )}

        {isOutOfStock && (
          <div className={`absolute top-1 ${isRTL ? 'right-1' : 'left-1'} z-10 pointer-events-none`}>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-stone-800 text-stone-200 font-bold text-[10px] tracking-tight shadow-xs">
              {t.outOfStock}
            </span>
          </div>
        )}

        {/* صورة المنتج بحجم كبير يملأ الجزء العلوي بجمالية وبدون ضيق */}
        <img
          src={normalizeProductImageUrl(product.image)}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-contain p-0.5 block transition-all duration-500 will-change-transform mix-blend-multiply ${
            hoverImage ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
          } ${isOutOfStock ? 'grayscale contrast-90' : ''}`}
        />

        {/* صورة بديلة ناعمة تظهر عند التمرير */}
        {hoverImage && (
          <img
            src={normalizeProductImageUrl(hoverImage)}
            alt={`${product.name} - preview`}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-contain p-0.5 transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105 pointer-events-none will-change-transform mix-blend-multiply ${
              isOutOfStock ? 'grayscale contrast-90' : ''
            }`}
          />
        )}
      </div>

      {/* 2. منطقة البيانات والخطوط المتناسقة والمريحة */}
      <div className="pt-3 flex flex-col flex-1 justify-between">
        <div>
          {/* تصنيف المنتج بخط صغير وأنيق */}
          {product.category && (
            <div className={`text-[10px] font-semibold text-stone-600 uppercase tracking-wider mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              {product.category === 'clothes' ? t.navClothes : product.category === 'shoes' ? t.navShoes : t.navAccessories}
            </div>
          )}

          {/* اسم المنتج بخط ناصع ومتقن */}
          <h3 
            className={`text-[13px] sm:text-[14px] font-bold text-stone-900 group-hover:text-black leading-snug line-clamp-1 transition-colors ${
              isRTL ? 'text-right' : 'text-left'
            }`}
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* 3. السعر ورابط النص الأنيق (View Details →) */}
        <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between gap-1">
          {/* السعر البارز */}
          <div className="flex items-baseline gap-1.5 tabular-nums flex-wrap">
            <span className="text-[13.5px] sm:text-[15px] font-black text-stone-950">
              {product.price} <span className="text-[10px] sm:text-xs font-bold text-stone-600">{t.currency}</span>
            </span>
            {hasDiscount && (
              <span className="text-[10.5px] sm:text-[11.5px] text-stone-400 line-through">
                {product.originalPrice} {t.currency}
              </span>
            )}
          </div>

          {/* رابط الإجراء الأنيق: View Details → */}
          <div className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-stone-600 group-hover:text-stone-950 transition-all duration-200">
            <span className="hidden xs:inline">{language === 'ar' ? 'التفاصيل' : 'View Details'}</span>
            {isRTL ? (
              <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}


