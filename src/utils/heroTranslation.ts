import { Language } from '../context/LanguageContext';

// Comprehensive dictionary for standard hero texts and common promotional phrases across Arabic, French, and English
interface TranslationEntry {
  ar: string;
  fr: string;
  en: string;
}

const PHRASE_DICTIONARY: TranslationEntry[] = [
  // Titles
  {
    ar: 'اكتشف أحدث صيحات الموضة',
    fr: 'Découvrez les dernières tendances de la mode',
    en: 'Discover the latest fashion trends'
  },
  {
    ar: 'أناقة لا مثيل لها',
    fr: 'Une élégance incomparable',
    en: 'Unmatched elegance'
  },
  {
    ar: 'تخفيضات وعروض حصرية',
    fr: 'Promotions et offres exclusives',
    en: 'Exclusive sales & special offers'
  },
  {
    ar: 'إطلالة عصرية تناسب أسلوبك',
    fr: 'Un look moderne adapté à votre style',
    en: 'A modern look tailored to your style'
  },
  {
    ar: 'تشكيلة الموسم الجديد',
    fr: 'Nouvelle collection de la saison',
    en: 'New season collection'
  },
  {
    ar: 'أزياء فاخرة وجودة استثنائية',
    fr: 'Mode raffinée et qualité exceptionnelle',
    en: 'Luxury fashion & exceptional quality'
  },
  {
    ar: 'تشكيلة الأحذية العصرية',
    fr: 'Collection de chaussures tendance',
    en: 'Trendy footwear collection'
  },
  {
    ar: 'الملابس الأكثر طلباً',
    fr: 'Les vêtements les plus demandés',
    en: 'Best-selling apparel'
  },
  {
    ar: 'تخفيضات كبرى',
    fr: 'Grandes promotions',
    en: 'Major discounts'
  },
  {
    ar: 'عروض حصرية لفترة محدودة',
    fr: 'Offres exclusives pour une durée limitée',
    en: 'Exclusive limited-time offers'
  },

  // Subtitles
  {
    ar: 'تشكيلة رائعة من الملابس والأحذية العصرية التي تناسب ذوقك وتمنحك إطلالة فريدة ومتميزة في كل مناسبة.',
    fr: 'Une magnifique collection de vêtements et chaussures modernes adaptées à votre goût pour un style remarquable en toute occasion.',
    en: 'A stunning collection of modern clothes and shoes tailored to your taste, giving you a unique and distinguished look for every occasion.'
  },
  {
    ar: 'تصاميم مختارة بعناية فائقة لتجمع بين الجودة العالية والراحة اليومية.',
    fr: 'Des designs méticuleusement sélectionnés alliant haute qualité et confort quotidien.',
    en: 'Carefully curated designs combining high quality and everyday comfort.'
  },
  {
    ar: 'استمتع بأفضل الأسعار وأقوى العروض على التشكيلات الأكثر طلباً.',
    fr: 'Profitez des meilleurs prix et des offres les plus avantageuses sur nos collections les plus demandées.',
    en: 'Enjoy the best prices and top deals on our most sought-after collections.'
  },
  {
    ar: 'كل ما تحتاجه لتجديد مظهرك العصري في مكان واحد وبأفضل جودة.',
    fr: 'Tout ce dont vous avez besoin pour renouveler votre style au même endroit et avec la meilleure qualité.',
    en: 'Everything you need to refresh your modern look in one place with top-notch quality.'
  },
  {
    ar: 'اكتشف مجموعتنا الحصرية المصممة لتلائم كافة الأوقات بأفضل الأسعار.',
    fr: 'Découvrez notre sélection exclusive pensée pour toutes les occasions au meilleur prix.',
    en: 'Discover our exclusive collection crafted for all occasions at the best prices.'
  },

  // Badges
  {
    ar: 'وصل حديثاً',
    fr: 'Nouveauté',
    en: 'New Arrival'
  },
  {
    ar: 'عرض حصري',
    fr: 'Offre exclusive',
    en: 'Exclusive Offer'
  },
  {
    ar: 'تخفيضات خاصة',
    fr: 'Promotions spéciales',
    en: 'Special Sale'
  },
  {
    ar: 'الأكثر مبيعاً',
    fr: 'Meilleures ventes',
    en: 'Best Seller'
  },
  {
    ar: 'توصيل مجاني',
    fr: 'Livraison gratuite',
    en: 'Free Delivery'
  },

  // CTA Buttons
  {
    ar: 'تسوق الآن',
    fr: 'Acheter maintenant',
    en: 'Shop now'
  },
  {
    ar: 'استكشف المجموعة',
    fr: 'Découvrir la collection',
    en: 'Explore collection'
  },
  {
    ar: 'تسوق العروض',
    fr: 'Découvrir les offres',
    en: 'Shop offers'
  },
  {
    ar: 'اكتشف المزيد',
    fr: 'En savoir plus',
    en: 'Discover more'
  },
  {
    ar: 'عرض المنتجات',
    fr: 'Voir les produits',
    en: 'View products'
  },
  {
    ar: 'ابدأ التسوق',
    fr: 'Commencer vos achats',
    en: 'Start shopping'
  }
];

// Normalize text for comparison (removes diacritics, extra spaces, trailing punctuation)
function cleanText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[.,!؟;:]+$/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Translates any hero/banner text (title, subtitle, badge, cta)
 * from whatever source language it is in (Arabic, French, English)
 * to the target language selected by the user.
 */
export function translateHeroText(text: string | undefined | null, targetLang: Language): string {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (!trimmed) return '';

  const cleaned = cleanText(trimmed);

  // Check in dictionary
  for (const entry of PHRASE_DICTIONARY) {
    if (
      cleanText(entry.ar) === cleaned ||
      cleanText(entry.fr) === cleaned ||
      cleanText(entry.en) === cleaned
    ) {
      return entry[targetLang];
    }
  }

  // Common partial or keyword heuristics
  if (targetLang === 'ar') {
    if (cleaned.includes('shop now') || cleaned.includes('acheter') || cleaned.includes('magasiner')) return 'تسوق الآن';
    if (cleaned.includes('collection') || cleaned.includes('explore')) return 'استكشف المجموعة';
    if (cleaned.includes('discover') || cleaned.includes('découvrez')) return 'اكتشف المزيد';
    if (cleaned.includes('new arrival') || cleaned.includes('nouveauté')) return 'وصل حديثاً';
    if (cleaned.includes('exclusive') || cleaned.includes('exclusif')) return 'عرض حصري';
    if (cleaned.includes('sale') || cleaned.includes('promo') || cleaned.includes('solde')) return 'تخفيضات خاصة';
  } else if (targetLang === 'fr') {
    if (cleaned.includes('مجموع') || cleaned.includes('استكشف') || cleaned.includes('collection') || cleaned.includes('explore')) return 'Découvrir la collection';
    if (cleaned.includes('تسوق') || cleaned.includes('shop now')) return 'Acheter maintenant';
    if (cleaned.includes('اكتشف') || cleaned.includes('discover')) return 'Découvrir la collection';
    if (cleaned.includes('حديث') || cleaned.includes('new arrival')) return 'Nouveautés';
    if (cleaned.includes('حصري') || cleaned.includes('exclusive')) return 'Offre exclusive';
    if (cleaned.includes('تخفيض') || cleaned.includes('عرض') || cleaned.includes('sale')) return 'Promotions exclusives';
  } else { // en
    if (cleaned.includes('مجموع') || cleaned.includes('استكشف') || cleaned.includes('collection') || cleaned.includes('explore')) return 'Explore Collection';
    if (cleaned.includes('تسوق') || cleaned.includes('acheter')) return 'Shop Now';
    if (cleaned.includes('اكتشف') || cleaned.includes('découvr')) return 'Discover Collection';
    if (cleaned.includes('حديث') || cleaned.includes('nouveaut')) return 'New Arrivals';
    if (cleaned.includes('حصري') || cleaned.includes('exclusif')) return 'Exclusive Offer';
    if (cleaned.includes('تخفيض') || cleaned.includes('promo') || cleaned.includes('solde')) return 'Special Deals';
  }

  // If text already has no match and cannot be parsed, return original trimmed
  return trimmed;
}
