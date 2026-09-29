import { Truck, RotateCcw, ShieldCheck, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function TrustGuaranteesBar() {
  const { language } = useLanguage();

  const guarantees = [
    {
      icon: Truck,
      title: language === 'ar' ? 'توصيل سريع لجميع المدن' : language === 'fr' ? 'Livraison Rapide Partout' : 'Fast Nationwide Delivery',
      desc: language === 'ar' ? 'الدفع عند الاستلام كاش' : language === 'fr' ? 'Paiement à la livraison (COD)' : 'Cash on Delivery to your doorstep',
      color: 'text-amber-600 bg-amber-50',
    },
    {
      icon: RotateCcw,
      title: language === 'ar' ? 'القياس والاستبدال مضمون' : language === 'fr' ? 'Échange & Taille Facile' : 'Hassle-Free Size Exchange',
      desc: language === 'ar' ? 'إمكانية المعاينة قبل الدفع' : language === 'fr' ? 'Vérifiez avant de payer' : 'Try on and verify before payment',
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      icon: ShieldCheck,
      title: language === 'ar' ? 'جودة وخامات أصلية 100%' : language === 'fr' ? 'Qualité 100% Garantie' : '100% Premium Quality',
      desc: language === 'ar' ? 'أقمشة وتفنيش عالي الدقة' : language === 'fr' ? 'Matières nobles sélectionnées' : 'Handpicked high-grade fabrics',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      icon: MessageCircle,
      title: language === 'ar' ? 'استشارة ومساعدة مباشرة' : language === 'fr' ? 'Service Client WhatsApp' : 'Direct WhatsApp Support',
      desc: language === 'ar' ? 'فريقنا رهن إشارتك لأي قياس' : language === 'fr' ? 'Conseils tailles et assistance' : 'Instant sizing advice & assistance',
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="bg-stone-50 rounded-2xl sm:rounded-3xl border border-stone-200/80 p-4 sm:p-6 shadow-2xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {guarantees.map((g, idx) => {
            const Icon = g.icon;
            return (
              <div key={idx} className="flex items-center gap-3 sm:gap-3.5">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${g.color} shadow-xs`}>
                  <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-stone-900 leading-tight">
                    {g.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-stone-500 font-medium mt-0.5">
                    {g.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
