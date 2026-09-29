import { useLanguage } from '../context/LanguageContext';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';

interface FeaturedStylesExplorerProps {
  products: Product[];
  onSelectCategory?: (category: 'clothes' | 'shoes' | 'accessories', type: string) => void;
}

export function FeaturedStylesExplorer({ products, onSelectCategory }: FeaturedStylesExplorerProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Helper to count products matching each department
  const countMatches = (cat: 'clothes' | 'shoes' | 'accessories', typeId: string): number => {
    if (!products || products.length === 0) return 0;
    return products.filter((p) => {
      if (p.category !== cat && p.category_id !== cat) return false;
      if (p.subcategory_id === typeId || p.subcategory === typeId) return true;
      const corpus = `${p.name || ''} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
      if (typeId === 'sneakers' && (corpus.includes('sneaker') || corpus.includes('سنيكرز') || corpus.includes('سبادري') || corpus.includes('running') || corpus.includes('جري'))) return true;
      if (typeId === 'slides' && (corpus.includes('sandal') || corpus.includes('صندل') || corpus.includes('كلاكيت') || corpus.includes('slide'))) return true;
      if (typeId === 'casual-shoe' && (corpus.includes('classic') || corpus.includes('كلاسيك') || corpus.includes('حذاء') || corpus.includes('loaf') || corpus.includes('لوفر') || corpus.includes('موكاسان'))) return true;
      if (typeId === 'jacket' && (corpus.includes('hoodie') || corpus.includes('هودي') || corpus.includes('سويت') || corpus.includes('جاكيت') || corpus.includes('معطف'))) return true;
      if (typeId === 'shirt' && (corpus.includes('shirt') || corpus.includes('قميص') || corpus.includes('بولو') || corpus.includes('polo') || corpus.includes('تيشيرت'))) return true;
      if (typeId === 'jeans' && (corpus.includes('jean') || corpus.includes('جينز') || corpus.includes('pant') || corpus.includes('سروال') || corpus.includes('denim'))) return true;
      if (typeId === 'sunglasses' && (corpus.includes('sunglass') || corpus.includes('نظار') || corpus.includes('ساعة') || corpus.includes('عطر'))) return true;
      return true; // General fallback if within the main category
    }).length;
  };

  const departments = [
    {
      id: 'sneakers',
      category: 'shoes' as const,
      type: 'sneakers',
      nameAr: 'أحذية رياضية وسنيكرز',
      nameEn: 'Sneakers & Streetwear',
      nameFr: 'Sneakers & Streetwear',
      descAr: 'تصاميم شبابية مريحة للمشي اليومي',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'casual-shoe',
      category: 'shoes' as const,
      type: 'casual-shoe',
      nameAr: 'أحذية كلاسيكية وموكاسان',
      nameEn: 'Loafers & Formal Shoes',
      nameFr: 'Mocassins & Souliers',
      descAr: 'أناقة فاخرة للمناسبات والعمل',
      image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'slides',
      category: 'shoes' as const,
      type: 'slides',
      nameAr: 'صنادل وكلاكيت صيفية',
      nameEn: 'Summer Slides & Sandals',
      nameFr: 'Sandales & Claquettes',
      descAr: 'راحة تامة وخفة للبيت والخرجات',
      image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'hoodies',
      category: 'clothes' as const,
      type: 'jacket',
      nameAr: 'هوديات وسويت شيرت',
      nameEn: 'Oversized Hoodies & Sweats',
      nameFr: 'Sweats à Capuche & Sweats',
      descAr: 'قطن ممتاز وقصات عصرية واسعة',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'shirts',
      category: 'clothes' as const,
      type: 'shirt',
      nameAr: 'قمصان وبولو كلاسيك',
      nameEn: 'Linen Shirts & Knit Polos',
      nameFr: 'Chemises en Lin & Polos',
      descAr: 'أقمشة كتان وتريكو راقية جداً',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'jeans',
      category: 'clothes' as const,
      type: 'jeans',
      nameAr: 'جينز وسراويل مريحة',
      nameEn: 'Denim Jeans & Chinos',
      nameFr: 'Jeans & Pantalons Chino',
      descAr: 'فصالات عملية وألوان أساسية متناسقة',
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80',
    },
  ];

  const handleClick = (cat: 'clothes' | 'shoes' | 'accessories', type: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat, type);
    } else {
      navigate(`/${cat}?type=${type}`);
    }
  };

  const title = language === 'ar' 
    ? 'أقسام الأحذية والملابس الأكثر طلباً' 
    : language === 'fr' 
      ? 'Catégories & Styles Tendance' 
      : 'Most-Wanted Footwear & Apparel';

  const subtitle = language === 'ar'
    ? 'اختر القسم الذي تبحث عنه وتصفح الموديلات والقياسات المتوفرة فوراً في المخزون.'
    : language === 'fr'
      ? 'Explorez directement les catégories les plus demandées avec stocks disponibles.'
      : 'Browse directly into our most in-demand categories with verified stock and fast delivery.';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-6 border-b border-stone-200/80 gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-[11px] font-bold mb-2 border border-stone-200">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>{language === 'ar' ? 'تصنيفات مفصلة ومباشرة' : 'Direct Category Filters'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-950 tracking-tight">
            {title}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-600 max-w-xl">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Grid of 6 High-Res Department Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {departments.map((dept) => {
          const count = countMatches(dept.category, dept.type);
          const name = language === 'ar' ? dept.nameAr : language === 'fr' ? dept.nameFr : dept.nameEn;

          return (
            <div
              key={dept.id}
              onClick={() => handleClick(dept.category, dept.type)}
              className="group relative rounded-2xl overflow-hidden bg-white border border-stone-200/90 shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Image Aspect Box */}
              <div className="relative aspect-4/5 overflow-hidden bg-stone-100">
                <img
                  src={dept.image}
                  alt={name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Badge count */}
                <div className="absolute top-2.5 right-2.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/95 text-stone-900 shadow-xs border border-stone-200/60 font-mono">
                    {count} {language === 'ar' ? 'قطعة' : 'items'}
                  </span>
                </div>

                {/* Arrow Icon on Hover */}
                <div className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 text-stone-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-md">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              {/* Text Info */}
              <div className="p-3 bg-white">
                <h3 className="font-black text-xs sm:text-sm text-stone-950 group-hover:text-amber-700 transition-colors line-clamp-1">
                  {name}
                </h3>
                <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">
                  {language === 'ar' ? dept.descAr : 'Explore latest collection'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
