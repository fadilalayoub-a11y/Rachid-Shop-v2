import { useState, FormEvent, useRef } from 'react';
import { CartItem } from '../types';
import { X, CheckCircle2, ShoppingBag, Phone, MapPin, User, AlertCircle } from 'lucide-react';
import { normalizeProductImageUrl } from '../utils/image';
import { useLanguage } from '../context/LanguageContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderSuccess: () => void;
}

// دالة لتنقية المدخلات من أي أكواد خبيثة (XSS Sanitization)
const sanitizeInput = (input: string) => {
  if (!input) return '';
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
};

// دالة للتحقق من صحة رقم الهاتف (التنسيق المغربي كمثال أو أرقام فقط)
const isValidPhone = (phone: string) => {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // يقبل الأرقام التي تبدأ بـ 05, 06, 07 أو +212 وتتكون من 10 أرقام تقريباً
  return /^(?:(?:(?:\+|00)212)|0)[5-7]\d{8}$/.test(cleaned) || /^[0-9]{8,15}$/.test(cleaned);
};

export function CheckoutModal({ isOpen, onClose, cartItems, onOrderSuccess }: CheckoutModalProps) {
  const { t, isRTL } = useLanguage();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [finalTotal, setFinalTotal] = useState(0);

  // مرجع للتحكم في الإرسال المتكرر (Debounce/Throttling)
  const lastSubmitTime = useRef<number>(0);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isOpen) return null;

  const handleSubmitOrder = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // الحماية من الإرسال المتكرر السريع
    const now = Date.now();
    if (now - lastSubmitTime.current < 5000) {
      setError(t.orderThrottleError);
      return;
    }

    // تنقية البيانات المدخلة
    const cleanName = sanitizeInput(customerName);
    const cleanPhone = sanitizeInput(customerPhone);
    const cleanCity = sanitizeInput(customerCity);
    const cleanAddress = sanitizeInput(customerAddress);

    if (!cleanName || !cleanPhone || !cleanCity) {
      setError(t.requiredFieldsError);
      return;
    }

    if (!isValidPhone(cleanPhone)) {
      setError(t.invalidPhoneError);
      return;
    }

    setIsSubmitting(true);
    lastSubmitTime.current = now;

    try {
      // 1. تجهيز البيانات لإرسالها إلى سيرفر المتجر
      const orderPayload = {
        customerName: cleanName,
        customerPhone: cleanPhone,
        customerCity: cleanCity,
        customerAddress: cleanAddress || (isRTL ? 'غير محدد' : 'Not specified'),
        totalAmount,
        cartItems
      };

      // 2. إرسال الطلب إلى الخادم الخلفي (Server-Side)
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || (isRTL ? 'فشل إتمام الطلب، قد يكون المخزون نفد لبعض المنتجات.' : 'Failed to place order. Some items may be out of stock.'));
      }
      
      // 3. إظهار شاشة النجاح الاحترافية للعميل داخل المتجر
      setFinalTotal(totalAmount);
      setIsSuccess(true);
      onOrderSuccess();
      
    } catch (err: any) {
      console.error('Error placing order:', err);
      setError(err.message || t.requiredFieldsError);
      // Reset the throttle timer so they can try again if it failed
      lastSubmitTime.current = 0;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSuccess) {
      setIsSuccess(false);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerCity('');
      setCustomerAddress('');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t.checkoutTitle}</h2>
              <p className="text-xs text-gray-500">{t.checkoutSubtitle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{t.orderSuccessTitle}</h3>
              <p className="text-gray-600 text-sm max-w-sm mx-auto leading-relaxed">
                {t.orderSuccessDesc} <span className="font-bold text-gray-900" dir="ltr">{customerPhone}</span>.
              </p>
              <div className="bg-gray-50 p-4 rounded-2xl text-start text-sm space-y-2 border border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>{t.cityLabel}:</span>
                  <span className="font-semibold text-gray-900">{customerCity}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t.checkoutTotalLabel}</span>
                  <span className="font-bold text-blue-600 text-base">{finalTotal} {t.currency}</span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-bold hover:bg-gray-800 transition-colors cursor-pointer"
              >
                {t.backToShopping}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {/* Items Summary Preview */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
                  <span>{t.orderSummaryTitle} ({cartItems.length})</span>
                  <span className="text-blue-600 font-bold text-base">{totalAmount} {t.currency}</span>
                </div>
                <div className="max-h-36 overflow-y-auto divide-y divide-gray-200/60 pr-1 space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.cartItemId} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 shrink-0 flex items-center justify-center p-0.5 overflow-hidden">
                          <img src={normalizeProductImageUrl(item.image)} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                          <p className="text-gray-500">
                            {item.selectedSize ? `${t.sizeLabel} ${item.selectedSize} | ` : ''}{t.quantity}: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900 shrink-0">{item.price * item.quantity} {t.currency}</span>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2 border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Customer Inputs */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  {t.customerNameLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t.customerNamePlaceholder}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {t.phoneLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={t.phonePlaceholder}
                  dir="ltr"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-start"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {t.cityLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    placeholder={t.cityPlaceholder}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {t.addressLabel}
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder={t.addressPlaceholder}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-4 rounded-xl font-bold text-base transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {isSubmitting ? t.submittingOrder : `${t.confirmOrderBtn} (${totalAmount} ${t.currency})`}
                </button>
                <p className="text-[11px] text-gray-400 text-center mt-2">
                  {t.cashOnDeliveryNotice}
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
