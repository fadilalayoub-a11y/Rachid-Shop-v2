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
  {
    id: 'classic-style',
    slug: 'classic-style',
    nameEn: 'Classic Style',
    nameAr: 'ستايل كلاسيكي',
    nameFr: 'Style Classique',
    subtitleEn: 'Refined Formal Shirts, Tailored Trousers & Leather Footwear',
    subtitleAr: 'أناقة رسمية راقية: قمصان فخمة، سراويل قماش وأحذية جلدية كلاسيكية',
    subtitleFr: 'Chemises Élégantes, Pantalons & Chaussures Habillées',
    targetItemsEn: 'Shirts, Tailored Trousers, Formal Leather Shoes, Watches',
    targetItemsAr: 'قمصان رسمية، سراويل قماشية، أحذية جلدية وساعات راقية',
    targetAudienceAr: 'عشاق الأناقة الرسمية والرقي في المناسبات وبيئة العمل',
    seoDescriptionAr: 'تسوق تشكيلة الملابس الكلاسيكية للرجال من متجرنا: قمصان راقية، أحذية جلدية وساعات كلاسيكية.',
    seoDescriptionEn: 'Explore classic men\'s collection: tailored shirts, formal trousers and premium leather footwear.',
    categoryTypes: [
      { id: 'shirt', nameAr: 'قمصان كلاسيكية', nameEn: 'Classic Shirts' },
      { id: 'trousers', nameAr: 'سراويل قماش', nameEn: 'Trousers' },
      { id: 'casual-shoe', nameAr: 'أحذية جلدية رسمية', nameEn: 'Formal Shoes' },
      { id: 'watch', nameAr: 'ساعات يد', nameEn: 'Watches' },
    ],
    keywords: [
      'كلاسيك', 'كلاسيكي', 'classic', 'classique', 'رسمي', 'formal',
      'قميص', 'chemise', 'shirt', 'جلد', 'لوفر', 'mocassin', 'حذاء كلاسيكي'
    ],
  },
  {
    id: 'old-money',
    slug: 'old-money',
    nameEn: 'Old Money',
    nameAr: 'أولد ماني',
    nameFr: 'Old Money',
    subtitleEn: 'Timeless Elegance, Quiet Luxury & Prestigious Aesthetics',
    subtitleAr: 'فخامة هادئة، خامات كتان وبولو فاخرة، وأناقة أرستقراطية متوارثة',
    subtitleFr: 'Élégance Intemporelle & Luxe Discret',
    targetItemsEn: 'Polo Shirts, Linen Shirts, Neutral Knitwear, Loafers, Minimal Watches',
    targetItemsAr: 'تيشيرتات بولو، قمصان كتان، أحذية موكاسان لوفر، وساعات مينيمال',
    targetAudienceAr: 'عشاق ستايل الأولد ماني والفخامة الهادئة ذات الطابع الملكي',
    seoDescriptionAr: 'تشكيلة أولد ماني الحصرية: ملابس رجالية تجمع بين الفخامة الهادئة والأناقة الكلاسيكية الخالدة.',
    seoDescriptionEn: 'Discover the Old Money aesthetic for men: quiet luxury, premium linen, refined polo shirts and loafers.',
    categoryTypes: [
      { id: 'shirt', nameAr: 'قمصان وبولو راقية', nameEn: 'Polos & Shirts' },
      { id: 'casual-shoe', nameAr: 'أحذية لوفر وموكاسان', nameEn: 'Loafers' },
      { id: 'trousers', nameAr: 'سراويل شينو وقماش', nameEn: 'Trousers' },
      { id: 'watch', nameAr: 'ساعات راقية', nameEn: 'Luxury Watches' },
    ],
    keywords: [
      'أولد ماني', 'اولد ماني', 'old money', 'quiet luxury', 'polo', 'بولو',
      'كتان', 'linen', 'لوفر', 'loafer', 'loafers', 'موكاسان', 'كشمير', 'cashmere'
    ],
  },
  {
    id: 'streetwear',
    slug: 'streetwear',
    nameEn: 'Streetwear',
    nameAr: 'لبس الشارع',
    nameFr: 'Streetwear',
    subtitleEn: 'Urban Culture, Oversized Fits & Contemporary Street Trends',
    subtitleAr: 'ثقافة الشارع العصرية: قصات أوفرسايز، ستايل أوربان، هوديز وسنيكرز حصرية',
    subtitleFr: 'Mode Urbaine, Coupes Oversize & Sneakers',
    targetItemsEn: 'Oversized Tees, Heavyweight Hoodies, Cargo Pants, Sneakers, Caps',
    targetItemsAr: 'تيشيرتات أوفرسايز، هوديز قطنية سميكة، بناطيل كارجو، وسنيكرز',
    targetAudienceAr: 'عشاق الموضة الشبابية وإطلالات الشارع الجريئة والمميزة',
    seoDescriptionAr: 'أحدث تشكيلات لبس الشارع (ستريت وير) والملابس الحضرية الأوفرسايز للرجال بجودة استثنائية وأسعار مميزة.',
    seoDescriptionEn: 'Shop modern men\'s streetwear: oversized graphic tees, heavyweight hoodies, cargo pants and sneakers.',
    categoryTypes: [
      { id: 'hoodies', nameAr: 'هوديز وسويت شيرت', nameEn: 'Hoodies' },
      { id: 'jacket', nameAr: 'جواكت أوربان وبومبر', nameEn: 'Urban Jackets' },
      { id: 'sneakers', nameAr: 'سنيكرز وتريندات', nameEn: 'Sneakers' },
      { id: 'caps', nameAr: 'قبعات وكابات', nameEn: 'Caps' },
    ],
    keywords: [
      'لبس الشارع', 'لبس شارع', 'ستريت وير', 'ستريت', 'streetwear', 'street', 'أوفرسايز', 'اوفرسايز',
      'oversize', 'oversized', 'hoodie', 'هودي', 'كارجو', 'cargo', 'سنيكرز', 'كاب', 'cap'
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
