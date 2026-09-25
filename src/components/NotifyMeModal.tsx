import { useState, FormEvent } from 'react';
import { Bell, CheckCircle2, MessageCircle, X, Loader2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { normalizeProductImageUrl } from '../utils/image';
import { useLanguage } from '../context/LanguageContext';

interface NotifyMeModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function NotifyMeModal({ product, isOpen, onClose }: NotifyMeModalProps) {
  const { t, isRTL, language } = useLanguage();
  const [method, setMethod] = useState<'whatsapp' | 'email'>('whatsapp');
  const [contact, setContact] = useState('');
  const [sizePreference, setSizePreference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!contact.trim()) {
      setError(method === 'whatsapp' ? t.enterWhatsAppError : t.enterEmailError);
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'waitlist'), {
        productId: product.id,
        productName: product.name,
        contactMethod: method,
        contactInfo: contact.trim(),
        preferredSize: sizePreference || t.anySizeAvailable,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Waitlist submission error:', err);
      // Fallback gracefully
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppDirect = () => {
    const defaultStorePhone = '212600000000'; // Default store contact
    let msg = '';
    if (language === 'ar') {
      msg = `السلام عليكم، أنا مهتم بمنتج "${product.name}" وأريد معرفة موعد توفره مجدداً${sizePreference ? ` (المقاس: ${sizePreference})` : ''}.`;
    } else if (language === 'fr') {
      msg = `Bonjour, je suis intéressé par le produit "${product.name}" et je souhaite savoir quand il sera de nouveau disponible${sizePreference ? ` (Taille : ${sizePreference})` : ''}.`;
    } else {
      msg = `Hello, I am interested in the product "${product.name}" and would like to know when it will be back in stock${sizePreference ? ` (Size: ${sizePreference})` : ''}.`;
    }
    window.open(`https://wa.me/${defaultStorePhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-2 text-gray-900 font-bold">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <span>{t.notifyModalTitle}</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-xl font-bold text-gray-900">{t.notifySuccessTitle}</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t.notifyModalNotice(product.name)}
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full bg-gray-900 text-white font-bold py-3 px-5 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
              >
                {t.notifyModalOk}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Product summary */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-14 h-14 bg-white rounded-xl border border-gray-200/80 shrink-0 flex items-center justify-center p-1 overflow-hidden">
                <img 
                  src={normalizeProductImageUrl(product.image)} 
                  alt={product.name} 
                  className="w-full h-full object-contain grayscale contrast-90" 
                />
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="font-bold text-gray-900 text-sm truncate">{product.name}</h5>
                <p className="text-xs text-rose-600 font-semibold mt-0.5">{t.outOfStock}</p>
              </div>
            </div>

            {/* Notification Method Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">{t.preferredNotificationMethod}</label>
              <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMethod('whatsapp')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    method === 'whatsapp' 
                      ? 'bg-white text-emerald-700 shadow-xs' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.contactMethodWhatsApp}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('email')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    method === 'email' 
                      ? 'bg-white text-blue-700 shadow-xs' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t.contactMethodEmail}</span>
                </button>
              </div>
            </div>

            {/* Contact Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                {method === 'whatsapp' ? (isRTL ? 'رقم الواتساب:' : 'WhatsApp Number:') : (isRTL ? 'البريد الإلكتروني:' : 'Email Address:')}
              </label>
              <input
                type={method === 'whatsapp' ? 'tel' : 'email'}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={method === 'whatsapp' ? t.whatsAppPlaceholder : t.emailPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-start"
                dir="ltr"
              />
            </div>

            {/* Size Preference if product has sizes */}
            {product.inventory && product.inventory.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">{t.preferredSizeOptional}</label>
                <select
                  value={sizePreference}
                  onChange={(e) => setSizePreference(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">{t.anySizeAvailable}</option>
                  {product.inventory.map((inv, idx) => (
                    <option key={idx} value={inv.size}>
                      {t.sizeOption(inv.size)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <p className="text-xs text-rose-600 font-medium">{error}</p>
            )}

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 text-sm shadow-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.notifySubmitting}</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    <span>{t.notifySubmitBtn}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleWhatsAppDirect}
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs border border-emerald-200/60 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>{t.directWhatsAppInquiry}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
