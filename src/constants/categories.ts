export interface SubcategoryOption {
  id: string;
  nameAr: string;
  nameEn: string;
  nameFr: string;
  category: 'clothes' | 'shoes' | 'accessories';
  filterKey: string; // Used by Store.tsx filters
}

export const STORE_SUBCATEGORIES: SubcategoryOption[] = [
  // ملابس (Clothes)
  {
    id: 't-shirts',
    nameAr: 'تيشيرتات (T-Shirts)',
    nameEn: 'T-Shirts',
    nameFr: 'T-Shirts',
    category: 'clothes',
    filterKey: 'shirt',
  },
  {
    id: 'hoodies',
    nameAr: 'هوديز وسويت شيرت (Hoodies & Sweatshirts)',
    nameEn: 'Hoodies & Sweatshirts',
    nameFr: 'Hoodies & Sweatshirts',
    category: 'clothes',
    filterKey: 'jacket',
  },
  {
    id: 'jackets',
    nameAr: 'جواكت ومعاطف (Jackets & Coats)',
    nameEn: 'Jackets & Coats',
    nameFr: 'Vestes & Manteaux',
    category: 'clothes',
    filterKey: 'jacket',
  },
  {
    id: 'jeans',
    nameAr: 'بناطيل جينز (Jeans & Denim)',
    nameEn: 'Jeans & Denim',
    nameFr: 'Jeans & Denim',
    category: 'clothes',
    filterKey: 'jeans',
  },
  {
    id: 'sweatpants',
    nameAr: 'سراويل رياضية / كيطمة (Sweatpants & Joggers)',
    nameEn: 'Sweatpants & Joggers',
    nameFr: 'Survêtements & Joggers',
    category: 'clothes',
    filterKey: 'trackpants',
  },
  {
    id: 'trousers',
    nameAr: 'سراويل قماش كلاسيكية (Trousers & Chinos)',
    nameEn: 'Trousers & Chinos',
    nameFr: 'Pantalons & Chinos',
    category: 'clothes',
    filterKey: 'jeans',
  },
  {
    id: 'shorts',
    nameAr: 'شورتات وبرمودا (Shorts)',
    nameEn: 'Shorts',
    nameFr: 'Shorts & Bermudas',
    category: 'clothes',
    filterKey: 'shorts',
  },

  // أحذية (Shoes)
  {
    id: 'sneakers',
    nameAr: 'سنيكرز وأحذية رياضية (Sneakers)',
    nameEn: 'Sneakers',
    nameFr: 'Sneakers & Baskets',
    category: 'shoes',
    filterKey: 'sneakers',
  },
  {
    id: 'formal-shoes',
    nameAr: 'أحذية كلاسيكية وجلدية (Formal & Classic Shoes)',
    nameEn: 'Formal & Classic Shoes',
    nameFr: 'Chaussures de Ville',
    category: 'shoes',
    filterKey: 'casual-shoe',
  },
  {
    id: 'running-shoes',
    nameAr: 'أحذية جري وتمارين (Running & Sport Shoes)',
    nameEn: 'Running & Sport Shoes',
    nameFr: 'Chaussures de Sport',
    category: 'shoes',
    filterKey: 'sneakers',
  },
  {
    id: 'sandals',
    nameAr: 'صنادل وكلاكيط (Sandals & Slides)',
    nameEn: 'Sandals & Slides',
    nameFr: 'Sandales & Claquettes',
    category: 'shoes',
    filterKey: 'slides',
  },

  // إكسسوارات (Accessories)
  {
    id: 'watches-perfumes',
    nameAr: 'ساعات وعطور (Watches & Perfumes)',
    nameEn: 'Watches & Perfumes',
    nameFr: 'Montres & Parfums',
    category: 'accessories',
    filterKey: 'watch',
  },
  {
    id: 'sunglasses',
    nameAr: 'نظارات شمسية (Sunglasses)',
    nameEn: 'Sunglasses',
    nameFr: 'Lunettes de Soleil',
    category: 'accessories',
    filterKey: 'sunglasses',
  },
  {
    id: 'caps-hats',
    nameAr: 'قبعات وطواقي (Caps & Hats)',
    nameEn: 'Caps & Hats',
    nameFr: 'Casquettes & Bonnets',
    category: 'accessories',
    filterKey: 'caps',
  },
  {
    id: 'bags',
    nameAr: 'حقائب وشنط ظهر (Bags & Backpacks)',
    nameEn: 'Bags & Backpacks',
    nameFr: 'Sacs & Sacs à Dos',
    category: 'accessories',
    filterKey: 'caps',
  },
];

export const getSubcategoriesForCategory = (category: 'clothes' | 'shoes' | 'accessories') => {
  return STORE_SUBCATEGORIES.filter((item) => item.category === category);
};
