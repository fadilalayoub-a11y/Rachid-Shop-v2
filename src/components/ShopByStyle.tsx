import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import classicImage from '../assets/images/classic_style_model_1790442867183.jpg';
import streetwearImage from '../assets/images/streetwear_style_1790442307781.jpg';
import sportswearImage from '../assets/images/sportswear_model_1790442882053.jpg';
import casualImage from '../assets/images/casual_style_model_1790442894528.jpg';

export interface StyleCard {
  id: string;
  nameEn: string;
  nameAr: string;
  nameFr: string;
  subtitleAr: string;
  subtitleEn: string;
  image: string;
  link: string;
}

export const STYLES_DATA: StyleCard[] = [
  {
    id: 'classic',
    nameEn: 'CLASSIC',
    nameAr: 'كلاسيكي',
    nameFr: 'CLASSIQUE',
    subtitleAr: 'قمصان راقية، سراويل قماش، وأحذية جلدية رسمية',
    subtitleEn: 'Formal shirts, tailored trousers & formal leather shoes',
    image: classicImage,
    link: '/collection/classic-style',
  },
  {
    id: 'streetwear',
    nameEn: 'STREETWEAR',
    nameAr: 'لبس الشارع',
    nameFr: 'STREETWEAR',
    subtitleAr: 'قصات أوفرسايز، ستايل أوربان عصري، بولو واسع وسنيكرز',
    subtitleEn: 'Oversized fits, urban aesthetic, baggy pants & trendy sneakers',
    image: streetwearImage,
    link: '/collection/streetwear',
  },
  {
    id: 'sportswear',
    nameEn: 'SPORTSWEAR',
    nameAr: 'رياضي',
    nameFr: 'SPORTSWEAR',
    subtitleAr: 'كيطمات، هوديز، شورتات تمرين وسنيكرز رياضية',
    subtitleEn: 'Trackpants, athletic hoodies & performance sneakers',
    image: sportswearImage,
    link: '/collection/sportswear-gym',
  },
  {
    id: 'casual',
    nameEn: 'CASUAL',
    nameAr: 'كاجوال',
    nameFr: 'DÉCONTRACTÉ',
    subtitleAr: 'جينز مريح، قمصان يومية خفيفة وأحذية كاجوال',
    subtitleEn: 'Everyday denim, casual tees & comfortable footwear',
    image: casualImage,
    link: '/collection/denim-casual',
  },
];

export function ShopByStyle() {
  const { language } = useLanguage();

  return (
    <section className="w-full mt-8 sm:mt-12 mb-2 sm:mb-4" aria-labelledby="shop-by-style-title">
      {/* 1. Header Section: Matches the exact aesthetic of ShopByCategories with elegant lines */}
      <div className="text-center mb-6 sm:mb-8 max-w-xl mx-auto px-4">
        <p className="text-stone-400 text-xs sm:text-sm font-normal tracking-wide mb-1.5 font-sans">
          {language === 'ar' ? 'اختر مظهرك وإطلالتك الخاصة' : language === 'fr' ? 'Choisissez Votre Esthétique' : 'Choose Your Aesthetic'}
        </p>

        <div className="flex items-center justify-center gap-3 sm:gap-6">
          <div className="h-[1px] w-12 sm:w-20 bg-stone-900" />
          <h2
            id="shop-by-style-title"
            className="text-lg sm:text-2xl md:text-3xl font-bold tracking-widest text-stone-950 uppercase font-sans whitespace-nowrap"
          >
            {language === 'ar' ? 'تسوق حسب الستايل والمظهر' : language === 'fr' ? 'ACHETER PAR STYLE' : 'SHOP BY STYLE'}
          </h2>
          <div className="h-[1px] w-12 sm:w-20 bg-stone-900" />
        </div>
      </div>

      {/* 2. Responsive 4-Column Grid (No arrows or scrolling needed) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {STYLES_DATA.map((item) => {
          const displayName = language === 'ar'
            ? item.nameAr
            : language === 'fr'
            ? item.nameFr
            : item.nameEn;

          return (
            <div
              key={item.id}
              className="flex flex-col"
            >
              <Link
                to={item.link}
                className="group relative block aspect-[3/4] overflow-hidden bg-[#e8e8e8] transition-all duration-300 hover:shadow-xl rounded-sm"
              >
                {/* Full-height high-quality lifestyle photography background */}
                <img
                  src={item.image}
                  alt={displayName}
                  className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Subtle hover shade */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-300" />

                {/* Overlaid clean white rectangular badge containing style title in uppercase dark sans-serif text */}
                <div className="absolute bottom-4 sm:bottom-5 inset-x-0 flex flex-col items-center justify-center px-2 sm:px-3 z-10">
                  <div className="bg-white px-3 sm:px-5 py-2 sm:py-2.5 shadow-sm text-center min-w-[110px] sm:min-w-[140px] max-w-[92%] transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                    <span className="block text-[11px] sm:text-xs md:text-sm font-bold text-stone-900 tracking-wider uppercase font-sans whitespace-nowrap">
                      {displayName}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
