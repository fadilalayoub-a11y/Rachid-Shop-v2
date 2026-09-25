import { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { ArrowRight, ArrowLeft, ShoppingCart, Bell, CheckCircle2, ZoomIn, ShieldCheck, Truck, X, Share2, Check } from 'lucide-react';
import { NotifyMeModal } from './NotifyMeModal';
import { normalizeProductImageUrl } from '../utils/image';
import { useLanguage } from '../context/LanguageContext';

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
  const { t, isRTL } = useLanguage();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImage, setActiveImage] = useState<string>(product?.image || '');
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShareProduct = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || 'RACHID SHOP',
          text: `اكتشف ${product?.name} في متجر رشيد`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled or unsupported, fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const currentProductIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!product) {
      currentProductIdRef.current = null;
      setActiveImage('');
      setSelectedSize('');
      return;
    }

    // إذا تغير المنتج نفسه إلى منتج آخر جديد تماماً
    if (currentProductIdRef.current !== product.id) {
      currentProductIdRef.current = product.id;
      setActiveImage(product.image || '');
      const firstAvailable = product.inventory?.find(i => i.stock > 0)?.size || '';
      setSelectedSize(firstAvailable);
    } else {
      // إذا كان نفس المنتج وتم وصول بيانات إضافية (مثل مصفوفة المقاسات أو المعرض)
      if (!activeImage && product.image) {
        setActiveImage(product.image);
      }
      if (selectedSize && product.inventory) {
        const currentInv = product.inventory.find(i => i.size === selectedSize);
        if (!currentInv || currentInv.stock === 0) {
          const fallback = product.inventory.find(i => i.stock > 0)?.size || '';
          setSelectedSize(fallback);
        }
      } else if (!selectedSize && product.inventory && product.inventory.length > 0) {
        const fallback = product.inventory.find(i => i.stock > 0)?.size || '';
        if (fallback) setSelectedSize(fallback);
      }
    }
  }, [product, activeImage, selectedSize]);

  if (!isOpen || !product) return null;

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount && product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const totalStock = product.inventory?.reduce((sum, item) => sum + item.stock, 0) || 0;
  const isOutOfStock = totalStock === 0;

  const allImages: string[] = [];
  if (product.image && product.image.trim() !== '') allImages.push(product.image.trim());
  if (product.secondaryImage && product.secondaryImage.trim() !== '' && !allImages.includes(product.secondaryImage.trim())) {
    allImages.push(product.secondaryImage.trim());
  }
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach(img => {
      if (img && typeof img === 'string' && img.trim() !== '' && !allImages.includes(img.trim())) {
        allImages.push(img.trim());
      }
    });
  }


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
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header Bar */}
          <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-100 bg-white/95 backdrop-blur-xs z-20">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors p-1 cursor-pointer"
            >
              {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{t.backToShopping}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShareProduct}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-all cursor-pointer active:scale-95 border border-stone-200"
                title="مشاركة رابط المنتج"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">تم نسخ الرابط!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>مشاركة الرابط</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                aria-label={t.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 overscroll-contain">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-6">
              
              {/* Product Image Section */}
              <div className={`relative bg-gray-50 p-4 sm:p-6 flex flex-col items-center justify-center border-b sm:border-b-0 ${isRTL ? 'sm:border-l' : 'sm:border-r'} border-gray-100`}>
                {hasDiscount && !isOutOfStock && (
                  <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} z-10 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm`}>
                    {t.discountOff(discountPercentage)}
                  </div>
                )}

                {isOutOfStock && (
                  <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} z-10 bg-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm`}>
                    {t.outOfStock}
                  </div>
                )}

                <div 
                  className="relative w-full aspect-square sm:aspect-auto sm:h-[420px] rounded-2xl overflow-hidden cursor-zoom-in group shadow-xs bg-white"
                  onClick={() => setIsZoomed(true)}
                >
                  <img
                    src={normalizeProductImageUrl(activeImage)}
                    alt={product.name}
                    className={`w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105 ${
                      isOutOfStock ? 'grayscale opacity-60' : ''
                    }`}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                    <span className="bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 backdrop-blur-xs">
                      <ZoomIn className="w-4 h-4" />
                      {t.zoomImage}
                    </span>
                  </div>
                </div>

                {/* Thumbnails if multiple images exist */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 mt-3 justify-center overflow-x-auto py-1 max-w-full min-h-[64px] animate-in fade-in duration-300">
                    {allImages.map((imgUrl, index) => (
                      <button
                        key={`${imgUrl}-${index}`}
                        type="button"
                        onClick={() => setActiveImage(imgUrl)}
                        className={`w-14 h-14 rounded-xl border-2 overflow-hidden bg-white p-1 transition-all shrink-0 cursor-pointer ${
                          activeImage === imgUrl ? 'border-gray-900 shadow-xs' : 'border-gray-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={normalizeProductImageUrl(imgUrl)}
                          alt={`${product.name} - ${index + 1}`}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details Section */}
              <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                      {product.name}
                    </h1>
                    
                    {/* Price */}
                    <div className="flex items-baseline gap-3 mt-2 flex-wrap">
                      <span className={`text-2xl sm:text-3xl font-extrabold ${isOutOfStock ? 'text-gray-400' : 'text-gray-900'}`}>
                        {product.price} {t.currency}
                      </span>
                      {hasDiscount && (
                        <span className="text-base sm:text-lg text-gray-400 line-through">
                          {product.originalPrice} {t.currency}
                        </span>
                      )}
                      {!isOutOfStock && totalStock > 0 && totalStock <= 3 && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 font-bold text-xs shadow-2xs">
                          {t.remainingStock(totalStock)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="pt-2 border-t border-gray-100">
                    <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">{t.descriptionTitle}</h2>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {product.description || t.defaultProductDescription}
                    </p>
                  </div>

                  {/* Available Sizes */}
                  {product.inventory && product.inventory.length > 0 && (
                    <div className="pt-3 border-t border-gray-100 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">{t.sizeLabel}</span>
                        {selectedSize && selectedInventory && (
                          <span className="text-xs text-gray-500 font-normal">
                            {selectedInventory.stock > 0 
                              ? (selectedInventory.stock <= 4 ? t.remainingStock(selectedInventory.stock) : t.inStock) 
                              : t.outOfStock}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {product.inventory.map((inv) => {
                          const isSelected = selectedSize === inv.size;
                          const isAvailable = inv.stock > 0;

                          return (
                            <button
                              key={inv.size}
                              type="button"
                              onClick={() => isAvailable && setSelectedSize(inv.size)}
                              disabled={!isAvailable}
                              className={`
                                min-h-[44px] min-w-[50px] px-3.5 py-2 rounded-xl text-sm font-medium border transition-all duration-150 flex items-center justify-center cursor-pointer select-none
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
                      <span className="text-xs text-gray-700 font-normal">{t.guaranteedQuality}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                      <Truck className="w-4 h-4 text-gray-600 shrink-0" />
                      <span className="text-xs text-gray-700 font-normal">{t.fastShipping}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Action Buttons (Inside details column) */}
                <div className="hidden sm:block space-y-2 pt-4 border-t border-gray-100">
                  {addedToast && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-sm font-medium flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.productAddedToCart}</span>
                    </div>
                  )}

                  {isOutOfStock ? (
                    <button
                      onClick={() => setIsNotifyModalOpen(true)}
                      className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200 font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Bell className="w-4 h-4 text-gray-600" />
                      <span>{t.requestStockAlert}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleAdd}
                      disabled={!canAddToCart}
                      className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>
                        {!selectedSize && product.inventory?.length 
                          ? t.selectSizeFirst 
                          : t.addToCart}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Bottom Bar (Always Sticky & Accessible at the bottom of the screen with min 44px touch button) */}
          <div className="sm:hidden shrink-0 bg-white border-t border-stone-200 px-4 py-3 z-30 shadow-lg">
            {addedToast && (
              <div className="mb-2 p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t.productAddedToCart}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <span className="block text-[11px] text-stone-400 font-medium">{t.priceLabel}</span>
                <span className="text-lg font-black text-stone-950 leading-none">{product.price} {t.currency}</span>
              </div>

              {isOutOfStock ? (
                <button
                  onClick={() => setIsNotifyModalOpen(true)}
                  className="flex-1 min-h-[44px] bg-stone-100 text-stone-800 hover:bg-stone-200 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer active:scale-95"
                >
                  <Bell className="w-4 h-4 text-stone-600" />
                  <span>{t.requestStockAlert}</span>
                </button>
              ) : (
                <button
                  onClick={handleAdd}
                  disabled={!canAddToCart}
                  className="flex-1 min-h-[44px] bg-stone-950 hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-[#e5be6b]" />
                  <span>
                    {!selectedSize && product.inventory?.length 
                      ? t.selectSizeFirst 
                      : t.addToCart}
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
            src={normalizeProductImageUrl(activeImage)}
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
