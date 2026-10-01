'use client';

import { useLanguage } from '@/context/LanguageContext';
import { ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CategorySplitBanners() {
  const { language } = useLanguage();
  const router = useRouter();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Banner 1: Men's Fashion */}
        <div 
          onClick={() => router.push('/clothes')}
          className="group relative bg-[#f1f1f3] rounded-3xl p-6 sm:p-10 flex flex-col justify-between overflow-hidden border border-stone-200/80 cursor-pointer min-h-[460px] sm:min-h-[520px] shadow-xs hover:shadow-md transition-all duration-300"
        >
          <div className="relative z-10">
            <span className="text-[11px] font-black text-stone-500 uppercase tracking-widest block mb-2">
              {language === 'ar' ? 'الأناقة تلتقي بالثقة' : 'STYLE MEETS CONFIDENCE'}
            </span>
            <h3 className="text-4xl sm:text-5xl font-black text-stone-950 tracking-tight font-serif italic">
              {language === 'ar' ? 'تسوق الملابس' : 'Shop Men'}
            </h3>
          </div>

          {/* Model Image Centered */}
          <div className="absolute inset-0 flex items-end justify-center pointer-events-none overflow-hidden pt-16">
            <img 
              src="/images/editorial_category_men_1790636328292.jpg" 
              alt="Shop Men" 
              className="h-full w-auto object-contain object-bottom group-hover:scale-105 transition-transform duration-700 ease-out" 
            />
          </div>

          <div className="relative z-10 flex items-center justify-between mt-auto pt-6">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-950 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-xs border border-stone-200/60 group-hover:bg-stone-950 group-hover:text-white transition-all">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              <span>{language === 'ar' ? 'اكتشف التشكيلة الكاملة' : 'Discover The Edit'}</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>

        {/* Banner 2: Shoes & Footwear */}
        <div 
          onClick={() => router.push('/shoes')}
          className="group relative bg-[#ececf0] rounded-3xl p-6 sm:p-10 flex flex-col justify-between overflow-hidden border border-stone-200/80 cursor-pointer min-h-[460px] sm:min-h-[520px] shadow-xs hover:shadow-md transition-all duration-300"
        >
          <div className="relative z-10">
            <span className="text-[11px] font-black text-stone-500 uppercase tracking-widest block mb-2">
              {language === 'ar' ? 'ارتقِ بإطلالتك وأناقتك' : 'ELEVATE YOUR STYLE'}
            </span>
            <h3 className="text-4xl sm:text-5xl font-black text-stone-950 tracking-tight font-serif italic">
              {language === 'ar' ? 'تسوق الأحذية الفاخرة' : 'Shop Footwear'}
            </h3>
          </div>

          {/* Model Image Centered */}
          <div className="absolute inset-0 flex items-end justify-center pointer-events-none overflow-hidden pt-16">
            <img 
              src="/images/editorial_category_shoes_1790636338792.jpg" 
              alt="Shop Footwear" 
              className="h-full w-auto object-contain object-bottom group-hover:scale-105 transition-transform duration-700 ease-out" 
            />
          </div>

          <div className="relative z-10 flex items-center justify-between mt-auto pt-6">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-950 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-xs border border-stone-200/60 group-hover:bg-stone-950 group-hover:text-white transition-all">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              <span>{language === 'ar' ? 'تصفح كافة الموديلات' : 'Browse All Styles'}</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
