import { ShieldCheck, Truck, PackageCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function AnnouncementBar() {
  const { t, isRTL } = useLanguage();

  const items = [
    {
      id: 'authentic',
      icon: ShieldCheck,
      text: t.announcementAuthentic,
      color: 'text-amber-400',
    },
    {
      id: 'shipping',
      icon: Truck,
      text: t.announcementFreeShipping,
      color: 'text-emerald-400',
    },
    {
      id: 'inspect',
      icon: PackageCheck,
      text: t.announcementInspectBeforePay,
      color: 'text-sky-400',
    },
  ];

  return (
    <div 
      className="bg-stone-950 text-stone-200 border-b border-stone-800 text-[11px] sm:text-xs font-medium relative z-50 select-none overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* 1. Mobile View: Continuous Smooth Marquee Ticker (شريط إعلاني متحرك بشكل متواصل وسلس) */}
      <div className="md:hidden w-full overflow-hidden py-2 relative flex items-center">
        {/* Subtle fade edges to enhance ticker aesthetics */}
        <div className="pointer-events-none absolute inset-y-0 start-0 w-6 bg-gradient-to-r rtl:bg-gradient-to-l from-stone-950 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 end-0 w-6 bg-gradient-to-l rtl:bg-gradient-to-r from-stone-950 to-transparent z-10" />

        <div className={isRTL ? 'animate-marquee-rtl' : 'animate-marquee-ltr'}>
          {/* First loop of items */}
          <div className="flex items-center shrink-0">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div key={`m1-${item.id}`} className="flex items-center gap-2 mx-4 shrink-0">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${item.color}`} />
                  <span className="font-semibold text-stone-100 text-[11px] whitespace-nowrap">
                    {item.text}
                  </span>
                  <span className="text-stone-700 ms-3 select-none">•</span>
                </div>
              );
            })}
          </div>

          {/* Duplicate loop for seamless infinite animation */}
          <div className="flex items-center shrink-0" aria-hidden="true">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div key={`m2-${item.id}`} className="flex items-center gap-2 mx-4 shrink-0">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${item.color}`} />
                  <span className="font-semibold text-stone-100 text-[11px] whitespace-nowrap">
                    {item.text}
                  </span>
                  <span className="text-stone-700 ms-3 select-none">•</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Desktop View: Three guarantees presented side-by-side */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        <div className="flex items-center justify-center gap-6 lg:gap-8 text-stone-300">
          {/* 1. Authentic guarantee */}
          <div className="flex items-center gap-2 hover:text-white transition-colors">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold text-stone-100">{t.announcementAuthentic}</span>
          </div>

          <span className="text-stone-700 select-none">•</span>

          {/* 2. Free shipping on 2+ items */}
          <div className="flex items-center gap-2 hover:text-white transition-colors">
            <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-stone-100">{t.announcementFreeShipping}</span>
          </div>

          <span className="text-stone-700 select-none">•</span>

          {/* 3. Inspection upon delivery before paying */}
          <div className="flex items-center gap-2 hover:text-white transition-colors">
            <PackageCheck className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="font-semibold text-stone-100">{t.announcementInspectBeforePay}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
