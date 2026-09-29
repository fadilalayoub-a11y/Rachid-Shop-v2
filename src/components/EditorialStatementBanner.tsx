import { useLanguage } from '../context/LanguageContext';
import { ArrowUp, Sparkles } from 'lucide-react';
import statementImg from '../assets/images/editorial_statement_banner_1790636349206.jpg';

export function EditorialStatementBanner() {
  const { language } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const line1 = language === 'ar' ? 'تألق بأجمل اللحظات' : language === 'fr' ? 'Habillez Vos Plus' : 'Dress Up Your';
  const line2 = language === 'ar' ? 'وأرقى الإطلالات اليومية' : language === 'fr' ? 'Beaux Moments' : 'Beautiful Moments';
  const manifesto = language === 'ar'
    ? 'أزياء فاخرة تعكس ذوقك الرفيع بأسلوب عصري يدوم طويلاً، مع اهتمام فائق بأدق تفاصيل الجودة والراحة.'
    : language === 'fr'
      ? 'Des créations intemporelles et des coupes modernes pour sublimer votre quotidien avec distinction.'
      : 'Timeless craftsmanship, tailored silhouettes, and effortless elegance crafted for your everyday distinction.';

  return (
    <section className="relative my-8 sm:my-14 overflow-hidden rounded-3xl max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative min-h-[360px] sm:min-h-[480px] lg:min-h-[520px] rounded-3xl overflow-hidden bg-stone-900 flex items-center justify-start p-6 sm:p-12 lg:p-16 border border-stone-800 shadow-xl">
        {/* Background Image */}
        <img
          src={statementImg}
          alt="Dress Up Your Beautiful Moments"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.8] contrast-[1.05]"
          loading="lazy"
        />

        {/* Gradient Scrim for WCAG AA readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Content Box */}
        <div className="relative z-10 max-w-xl text-white space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RACHID SHOP EDITORIAL</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
            <span className="block text-white/90 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-lg inline-block mb-1">{line1}</span>
            <span className="block text-white drop-shadow-md">{line2}</span>
          </h2>

          <p className="text-xs sm:text-sm lg:text-base text-stone-200/90 leading-relaxed font-medium max-w-lg">
            {manifesto}
          </p>
        </div>

        {/* Floating Back to Top Button */}
        <button
          type="button"
          onClick={scrollToTop}
          title="Back to top"
          aria-label="Back to top"
          className="absolute bottom-6 right-6 z-20 w-11 h-11 rounded-full bg-white text-stone-950 flex items-center justify-center shadow-lg hover:bg-stone-100 hover:scale-110 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
