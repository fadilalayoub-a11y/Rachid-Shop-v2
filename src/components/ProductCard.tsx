import { Product } from '../types';
import { Eye, ArrowUpLeft } from 'lucide-react';

interface ProductCardProps {
  key?: string;
  product: Product;
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount && product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const totalStock = product.inventory?.reduce((sum, item) => sum + item.stock, 0) || 0;
  const isOutOfStock = totalStock === 0;

  return (
    <div 
      onClick={() => onSelect(product)}
      className={`group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-gray-100/90 flex flex-col h-full relative cursor-pointer active:scale-[0.98] ${
        isOutOfStock ? 'bg-gray-50/70 border-gray-200/60' : ''
      }`}
    >
      {/* Discount Badge */}
      {hasDiscount && !isOutOfStock && (
        <div className="absolute top-3 right-3 z-10 bg-gray-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
          -{discountPercentage}%
        </div>
      )}

      {/* Out of Stock Badge */}
      {isOutOfStock && (
        <div className="absolute top-3 right-3 z-10 bg-gray-800 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-sm backdrop-blur-xs">
          نفدت الكمية
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105 ${
            isOutOfStock ? 'grayscale opacity-60 contrast-90' : ''
          }`}
        />
        
        {/* Hover quick action overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <span className="bg-white/95 text-gray-900 text-xs font-bold px-3.5 py-2 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 duration-200">
            <Eye className="w-4 h-4 text-gray-700" />
            <span>عرض التفاصيل والمقاسات</span>
          </span>
        </div>
      </div>

      {/* Clean Minimal Info */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          <h3 
            className={`text-sm sm:text-base font-bold leading-snug line-clamp-1 group-hover:text-gray-900 transition-colors ${
              isOutOfStock ? 'text-gray-500' : 'text-gray-900'
            }`}
            title={product.name}
          >
            {product.name}
          </h3>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-2">
              <span className={`text-base font-extrabold ${isOutOfStock ? 'text-gray-400' : 'text-gray-900'}`}>
                {product.price} درهم
              </span>
              {hasDiscount && (
                <span className={`text-xs line-through ${isOutOfStock ? 'text-gray-300' : 'text-gray-400'}`}>
                  {product.originalPrice} درهم
                </span>
              )}
            </div>

            {/* Subtle natural stock count */}
            {!isOutOfStock && totalStock > 0 && totalStock <= 5 && (
              <span className="text-[11px] text-gray-400 font-normal">
                باقي {totalStock} فقط
              </span>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-xs font-medium text-gray-600 mt-2">
          <span>
            {isOutOfStock ? 'طلب إشعار عند التوفر' : 'عرض الخيارات والمقاسات'}
          </span>
          <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-gray-900 group-hover:text-white flex items-center justify-center transition-colors text-gray-500">
            <ArrowUpLeft className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
