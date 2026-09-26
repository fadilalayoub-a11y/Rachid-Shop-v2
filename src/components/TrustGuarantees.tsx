import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Headphones,
  CheckCircle2,
} from 'lucide-react';

export function TrustGuarantees() {
  const { language } = useLanguage();

  const isAr = language === 'ar';
  const isFr = language === 'fr';

  const guarantees = [
    {
      icon: ShieldCheck,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/80',
      badge: isAr ? 'أمان تام' : isFr ? '100% Sécurisé' : '100% Safe',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      title: isAr
        ? 'الدفع عند الاستلام مع المعاينة'
        : isFr
        ? 'Paiement à la Livraison'
        : 'Cash on Delivery',
      desc: isAr
        ? 'لا تدفع أي درهم حتى تستلم طلبيتك وتفحص جودة المنتج والمقاس بنفسك.'
        : isFr
        ? 'Inspectez votre colis et vérifiez la taille avant de régler votre commande.'
        : 'Inspect your order and verify the size and quality before paying.',
    },
    {
      icon: Truck,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50/80',
      badge: isAr ? '24 - 48 ساعة' : isFr ? 'Express 24-48h' : '24-48h Express',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-100',
      title: isAr
        ? 'توصيل سريع لكافة مدن المغرب'
        : isFr
        ? 'Livraison Rapide Partout au Maroc'
        : 'Fast Nationwide Delivery',
      desc: isAr
        ? 'شحن سريع ومباشر حتى باب منزلك مع تتبع دقيق وتنسيق هاتفي مع الموزع.'
        : isFr
        ? 'Expédition rapide à domicile dans toutes les villes du Royaume.'
        : 'Direct home delivery across all Moroccan cities with phone coordination.',
    },
    {
      icon: RotateCcw,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50/80',
      badge: isAr ? '7 أيام ضمان' : isFr ? 'Garantie 7 Jours' : '7 Days Guarantee',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-100',
      title: isAr
        ? 'استبدال واسترجاع سهل للمقاس'
        : isFr
        ? 'Échange de Taille Gratuit & Facile'
        : 'Hassle-Free Size Exchange',
      desc: isAr
        ? 'المقاس لم يناسبك؟ نغير لك المقاس مجاناً وبكل سرعة بدون أي تعقيد.'
        : isFr
        ? 'La taille ne vous va pas ? Échange rapide et sans tracas sous 7 jours.'
        : 'Size didn’t fit? We exchange it quickly with zero complications.',
    },
    {
      icon: Sparkles,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50/80',
      badge: isAr ? 'أصلي ومضمون' : isFr ? 'Qualité Premium' : '100% Authentic',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-100',
      title: isAr
        ? 'جودة ممتازة وخامات منتقاة'
        : isFr
        ? 'Qualité Garantie & Authentique'
        : 'Premium Quality Guaranteed',
      desc: isAr
        ? 'نختار خاماتنا بعناية فائقة لضمان المتانة والراحة التامة في كل قطعة.'
        : isFr
        ? 'Des finitions impeccables et des tissus soigneusement sélectionnés.'
        : 'Carefully selected materials ensuring maximum durability and daily comfort.',
    },
  ];

  return (
    <section className="mt-14 sm:mt-20 font-['Cairo',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-3 shadow-[0_2px_8px_rgba(16,185,129,0.08)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {isAr ? 'ضمانات متجر رشيد' : isFr ? 'Les Engagements RACHID SHOP' : 'RACHID SHOP Guarantees'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-snug">
            {isAr
              ? 'تسوق بكل راحة وثقة تامة'
              : isFr
              ? 'Achetez en Toute Sérénité & Confiance'
              : 'Shop with Complete Peace of Mind'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed font-normal">
            {isAr
              ? 'نحرص على تقديم تجربة تسوق آمنة ومريحة ترقى لتوقعاتكم مع أعلى معايير الجودة والخدمة.'
              : isFr
              ? 'Nous garantissons un service irréprochable et un accompagnement complet du clic jusqu’à la livraison.'
              : 'We provide a secure, seamless shopping experience with top-tier service from checkout to delivery.'}
          </p>
        </div>

        {/* 1. Guarantees Grid (Modern Soft Shadow, 16px Radius, Hover Elevation, Cairo Font) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {guarantees.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 sm:p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05),0_2px_6px_-1px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.1),0_4px_12px_-2px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col justify-between group cursor-default"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.03)]`}
                    >
                      <IconComponent className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                    <span className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-extrabold text-stone-900 mb-2 leading-snug group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'مضمون 100%' : isFr ? 'Garanti à 100%' : '100% Guaranteed'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Light & Elegant VIP WhatsApp Assistance Banner (Soft Colors & Official Green) */}
        <div className="mt-6 bg-gradient-to-r from-emerald-50/70 via-white to-teal-50/60 rounded-2xl p-5 sm:p-7 shadow-[0_6px_24px_-4px_rgba(16,185,129,0.08),0_2px_8px_-2px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-5 border border-emerald-100/80">
          <div className="flex items-center gap-4 text-center sm:text-start">
            <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm border border-emerald-200/50">
              <Headphones className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-extrabold text-stone-900 leading-tight">
                {isAr
                  ? 'هل تحتاج مساعدة في اختيار المقاس أو تأكيد الطلب؟'
                  : isFr
                  ? 'Besoin d’aide pour choisir votre taille ou passer commande ?'
                  : 'Need help choosing the right size or placing your order?'}
              </h4>
              <p className="text-xs sm:text-[13px] text-stone-600 mt-1 font-normal leading-relaxed">
                {isAr
                  ? 'فريق خدمة العملاء متواجد على مدار الساعة للرد الفوري ومساعدتك في اختيار ما يناسبك.'
                  : isFr
                  ? 'Notre équipe est joignable 7j/7 sur WhatsApp pour une réponse instantanée.'
                  : 'Our support team is available 7 days a week on WhatsApp for quick assistance.'}
              </p>
            </div>
          </div>

          {/* Official WhatsApp Button with #25D366 and Official SVG Icon */}
          <a
            href="https://wa.me/212600000000?text=Salam%20Rachid%20Shop%2C%20bghit%20nsswel%203la%20chi%20produit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl shadow-[0_4px_14px_rgba(37,211,102,0.35)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.45)] transition-all shrink-0 cursor-pointer"
          >
            {/* Official WhatsApp SVG Icon */}
            <svg
              className="w-5 h-5 fill-current text-white shrink-0"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            <span className="text-white font-bold">{isAr ? 'تواصل عبر واتساب' : isFr ? 'Contacter sur WhatsApp' : 'Chat on WhatsApp'}</span>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          </a>
        </div>

      </div>
    </section>
  );
}
