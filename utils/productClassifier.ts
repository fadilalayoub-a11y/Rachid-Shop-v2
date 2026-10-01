import { Product, ProductStyle } from '@/types';

export interface ProductClassification {
  category: 'clothes' | 'shoes' | 'accessories';
  subcategory: string;
  suggestedStyle?: 'old_money' | 'classic' | 'streetwear' | 'sportswear' | 'casual';
  sizePreset: 'clothes' | 'shoes' | 'accessories';
  matchedKeywords: string[];
}

/**
 * خوارزمية ذكية فائقة الدقة ومتعددة اللغات لتحديد نوع وفئة وستايل المنتج تلقائياً
 * تدعم الكلمات بالدارجة المغربية، العربية، الفرنسية، الإنجليزية، الماركات العالمية، وفحص مقاسات الأحذية (39-47)
 */
export function classifyProduct(
  name: string = '',
  description: string = '',
  keywords: string[] = [],
  inventorySizes: string[] = []
): ProductClassification {
  const fullText = `${name} ${description} ${keywords.join(' ')}`.toLowerCase();

  // 1. قواميس الأحذية الموسعة (Shoes & Footwear)
  const shoesKeywords = [
    // أحذية رياضية وسنيكرز مع دعم مختلف أشكال الإملاء (ذ / د)
    'حذاء', 'حداء', 'أحذية', 'احذية', 'احذيه', 'سنيكرز', 'سنيكر', 'سبادري', 'سباط', 'باط', 'بوط', 'صندل', 'صنادل',
    'كلاكيط', 'كلاكيت', 'نعال', 'شحاطة', 'موكاسان', 'موكاسين', 'شوز', 'جري', 'حذاء رياضي', 'حداء رياضي', 'حذاء جري', 'حداء جري',
    'بوط جلد', 'حذاء كلاسيك', 'حذاء رسمي', 'حذاء قماش', 'حذاء جلد',
    // مصطلحات وماركات الأحذية العالمية
    'sneaker', 'sneakers', 'shoe', 'shoes', 'running', 'runner', 'loafer', 'loafers',
    'sandal', 'sandals', 'slides', 'slide', 'moccasin', 'moccasins', 'boots', 'boot',
    'chaussure', 'chaussures', 'claquette', 'claquettes', 'sandale', 'sandales', 'baskets', 'basket',
    'mocassin', 'mocassins', 'espadrille', 'espadrilles', 'derbies', 'richelieu', 'bottines',
    'dunk', 'jordan', 'air max', 'air force', 'yeezy', 'samba', 'gazelle', 'campus',
    'stan smith', 'new balance', 'asics', 'salomon', 'birkenstock', 'crocs', 'chelsea boot'
  ];

  // 2. قواميس الإكسسوارات (Accessories)
  const accessoriesKeywords = [
    'ساعة', 'ساعات', 'عطر', 'عطور', 'برفان', 'برفيوم', 'كاسكيط', 'قبعة', 'طاقية', 'كاب',
    'نظارة', 'نظارات', 'شمسية', 'حقيبة', 'شنطة', 'صاك', 'صاكوش', 'محفظة', 'حزام', 'سمطة',
    'سوار', 'خاتم', 'سلسال', 'ميدالية', 'محفظة نقود', 'ربطة عنق', 'كرافاط', 'عقد',
    'watch', 'watches', 'perfume', 'fragrance', 'cologne', 'cap', 'caps', 'hat', 'hats',
    'sunglasses', 'glasses', 'bag', 'bags', 'backpack', 'wallet', 'belt', 'belts', 'tie',
    'montre', 'montres', 'parfum', 'parfums', 'casquette', 'casquettes', 'chapeau',
    'lunette', 'lunettes', 'sac', 'sacs', 'sacoche', 'portefeuille', 'ceinture', 'ceintures'
  ];

  // 3. قواميس الملابس (Clothes)
  const clothesKeywords = [
    'تيشيرت', 'تيشرت', 'قميص', 'شوميز', 'بولو', 'هودي', 'هوديز', 'سويت شيرت', 'سويتشيرت',
    'سروال', 'بنطلون', 'جينز', 'دجين', 'دجينز', 'سروال دجين', 'سروال قماش', 'كيطمة', 'سورفيت',
    'شورت', 'جاكيت', 'فيست', 'معطف', 'مونطو', 'تريكو', 'بولوفير', 'جيليه', 'بدلة', 'كوستيم',
    't-shirt', 'tshirt', 'shirt', 'polo', 'hoodie', 'hoodies', 'sweatshirt', 'sweat',
    'pants', 'trouser', 'trousers', 'jeans', 'jean', 'tracksuit', 'sweatpants', 'shorts',
    'jacket', 'coat', 'blazer', 'suit', 'sweater', 'vest', 'cardigan',
    'chemise', 'pantalon', 'survêtement', 'survetement', 'veste', 'manteau', 'costume'
  ];

  const matches = (list: string[]) => list.some(word => fullText.includes(word.toLowerCase()));

  // فحص ذكي: هل مقاسات المنتج رقمية تخص الأحذية (38 إلى 47)؟
  const hasShoeNumericSizes = inventorySizes.length > 0 && inventorySizes.some(sz => {
    const num = parseInt(sz, 10);
    return !isNaN(num) && num >= 37 && num <= 48;
  });

  // تحديد القسم الرئيسي
  let category: 'clothes' | 'shoes' | 'accessories' = 'clothes';
  let sizePreset: 'clothes' | 'shoes' | 'accessories' = 'clothes';

  if (matches(shoesKeywords) || hasShoeNumericSizes) {
    category = 'shoes';
    sizePreset = 'shoes';
  } else if (matches(accessoriesKeywords)) {
    category = 'accessories';
    sizePreset = 'accessories';
  } else {
    category = 'clothes';
    sizePreset = 'clothes';
  }

  // ===================================
  // تحديد الفئة الفرعية (Subcategory) بدقة
  // ===================================
  let subcategory = 'general';

  if (category === 'shoes') {
    if (matches(['سنيكرز', 'سنيكر', 'سبادري', 'جري', 'رياضي', 'sneaker', 'sneakers', 'running', 'baskets', 'basket', 'dunk', 'jordan', 'air', 'samba', 'gazelle', 'campus', 'new balance', 'asics', 'salomon'])) {
      subcategory = 'sneakers';
    } else if (matches(['موكاسان', 'موكاسين', 'كلاسيك', 'رسمي', 'جلد', 'loafer', 'loafers', 'formal', 'chaussures de ville', 'mocassin', 'derbies', 'richelieu', 'oxford'])) {
      subcategory = 'formal-shoes';
    } else if (matches(['صندل', 'صنادل', 'كلاكيط', 'كلاكيت', 'نعال', 'sandal', 'sandals', 'slides', 'claquette', 'claquettes', 'birkenstock', 'crocs', 'mule'])) {
      subcategory = 'sandals';
    } else if (matches(['بوط', 'boot', 'boots', 'bottines', 'chelsea'])) {
      subcategory = 'boots';
    } else {
      subcategory = 'casual-shoes';
    }
  } else if (category === 'accessories') {
    if (matches(['ساعة', 'ساعات', 'watch', 'watches', 'montre', 'montres'])) {
      subcategory = 'watches';
    } else if (matches(['عطر', 'عطور', 'برفان', 'برفيوم', 'perfume', 'fragrance', 'cologne', 'parfum'])) {
      subcategory = 'perfumes';
    } else if (matches(['كاسكيط', 'قبعة', 'طاقية', 'كاب', 'cap', 'caps', 'hat', 'casquette'])) {
      subcategory = 'caps-hats';
    } else if (matches(['حقيبة', 'شنطة', 'صاك', 'صاكوش', 'backpack', 'bag', 'bags', 'sac', 'sacoche'])) {
      subcategory = 'bags';
    } else if (matches(['نظارة', 'نظارات', 'شمسية', 'sunglasses', 'lunette', 'lunettes'])) {
      subcategory = 'sunglasses';
    } else if (matches(['حزام', 'سمطة', 'belt', 'ceinture', 'محفظة', 'wallet', 'portefeuille'])) {
      subcategory = 'wallets-belts';
    } else {
      subcategory = 'accessories';
    }
  } else {
    // Clothes subcategories
    if (matches(['تيشيرت', 'تيشرت', 't-shirt', 'tshirt'])) {
      subcategory = 't-shirts';
    } else if (matches(['بولو', 'polo'])) {
      subcategory = 'polo';
    } else if (matches(['هودي', 'هوديز', 'سويت شيرت', 'سويتشيرت', 'hoodie', 'hoodies', 'sweatshirt', 'sweat'])) {
      subcategory = 'hoodies';
    } else if (matches(['قميص', 'شوميز', 'كتان', 'shirt', 'linen', 'chemise'])) {
      subcategory = 'shirts';
    } else if (matches(['جينز', 'دجين', 'دجينز', 'jeans', 'jean', 'denim'])) {
      subcategory = 'jeans';
    } else if (matches(['كيطمة', 'سورفيت', 'سراويل رياضية', 'sweatpants', 'trackpants', 'jogger', 'survêtement'])) {
      subcategory = 'sweatpants';
    } else if (matches(['سروال قماش', 'كلاسيك', 'trouser', 'trousers', 'pantalon'])) {
      subcategory = 'trousers';
    } else if (matches(['شورت', 'shorts', 'short', 'bermuda'])) {
      subcategory = 'shorts';
    } else if (matches(['جاكيت', 'فيست', 'معطف', 'مونطو', 'jacket', 'coat', 'veste', 'blazer'])) {
      subcategory = 'jackets';
    } else {
      subcategory = 'apparel';
    }
  }

  // ===================================
  // اقتراح الستايل التلقائي (Suggested Style)
  // ===================================
  let suggestedStyle: 'old_money' | 'classic' | 'streetwear' | 'sportswear' | 'casual' = 'casual';

  if (matches(['أولد ماني', 'كتان', 'بولو', 'موكاسان', 'فخم', 'old money', 'polo', 'linen', 'quiet luxury', 'loafer', 'moccasin'])) {
    suggestedStyle = 'old_money';
  } else if (matches(['كلاسيك', 'رسمي', 'بدلة', 'كوستيم', 'قميص أبيض', 'جلد طبيعي', 'classic', 'formal', 'suit', 'blazer', 'oxford', 'richelieu'])) {
    suggestedStyle = 'classic';
  } else if (matches(['ستريت', 'أوفرسايز', 'اوفر سايز', 'هودي', 'urban', 'streetwear', 'oversize', 'oversized', 'graphic', 'dunk', 'jordan', 'yeezy'])) {
    suggestedStyle = 'streetwear';
  } else if (matches(['رياضي', 'كيطمة', 'تمرين', 'جيم', 'جري', 'sport', 'sportswear', 'gym', 'fitness', 'running', 'runner', 'survetement'])) {
    suggestedStyle = 'sportswear';
  } else {
    suggestedStyle = 'casual';
  }

  return {
    category,
    subcategory,
    suggestedStyle,
    sizePreset,
    matchedKeywords: [],
  };
}

/**
 * دالة مساعدة للحصول على القسم الفعلي للمنتج مع تصحيح تلقائي فوري
 */
export function getProductEffectiveCategory(product: Product): 'clothes' | 'shoes' | 'accessories' {
  if (!product) return 'clothes';
  
  // إذا كان مصنفاً كأحذية صراحة
  if (product.category === 'shoes' || product.category_id === 'shoes') return 'shoes';
  // إذا كان مصنفاً كإكسسوارات صراحة
  if (product.category === 'accessories' || product.category_id === 'accessories') return 'accessories';

  // إذا كان مسجلاً بالخطأ كـ clothes أو غير محدد، نقوم بفحصه ذكياً
  const inventorySizes = product.inventory?.map(i => i.size) || product.sizes || [];
  const classified = classifyProduct(
    product.name || product.title || '',
    product.description || '',
    product.tags || [],
    inventorySizes
  );

  return classified.category;
}

/**
 * دالة مساعدة للحصول على الفئة الفرعية الفعلية للمنتج
 */
export function getProductEffectiveSubcategory(product: Product): string {
  if (product.subcategory && product.subcategory !== 'general') {
    return product.subcategory;
  }
  const inventorySizes = product.inventory?.map(i => i.size) || product.sizes || [];
  const classified = classifyProduct(
    product.name || product.title || '',
    product.description || '',
    product.tags || [],
    inventorySizes
  );
  return classified.subcategory;
}

