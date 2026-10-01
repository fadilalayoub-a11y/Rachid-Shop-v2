'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query } from 'firebase/firestore';
import { Product } from '@/types';
import { getProductEffectiveCategory, getProductEffectiveSubcategory } from '@/utils/productClassifier';

// استيراد الصور الافتراضية
const prevJeansImg = '/cat_jeans_editorial_1790338015205.jpg';
const prevWatchesPerfumesImg = '/cat_perfume_editorial_1790338068896.jpg';
const userTshirtImg = '/cat_tshirt_user.jpg';
const hoodieAndSweatshirtImg = '/cat_hoodie_sweatshirt_1790352438728.jpg';
const sweatpantsGreyImg = '/cat_sweatpants_grey_1790353992807.jpg';

export const CATEGORIES_STORAGE_KEY = 'rachid_shop_category_images_custom';

export interface CategoryCard {
  id: string;
  nameEn: string;
  nameAr: string;
  nameFr: string;
  image: string;
  link: string;
}

export const DEFAULT_CATEGORIES_DATA: CategoryCard[] = [
  {
    id: 't-shirts',
    nameEn: 'T-SHIRTS',
    nameAr: 'تيشيرتات',
    nameFr: 'T-SHIRTS',
    image: userTshirtImg,
    link: '/category/clothes?type=shirt',
  },
  {
    id: 'hoodies',
    nameEn: 'HOODIES & SWEATSHIRTS',
    nameAr: 'هوديز وسويت شيرت',
    nameFr: 'HOODIES & SWEATS',
    image: hoodieAndSweatshirtImg,
    link: '/category/clothes?type=jacket',
  },
  {
    id: 'jackets',
    nameEn: 'JACKETS',
    nameAr: 'جواكت ومعاطف',
    nameFr: 'VESTES',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    link: '/category/clothes?type=jacket',
  },
  {
    id: 'jeans',
    nameEn: 'JEANS',
    nameAr: 'جينز',
    nameFr: 'JEANS',
    image: prevJeansImg,
    link: '/category/clothes?type=jeans',
  },
  {
    id: 'sweatpants',
    nameEn: 'SWEATPANTS',
    nameAr: 'سراويل رياضية (كيطمة)',
    nameFr: 'SURVÊTEMENTS',
    image: sweatpantsGreyImg,
    link: '/category/clothes?type=trackpants',
  },
  {
    id: 'shorts',
    nameEn: 'SHORTS',
    nameAr: 'شورتات',
    nameFr: 'SHORTS',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80',
    link: '/category/clothes?type=shorts',
  },
  {
    id: 'trousers',
    nameEn: 'TROUSERS',
    nameAr: 'سراويل كلاسيكية',
    nameFr: 'PANTALONS',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    link: '/category/clothes?type=jeans',
  },
  {
    id: 'sneakers',
    nameEn: 'SNEAKERS',
    nameAr: 'سنيكرز',
    nameFr: 'SNEAKERS',
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80',
    link: '/category/shoes?type=sneakers',
  },
  {
    id: 'formal-shoes',
    nameEn: 'FORMAL SHOES',
    nameAr: 'أحذية كلاسيكية',
    nameFr: 'CHAUSSURES DE VILLE',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
    link: '/category/shoes?type=casual-shoe',
  },
  {
    id: 'running-shoes',
    nameEn: 'RUNNING SHOES',
    nameAr: 'أحذية الجري والرياضة',
    nameFr: 'CHAUSSURES DE SPORT',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    link: '/category/shoes?type=sneakers',
  },
  {
    id: 'sandals',
    nameEn: 'SANDALS',
    nameAr: 'صنادل وكلاكيط',
    nameFr: 'SANDALES & CLAQUETTES',
    image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=800&q=80',
    link: '/category/shoes?type=slides',
  },
  {
    id: 'bags',
    nameEn: 'BAGS',
    nameAr: 'حقائب وشنط',
    nameFr: 'SACS',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    link: '/category/accessories?type=caps',
  },
  {
    id: 'caps-hats',
    nameEn: 'CAPS & HATS',
    nameAr: 'قبعات',
    nameFr: 'CASQUETTES & CHAPEAUX',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    link: '/category/accessories?type=caps',
  },
  {
    id: 'sunglasses',
    nameEn: 'SUNGLASSES',
    nameAr: 'نظارات شمسية',
    nameFr: 'LUNETTES DE SOLEIL',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    link: '/category/accessories?type=sunglasses',
  },
  {
    id: 'watches-perfumes',
    nameEn: 'WATCHES & PERFUMES',
    nameAr: 'ساعات وعطور',
    nameFr: 'MONTRES & PARFUMS',
    image: prevWatchesPerfumesImg,
    link: '/collection/watches-fragrances',
  },
];

export interface ShopByCategoriesProps {
  products?: Product[];
}

export function ShopByCategories({ products = [] }: ShopByCategoriesProps) {
  const { language } = useLanguage();
  const [liveProducts, setLiveProducts] = useState<Product[]>(products);

  // مزامنة حية لمنتجات المتجر للتأكد من دقة عداد القطع في كل كارت فئة
  useEffect(() => {
    if (products && products.length > 0) {
      setLiveProducts(products);
      return;
    }

    const q = query(collection(db, 'products'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const fetched: Product[] = [];
        snapshot.forEach((d) => {
          fetched.push({ id: d.id, ...d.data() } as Product);
        });
        if (fetched.length > 0) {
          setLiveProducts(fetched);
        }
      },
      (err) => {
        console.warn('Error fetching live products in ShopByCategories:', err);
      }
    );

    return () => unsub();
  }, [products]);

  // Helper to calculate product count per category
  const getCategoryItemCount = (item: CategoryCard): number => {
    const listToCount = liveProducts && liveProducts.length > 0 ? liveProducts : products;
    if (!listToCount || listToCount.length === 0) return 0;

    const matching = listToCount.filter((p) => {
      const effCat = getProductEffectiveCategory(p);
      const effSub = getProductEffectiveSubcategory(p);

      if (p.subcategory_id === item.id || p.subcategory === item.id || effSub === item.id) return true;

      const rawCorpus = `${p.name || ''} ${p.nameAr || ''} ${p.nameEn || ''} ${p.description || ''} ${p.descriptionAr || ''} ${p.category || ''} ${effCat} ${p.subcategory || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
      const normalize = (s: string) => s.replace(/[أإآ]/g, 'ا').replace(/ذ/g, 'د');
      const corpus = normalize(rawCorpus);

      if (item.id === 't-shirts' && (effSub === 't-shirts' || effSub === 'polo' || corpus.includes('shirt') || corpus.includes('تيشيرت') || corpus.includes('قميص'))) return true;
      if (item.id === 'hoodies' && (effSub === 'hoodies' || corpus.includes('hoodie') || corpus.includes('هودي') || corpus.includes('سويت'))) return true;
      if (item.id === 'jackets' && (effSub === 'jackets' || corpus.includes('jacket') || corpus.includes('جاكيت') || corpus.includes('معطف'))) return true;
      if (item.id === 'jeans' && (effSub === 'jeans' || corpus.includes('jean') || corpus.includes('جينز'))) return true;
      if (item.id === 'sweatpants' && (effSub === 'sweatpants' || corpus.includes('pant') || corpus.includes('سروال') || corpus.includes('كيطمة'))) return true;
      if (item.id === 'shorts' && (effSub === 'shorts' || corpus.includes('short') || corpus.includes('شورت'))) return true;
      if (item.id === 'trousers' && (effSub === 'trousers' || corpus.includes('trouser') || corpus.includes('قماش'))) return true;
      if (item.id === 'sneakers' && (effSub === 'sneakers' || corpus.includes('sneaker') || corpus.includes('سنيكرز') || effCat === 'shoes')) return true;
      if (item.id === 'formal-shoes' && (effSub === 'formal-shoes' || corpus.includes('classic') || corpus.includes('كلاسيك') || corpus.includes('موكاسان'))) return true;
      
      // أحذية الجري والرياضة: تشمل كل أحذية الجري والسنيكرز الرياضية والأحذية المخصصة للرياضة
      if (item.id === 'running-shoes') {
        if (effSub === 'running-shoes') return true;
        if (effCat === 'shoes' && (corpus.includes('جري') || corpus.includes('running') || corpus.includes('رياضي') || corpus.includes('sport') || corpus.includes('سنيكرز') || corpus.includes('سبادري'))) return true;
        if (corpus.includes('حداء جري') || corpus.includes('حذاء جري') || corpus.includes('running') || corpus.includes('حذاء رياضي')) return true;
      }

      if (item.id === 'sandals' && (effSub === 'sandals' || corpus.includes('sandal') || corpus.includes('صندل') || corpus.includes('كلاكيت') || corpus.includes('كلاكيط'))) return true;
      if (item.id === 'watches-perfumes' && (effSub === 'watches' || effSub === 'perfumes' || corpus.includes('watch') || corpus.includes('ساعة') || corpus.includes('عطر') || effCat === 'accessories')) return true;
      if (item.id === 'sunglasses' && (effSub === 'sunglasses' || corpus.includes('sunglass') || corpus.includes('نظار'))) return true;
      if (item.id === 'caps-hats' || item.id === 'caps' && (effSub === 'caps-hats' || corpus.includes('cap') || corpus.includes('قبعة'))) return true;
      if (item.id === 'bags' && (effSub === 'bags' || corpus.includes('bag') || corpus.includes('حقيبة') || corpus.includes('صاك'))) return true;

      if (item.link.includes('shoes') && effCat === 'shoes') return true;
      if (item.link.includes('clothes') && effCat === 'clothes') return true;
      if (item.link.includes('accessories') && effCat === 'accessories') return true;
      return false;
    });
    return matching.length;
  };
  const [customImages, setCustomImages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const clean: Record<string, string> = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (k !== 'customNames' && typeof v === 'string' && !v.startsWith('data:')) {
            clean[k] = v;
          }
        }
        return clean;
      }
      return {};
    } catch {
      return {};
    }
  });
  const [customNames, setCustomNames] = useState<Record<string, { ar?: string; en?: string }>>({});

  // الاستماع للتحديثات الحية من Firestore لصور وعناوين الأقسام التي ترفعها الإدارة
  useEffect(() => {
    const docRef = doc(db, 'settings', 'category_images');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && typeof data === 'object') {
            const clean: Record<string, string> = {};
            for (const [k, v] of Object.entries(data)) {
              if (k !== 'customNames' && typeof v === 'string' && !v.startsWith('data:')) {
                clean[k] = v;
              }
            }
            setCustomImages(clean);

            if (data.customNames && typeof data.customNames === 'object') {
              setCustomNames(data.customNames as Record<string, { ar?: string; en?: string }>);
            } else {
              setCustomNames({});
            }

            try {
              localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(clean));
            } catch (e) {
              console.warn(e);
            }
          }
        }
      },
      (err) => {
        console.warn('ShopByCategories snapshot listener error:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // تصنيف الأقسام الـ 15 كاملة وترتيبها الهندسي المتناسق
  const { row1, midLeft, midRight, row3 } = useMemo(() => {
    const row1Ids = ['jackets', 'hoodies', 't-shirts', 'shorts', 'jeans', 'sweatpants'];
    const midLeftIds = ['trousers', 'sneakers'];
    const midRightId = 'formal-shoes';
    const row3Ids = ['running-shoes', 'sandals', 'bags', 'caps-hats', 'sunglasses', 'watches-perfumes'];

    const getCat = (id: string) => DEFAULT_CATEGORIES_DATA.find((c) => c.id === id)!;

    return {
      row1: row1Ids.map(getCat).filter(Boolean),
      midLeft: midLeftIds.map(getCat).filter(Boolean),
      midRight: getCat(midRightId),
      row3: row3Ids.map(getCat).filter(Boolean),
    };
  }, []);

  const renderCategoryCard = (item: CategoryCard) => {
    const customNameObj = customNames[item.id];
    const customAr = customNameObj?.ar?.trim();
    const customEn = customNameObj?.en?.trim();
    const customFr = customNameObj?.fr?.trim();

    const displayName = language === 'ar'
      ? (customAr || item.nameAr)
      : language === 'fr'
      ? (customFr || customEn || item.nameFr)
      : (customEn || item.nameEn);

    const displayImage = customImages[item.id] || item.image;

    return (
      <Link
        to={item.link}
        className="group relative block aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-2xs hover:shadow-md transition-all duration-300"
        title={displayName}
      >
        <img
          src={displayImage}
          alt={displayName}
          className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-106"
          loading="lazy"
        />

        {/* عنوان الفئة أسفل البطاقة تماماً كما في الصورة */}
        <div className="absolute inset-x-0 bottom-0 p-2 sm:p-2.5 pb-2.5 sm:pb-3 bg-gradient-to-t from-stone-950/75 via-stone-950/25 to-transparent flex flex-col justify-end text-center">
          <p className="text-[10px] sm:text-xs font-bold text-white tracking-wider uppercase line-clamp-1 drop-shadow-xs">
            {displayName}
          </p>
        </div>
      </Link>
    );
  };

  return (
    <section className="w-full my-6 sm:my-10" aria-label="Shop by Categories">
      {/* شبكة الكولاج المتكاملة للأقسام الـ 15 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-2.5 md:gap-3 items-center">
        {/* السطر الأول: 6 بطاقات (جواكت، هوديز، تيشيرتات، شورتات، جينز، سراويل رياضية) */}
        {row1.map((item) => (
          <div key={item.id} className="col-span-1">
            {renderCategoryCard(item)}
          </div>
        ))}

        {/* السطر الثاني على اليسار: بطاقتان (سراويل كلاسيكية، سنيكرز) */}
        {midLeft.map((item) => (
          <div key={item.id} className="col-span-1">
            {renderCategoryCard(item)}
          </div>
        ))}

        {/* السطر الثاني بالمنتصف: البطاقة المركزية ممتدة على 3 أعمدة */}
        <div className="col-span-2 sm:col-span-3 md:col-span-3 h-full min-h-[160px] sm:min-h-[190px] md:min-h-[220px] rounded-2xl sm:rounded-3xl bg-[#fbfbfb] border border-stone-200/80 shadow-2xs flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none">
          <span className="text-[10px] sm:text-xs md:text-sm font-normal tracking-[0.35em] sm:tracking-[0.42em] text-stone-500 uppercase font-sans mb-1 sm:mb-2">
            SHOP BY
          </span>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light sm:font-normal tracking-[0.22em] sm:tracking-[0.28em] md:tracking-[0.32em] text-stone-900 uppercase font-sans leading-none">
            CATEGORIES
          </h2>
          <div className="h-[1px] w-24 xs:w-32 sm:w-44 md:w-56 bg-stone-300 mt-3 sm:mt-4 md:mt-5" />
        </div>

        {/* السطر الثاني على اليمين: أحذية كلاسيكية */}
        {midRight && (
          <div className="col-span-1">
            {renderCategoryCard(midRight)}
          </div>
        )}

        {/* السطر الثالث: 6 بطاقات (أحذية جري، صنادل، حقائب، قبعات، نظارات، ساعات وعطور) */}
        {row3.map((item) => (
          <div key={item.id} className="col-span-1">
            {renderCategoryCard(item)}
          </div>
        ))}
      </div>
    </section>
  );
}
