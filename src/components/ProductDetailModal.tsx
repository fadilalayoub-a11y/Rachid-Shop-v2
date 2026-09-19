import { useState } from 'react';
import { Product } from '../types';
import { ArrowRight, ShoppingCart, Bell, CheckCircle2, ZoomIn, ShieldCheck, Truck, X } from 'lucide-react';
import { NotifyMeModal } from './NotifyMeModal';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  if (!isOpen || !product) return null;

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount && product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const totalStock = product.inventory?.reduce((sum, item) => sum + item.stock, 0) || 0;
  const isOutOfStock = totalStock === 0;

  const selectedInventory = product.inventory?.find(item => item.size === selectedSize);
  const canAddToCart = !product.inventory?.length || (selectedSize !== '' && selectedInventory && selectedInventory.stock > 0);

  const handleAdd = () => {
    if (!canAddToCart) return;
    onAddToCart(product, selectedSize);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      onClose();
    }, 450);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <div 
          className="relative bg-white w-full sm:max-w-3xl md:max-w-4xl max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300"
          role="dialog"
          aria-modal="true"
        >
          {/* Header Bar */}
          <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-100 bg-white/95 backdrop-blur-xs z-20">
            <button
              onClick={onClose}
              className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors p-1"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للتسوق</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 overscroll-contain">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-6">
              
              {/* Product Image Section */}
              <div className="relative bg-gray-50 p-4 sm:p-6 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-l border-gray-100">
                {hasDiscount && !isOutOfStock && (
                  <div className="absolute top-4 right-4 z-10 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm">
                    خصم {discountPercentage}%
                  </div>
                )}

                {isOutOfStock && (
                  <div className="absolute top-4 right-4 z-10 bg-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm">
                    نفدت الكمية
                  </div>
                )}

                <div 
                  className="relative w-full aspect-square sm:aspect-auto sm:h-[420px] rounded-2xl overflow-hidden cursor-zoom-in group shadow-xs bg-white"
                  onClick={() => setIsZoomed(true)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${
                      isOutOfStock ? 'grayscale opacity-60' : ''
                    }`}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                    <span className="bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 backdrop-blur-xs">
                      <ZoomIn className="w-4 h-4" />
                      تكبير الصورة
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Details Section */}
              <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                      {product.name}
                    </h1>
                    
                    {/* Price */}
                    <div className="flex items-baseline gap-3 mt-2">
                      <span className={`text-2xl sm:text-3xl font-extrabold ${isOutOfStock ? 'text-gray-400' : 'text-gray-900'}`}>
                        {product.price} درهم
                      </span>
                      {hasDiscount && (
                        <span className="text-base sm:text-lg text-gray-400 line-through">
                          {product.originalPrice} درهم
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="pt-2 border-t border-gray-100">
                    <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">الوصف</h2>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {product.description || 'قطعة مختارة بعناية تتميز بأعلى معايير الجودة والتصميم العصري المريح.'}
                    </p>
                  </div>

                  {/* Available Sizes */}
                  {product.inventory && product.inventory.length > 0 && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">المقاس:</span>
                        {selectedSize && selectedInventory && (
                          <span className="text-xs text-gray-500 font-normal">
                            {selectedInventory.stock > 0 
                              ? (selectedInventory.stock <= 4 ? `متوفر ${selectedInventory.stock} قطع فقط` : 'متوفر') 
                              : 'غير متوفر'}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {product.inventory.map((inv, idx) => {
                          const isSelected = selectedSize === inv.size;
                          const isAvailable = inv.stock > 0;

                          return (
                            <button
                              key={idx}
                              onClick={() => isAvailable && setSelectedSize(inv.size)}
                              disabled={!isAvailable}
                              className={`
                                min-h-[44px] min-w-[50px] px-3.5 py-2 rounded-xl text-sm font-medium border transition-all duration-150 flex items-center justify-center
                                ${isSelected
                                  ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                                  : isAvailable
                                    ? 'bg-white text-gray-800 border-gray-200 hover:border-gray-400 hover:bg-gray-50 active:scale-95'
                                    : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through'}
                              `}
                            >
                              <span>{inv.size}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                      <ShieldCheck className="w-4 h-4 text-gray-600 shrink-0" />
                      <span className="text-xs text-gray-700 font-normal">ضمان الجودة 100%</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                      <Truck className="w-4 h-4 text-gray-600 shrink-0" />
                      <span className="text-xs text-gray-700 font-normal">توصيل سريع</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Action Buttons (Inside details column) */}
                <div className="hidden sm:block space-y-2 pt-4 border-t border-gray-100">
                  {addedToast && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-sm font-medium flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تمت إضافة المنتج إلى السلة بنجاح!</span>
                    </div>
                  )}

                  {isOutOfStock ? (
                    <button
                      onClick={() => setIsNotifyModalOpen(true)}
                      className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200 font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all"
                    >
                      <Bell className="w-4 h-4 text-gray-600" />
                      <span>أعلمني عند التوفر</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleAdd}
                      disabled={!canAddToCart}
                      className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>
                        {!selectedSize && product.inventory?.length 
                          ? 'يرجى اختيار المقاس' 
                          : 'إضافة إلى السلة'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Bottom Bar (Always Sticky & Accessible at the bottom of the screen) */}
          <div className="sm:hidden shrink-0 bg-white border-t border-gray-200 px-4 py-3 z-30">
            {addedToast && (
              <div className="mb-2 p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>تمت إضافة المنتج إلى السلة بنجاح!</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <span className="block text-[11px] text-gray-400 font-normal">السعر:</span>
                <span className="text-lg font-bold text-gray-900 leading-none">{product.price} درهم</span>
              </div>

              {isOutOfStock ? (
                <button
                  onClick={() => setIsNotifyModalOpen(true)}
                  className="flex-1 bg-gray-100 text-gray-800 hover:bg-gray-200 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all"
                >
                  <Bell className="w-4 h-4 text-gray-600" />
                  <span>أعلمني عند التوفر</span>
                </button>
              ) : (
                <button
                  onClick={handleAdd}
                  disabled={!canAddToCart}
                  className="flex-1 bg-gray-900 hover:bg-black text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    {!selectedSize && product.inventory?.length 
                      ? 'اختر المقاس' 
                      : 'إضافة للسلة'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full screen image zoom */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/95 p-4 cursor-zoom-out backdrop-blur-md"
          onClick={() => setIsZoomed(false)}
        >
          <img
            src={product.image}
            alt={product.name}
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

      {/* Waitlist Modal */}
      <NotifyMeModal
        product={product}
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
      />
    </>
  );
}
