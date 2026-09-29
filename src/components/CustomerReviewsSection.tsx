import { useState } from 'react';
import { Star, ShieldCheck, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function CustomerReviewsSection() {
  const { language } = useLanguage();

  const reviews = [
    {
      id: 1,
      name: 'ياسين المودن',
      city: 'الدار البيضاء',
      rating: 5,
      date: 'منذ يومين',
      productBought: 'سنيكرز جلد أبيض كاجوال',
      comment:
        'تبارك الله السلعة ناضية بزاف ونفس الصورة تماماً. السبرديلة خفيفة ف الرجل ومريحة للمشي الطويل، والتوصيل وصلني ف 24 ساعة، شكراً على الاحترافية!',
    },
    {
      id: 2,
      name: 'عثمان التازي',
      city: 'الرباط - حسان',
      rating: 5,
      date: 'منذ 4 أيام',
      productBought: 'قميص لينين كلاسيك كحلي',
      comment:
        'أول تجربة ليا مع راشيد شوب وبصراحة تفاجأت بجودة الثوب والفصالة. المقاس جا مضبوط بالمليمتر وقبل ما نخلص فتحت الكولي وشفت السلعة. معاملة راقية جداً.',
    },
    {
      id: 3,
      name: 'مهدي بنجلون',
      city: 'مراكش',
      rating: 5,
      date: 'منذ أسبوع',
      productBought: 'هودي أوفرسايز قطن 100%',
      comment:
        'الثوب ثقيل والكبوش متقون بزاف بحال براندات برا. غسلته دابا جوج مرات وماتغيرش لا اللون ولا الفصالة. دابا كانستنا الكولكشن الجديدة باش نكوموندي تاني.',
    },
    {
      id: 4,
      name: 'سفيان الشاوي',
      city: 'طنجة',
      rating: 5,
      date: 'منذ أسبوع',
      productBought: 'حذاء كلاسيكي لوفر إيطالي',
      comment:
        'الجلد طبيعي نقي وخياطة نقية بزاف. عجبني التعامل د الواتساب جاوبوني على كل القياسات حتى تأكدت من المقاس ديالي. بالتوفيق ليكم.',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevReview = () => {
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const nextReview = () => {
    setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const title = language === 'ar' 
    ? 'تجارب وآراء زبائننا الكرام' 
    : language === 'fr' 
      ? 'Avis & Témoignages Clients' 
      : 'What Our Customers Say';

  const subtitle = language === 'ar'
    ? 'أكثر من 2,500 زبون راضٍ في مختلف مدن المغرب. ثقتكم هي سر نجاحنا وتميزنا.'
    : language === 'fr'
      ? 'Plus de 2 500 clients satisfaits à travers le Maroc. Votre confiance fait notre fierté.'
      : 'Over 2,500+ satisfied clients across Morocco. Verified reviews from real shoppers.';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-6 border-b border-stone-200/80 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-[11px] font-bold text-amber-800 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'ar' ? 'تقييمات مؤكدة 4.9 / 5' : 'Verified Reviews 4.9 / 5'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-950 tracking-tight">
            {title}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-600 max-w-xl">
            {subtitle}
          </p>
        </div>

        {/* Carousel arrows */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={prevReview}
            aria-label="Previous review"
            className="w-9 h-9 rounded-full bg-white border border-stone-200 text-stone-700 hover:text-stone-950 hover:bg-stone-50 flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextReview}
            aria-label="Next review"
            className="w-9 h-9 rounded-full bg-white border border-stone-200 text-stone-700 hover:text-stone-950 hover:bg-stone-50 flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Stars & Quote Icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote className="w-5 h-5 text-stone-200" />
              </div>

              {/* Comment */}
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
                "{rev.comment}"
              </p>
            </div>

            {/* Author info */}
            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-stone-950">{rev.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" title="مشترٍ مؤكد"></span>
                </div>
                <span className="text-[11px] text-stone-400 block font-medium">{rev.city}</span>
              </div>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-bold">
                {rev.productBought}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
