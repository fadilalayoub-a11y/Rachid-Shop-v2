import { Product } from '../types';

export interface CollectionDefinition {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  nameFr: string;
  subtitleEn: string;
  subtitleAr: string;
  subtitleFr: string;
  targetItemsEn: string;
  targetItemsAr: string;
  targetAudienceAr: string;
  seoDescriptionAr: string;
  seoDescriptionEn: string;
  categoryTypes: { id: string; nameAr: string; nameEn: string }[];
  keywords: string[];
}

export const LIFESTYLE_COLLECTIONS: CollectionDefinition[] = [
  {
    id: 'denim-casual',
    slug: 'denim-casual',
    nameEn: 'Denim & Casual',
    nameAr: 'جينز وكاجوال',
    nameFr: 'Denim & Casual',
    subtitleEn: 'Jeans, Jackets & Everyday Casual Essentials',
    subtitleAr: 'بناطيل جينز، جواكت كاجوال، قمصان يومية وأحذية عملية',
    subtitleFr: 'Jeans, Vestes & Vêtements Décontractés',
    targetItemsEn: 'Jeans, Casual Jackets, Everyday Shirts, Casual Shoes',
    targetItemsAr: 'سراويل جينز، جواكت عصرية، قمصان كاجوال، وأحذية يومية مريحة',
    targetAudienceAr: 'الباحثون عن إطلالات يومية راقية وعملية',
    seoDescriptionAr: 'تسوق تشكيلة جينز وكاجوال الفاخرة للرجال من متجر رشيد. بناطيل دينيم، جواكت كاجوال وأحذية يومية بجودة عالية.',
    seoDescriptionEn: 'Shop Denim & Casual collection at Rachid Shop. Men\'s jeans, casual jackets, everyday shirts and casual footwear.',
    categoryTypes: [
      { id: 'jeans', nameAr: 'جينز', nameEn: 'Jeans' },
      { id: 'jacket', nameAr: 'جواكت كاجوال', nameEn: 'Jackets' },
      { id: 'shirt', nameAr: 'قمصان يومية', nameEn: 'Shirts' },
      { id: 'casual-shoe', nameAr: 'أحذية كاجوال', nameEn: 'Casual Shoes' },
    ],
    keywords: [
      'جينز', 'دينيم', 'denim', 'jean', 'jeans',
      'جاكيت', 'veste', 'jacket', 'bomber', 'بومبر',
      'قميص', 'chemise', 'shirt',
      'كاجوال', 'casual', 'جلد', 'جلد كاجوال'
    ],
  },
  {
    id: 'sportswear-gym',
    slug: 'sportswear-gym',
    nameEn: 'Sportswear & Gym',
    nameAr: 'ملابس رياضية وجيم',
    nameFr: 'Sportswear & Fitness',
    subtitleEn: 'Trackpants, Hoodies, Gym Shorts & Sneakers',
    subtitleAr: 'بناطيل رياضية (كيطمة)، شورتات تمرين، هوديز وأحذية سنيكرز',
    subtitleFr: 'Survêtements, Hoodies & Sneakers',
    targetItemsEn: 'Trackpants (كيطمة), Athletic Shorts, Hoodies, Sport T-shirts, Sneakers',
    targetItemsAr: 'كيطمة رياضية، شورتات تمرين، هوديز، تيشيرتات رياضية وسنيكرز',
    targetAudienceAr: 'محبو الرياضة والنشاط وإطلالات الشارع العصرية',
    seoDescriptionAr: 'أفضل تشكيلة ملابس رياضية وجيم للرجال: كيطمات مريحة، هوديز قطنية وأحذية جري وسنيكرز حصرية.',
    seoDescriptionEn: 'Explore men\'s sportswear and gym essentials: trackpants, workout shorts, hoodies and performance sneakers.',
    categoryTypes: [
      { id: 'trackpants', nameAr: 'كيطمة وبناطيل رياضية', nameEn: 'Trackpants' },
      { id: 'athletic-shorts', nameAr: 'شورتات تمرين', nameEn: 'Athletic Shorts' },
      { id: 'hoodies', nameAr: 'هوديز وسويت شيرت', nameEn: 'Hoodies' },
      { id: 'sport-tshirt', nameAr: 'تيشيرتات رياضية', nameEn: 'Sport Tees' },
      { id: 'sneakers', nameAr: 'سنيكرز وأحذية رياضية', nameEn: 'Sneakers' },
    ],
    keywords: [
      'كيطمة', 'سيرفيت', 'survetement', 'trackpant', 'trackpants', 'jogger', 'joggers', 'جوجرز',
      'هودي', 'hoodie', 'sweat', 'سويت شيرت',
      'شورت رياضي', 'gym', 'sport', 'fitness', 'رياضي', 'تمرين',
      'سنيكرز', 'sneaker', 'sneakers', 'حذاء رياضي', 'جري', 'running'
    ],
  },
  {
    id: 'summer-essentials',
    slug: 'summer-essentials',
    nameEn: 'Summer Essentials',
    nameAr: 'أساسيات الصيف',
    nameFr: 'Essentiels d\'Été',
    subtitleEn: 'Linen Shirts, Relaxed Shorts, Slides & Sunglasses',
    subtitleAr: 'قمصان كتان خفيفة، شورتات مريحة، كلاكيط ونظارات شمسية',
    subtitleFr: 'Chemises Lin, Shorts, Claquettes & Lunettes',
    targetItemsEn: 'Summer Shirts, Casual Shorts, Slides/Sandals, Sunglasses',
    targetItemsAr: 'قمصان صيفية خفيفة، شورتات كاجوال، كلاكيط مريحة، ونظارات شمسية',
    targetAudienceAr: 'المتسوقون لإطلالات الصيف، العطلات والشاطئ',
    seoDescriptionAr: 'تشكيلة الصيف الرجالية من متجر رشيد: قمصان صيفية باردة، شورتات، صنادل وسلايدز ونظارات شمسية حصرية.',
    seoDescriptionEn: 'Shop Men\'s Summer Essentials: breezy summer shirts, casual shorts, beach slides and designer sunglasses.',
    categoryTypes: [
      { id: 'summer-shirt', nameAr: 'قمصان صيفية', nameEn: 'Summer Shirts' },
      { id: 'shorts', nameAr: 'شورتات كاجوال', nameEn: 'Casual Shorts' },
      { id: 'slides', nameAr: 'كلاكيط وصنادل', nameEn: 'Slides & Sandals' },
      { id: 'sunglasses', nameAr: 'نظارات شمسية', nameEn: 'Sunglasses' },
    ],
    keywords: [
      'صيف', 'صيفي', 'summer', 'été', 'ete',
      'كتان', 'linen', 'شورت', 'shorts', 'short',
      'صندل', 'كلاكيط', 'سلايدز', 'slide', 'slides', 'sandal', 'sandals', 'claquette',
      'نظارة', 'نظارات', 'sunglass', 'sunglasses', 'lunette', 'lunettes'
    ],
  },
  {
    id: 'watches-fragrances',
    slug: 'watches-fragrances',
    nameEn: 'Watches & Fragrances',
    nameAr: 'ساعات وعطور',
    nameFr: 'Montres & Parfums',
    subtitleEn: 'Luxury Timepieces, Signature Perfumes & Accessories',
    subtitleAr: 'ساعات رجالية فاخرة، عطور مميزة، ومحافظ وإكسسوارات',
    subtitleFr: 'Montres, Parfums Exclusifs & Accessoires',
    targetItemsEn: 'Watches, Perfumes, and Accessories',
    targetItemsAr: 'ساعات يد فخمة، عطور رجالية جذابة، إكسسوارات بدون مقاسات معقدة',
    targetAudienceAr: 'المتسوقون للهدايا واللمسات الفاخرة سريعة الشراء',
    seoDescriptionAr: 'تشكيلة الساعات والعطور الرجالية الفاخرة من متجر رشيد. ساعات راقية وعطور استثنائية وإكسسوارات أنيقة.',
    seoDescriptionEn: 'Curated collection of men\'s watches, signature fragrances, and luxury accessories at Rachid Shop.',
    categoryTypes: [
      { id: 'watch', nameAr: 'ساعات يد', nameEn: 'Watches' },
      { id: 'perfume', nameAr: 'عطور رجالية', nameEn: 'Fragrances' },
      { id: 'accessories', nameAr: 'إكسسوارات أخرى', nameEn: 'Accessories' },
    ],
    keywords: [
      'ساعة', 'ساعات', 'watch', 'watches', 'montre', 'montres',
      'عطر', 'عطور', 'perfume', 'fragrance', 'parfum', 'parfums',
      'محفظة', 'حزام', 'حلي', 'إكسسوار', 'accessoire'
    ],
  },
];

/**
 * Checks if a product matches a collection by:
 * 1. Explicit collection tag
 * 2. Explicit subcategory / tags
 * 3. Keyword matching in title and description
 */
export function isProductInCollection(product: Product, collectionSlug: string): boolean {
  if (!product) return false;

  // 1. Explicit collection assignment
  if (product.collections && product.collections.includes(collectionSlug)) {
    return true;
  }

  const coll = LIFESTYLE_COLLECTIONS.find(c => c.slug === collectionSlug);
  if (!coll) return false;

  // 2. Explicit subcategory matching
  if (product.subcategory) {
    const sub = product.subcategory.toLowerCase();
    if (coll.categoryTypes.some(ct => ct.id === sub || sub.includes(ct.id))) {
      return true;
    }
  }

  // 3. Fallback to smart keyword matching
  const searchCorpus = `${product.name} ${product.description || ''} ${product.subcategory || ''} ${(product.tags || []).join(' ')} ${product.category}`.toLowerCase();

  return coll.keywords.some(keyword => searchCorpus.includes(keyword.toLowerCase()));
}

/**
 * Extracts all unique sizes with ACTIVE stock (>0) from a list of products.
 * Handles both apparel sizes (S, M, L, XL, etc.) and shoe sizes (39, 40, 41, etc.).
 */
export function extractAvailableSizes(products: Product[]): string[] {
  const sizeSet = new Set<string>();

  products.forEach(product => {
    if (!product.inventory || product.inventory.length === 0) return;
    product.inventory.forEach(inv => {
      if (inv.stock > 0 && inv.size && inv.size.trim()) {
        sizeSet.add(inv.size.trim());
      }
    });
  });

  const sizes = Array.from(sizeSet);

  // Sort logically: Numeric sizes in ascending order, alpha sizes in standard fashion order
  const alphaOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', 'XXL', '3XL', 'XXXL', '4XL'];

  return sizes.sort((a, b) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);

    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }

    const indexA = alphaOrder.indexOf(a.toUpperCase());
    const indexB = alphaOrder.indexOf(b.toUpperCase());

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    return a.localeCompare(b);
  });
}
