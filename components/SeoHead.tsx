'use client';

import { useEffect } from 'react';
import { Product } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { getLocalizedProductName, getLocalizedProductDescription } from '@/utils/productLocalization';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product';
  product?: Product | null;
  category?: 'home' | 'clothes' | 'shoes' | 'accessories' | 'collection';
  collectionTitle?: string;
  currency?: string;
}

export function SeoHead({
  title,
  description,
  image,
  url,
  type = 'website',
  product,
  category = 'home',
  collectionTitle,
  currency = 'MAD'
}: SeoProps) {
  const { language } = useLanguage();

  useEffect(() => {
    const fullOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    // 1. تحديد العنوان والميتا تلقائياً بناء على المنتج أو القسم واللغة النشطة (AR / EN / FR)
    let finalTitle = title;
    let finalDescription = description;
    let finalImage = image;

    if (product) {
      const locName = getLocalizedProductName(product, language);
      const locDesc = getLocalizedProductDescription(product, language);

      if (language === 'en') {
        finalTitle = `${locName} - Men's Fashion | RACHID SHOP`;
        finalDescription = locDesc || `Buy ${locName} at RACHID SHOP with high quality and fast delivery across Morocco.`;
      } else if (language === 'fr') {
        finalTitle = `${locName} - Mode Homme | RACHID SHOP`;
        finalDescription = locDesc || `Achetez ${locName} sur RACHID SHOP avec une qualité premium et livraison rapide au Maroc.`;
      } else {
        finalTitle = `${locName} - متجر رشيد | RACHID SHOP`;
        finalDescription = locDesc || `اشتري الآن ${locName} بأفضل الأسعار وأعلى جودة من متجر رشيد. متوفر بمقاسات متعددة وتوصيل سريع.`;
      }

      finalImage = product.image ? (product.image.startsWith('http') ? product.image : `${fullOrigin}${product.image}`) : undefined;
    } else if (collectionTitle) {
      if (language === 'en') {
        finalTitle = `${collectionTitle} - Curated Men's Styles | RACHID SHOP`;
        finalDescription = description || `Shop the ${collectionTitle} luxury menswear collection at RACHID SHOP.`;
      } else if (language === 'fr') {
        finalTitle = `${collectionTitle} - Collection Style Homme | RACHID SHOP`;
        finalDescription = description || `Découvrez la collection ${collectionTitle} pour homme chez RACHID SHOP.`;
      } else {
        finalTitle = `${collectionTitle} - تشكيلات متجر رشيد | RACHID SHOP`;
        finalDescription = description || `تسوق تشكيلة ${collectionTitle} الفاخرة للرجال من متجر رشيد. أزياء مختارة بأعلى جودة مع توصيل سريع.`;
      }
    } else if (!finalTitle) {
      if (category === 'shoes') {
        if (language === 'en') {
          finalTitle = 'Men\'s Shoes & Sneakers Collection - RACHID SHOP';
          finalDescription = 'Explore premium sneakers, casual footwear, and handcrafted leather shoes at RACHID SHOP.';
        } else if (language === 'fr') {
          finalTitle = 'Chaussures & Baskets Homme - RACHID SHOP';
          finalDescription = 'Achetez des baskets élégantes, chaussures classiques et mocassins en cuir haut de gamme sur RACHID SHOP.';
        } else {
          finalTitle = 'أحذية رجالية ونسائية عصرية - متجر رشيد | RACHID SHOP';
          finalDescription = 'تسوق أحدث تشكيلات الأحذية الرياضية والكلاسيكية المريحة بأفضل الأسعار وأعلى جودة من متجر رشيد.';
        }
      } else if (category === 'clothes') {
        if (language === 'en') {
          finalTitle = 'Men\'s Contemporary Clothing & Apparel - RACHID SHOP';
          finalDescription = 'Shop premium t-shirts, jackets, hoodies, and refined trousers at RACHID SHOP.';
        } else if (language === 'fr') {
          finalTitle = 'Vêtements Homme Tendance & Haut de Gamme - RACHID SHOP';
          finalDescription = 'Large choix de t-shirts, vestes, sweats à capuche et pantalons élégants sur RACHID SHOP.';
        } else {
          finalTitle = 'ملابس أنيقة وعصرية لجميع الإطلالات - متجر رشيد | RACHID SHOP';
          finalDescription = 'تشكيلة مميزة من الملابس العصرية الأنيقة التي تناسب ذوقك وتمنحك إطلالة فريدة ومتميزة من متجر رشيد.';
        }
      } else if (category === 'accessories') {
        if (language === 'en') {
          finalTitle = 'Luxury Men\'s Accessories, Watches & Fragrances - RACHID SHOP';
          finalDescription = 'Complete your refined look with premium watches, perfumes, caps, and sunglasses at RACHID SHOP.';
        } else if (language === 'fr') {
          finalTitle = 'Accessoires Homme de Luxe, Montres & Parfums - RACHID SHOP';
          finalDescription = 'Sublimez votre style avec notre sélection de montres, parfums, casquettes et lunettes de soleil chez RACHID SHOP.';
        } else {
          finalTitle = 'إكسسوارات راقية تكمل أناقتك - متجر رشيد | RACHID SHOP';
          finalDescription = 'استكشف تشكيلتنا الفاخرة من الإكسسوارات الرجالية والنسائية المميزة في متجر رشيد.';
        }
      } else {
        if (language === 'en') {
          finalTitle = 'RACHID SHOP - Luxury Men\'s Fashion, Shoes & Contemporary Apparel';
          finalDescription = 'Shop the finest men\'s clothing, sneakers, loafers, and curated fashion essentials at RACHID SHOP.';
        } else if (language === 'fr') {
          finalTitle = 'RACHID SHOP - Mode Masculine Haut de Gamme, Chaussures & Prêt-à-Porter';
          finalDescription = 'Découvrez les dernières tendances de vêtements pour hommes et chaussures de luxe sur RACHID SHOP.';
        } else {
          finalTitle = 'متجر رشيد | RACHID SHOP - أحدث صيحات الموضة والأحذية والملابس';
          finalDescription = 'متجر رشيد RACHID SHOP وجهتك الأولى لتسوق أرقى الملابس والأحذية العصرية بأفضل الأسعار وجودة أصلية مع توصيل سريع.';
        }
      }
    }

    // 2. تحديث عنوان الصفحة ولغة الوثيقة
    document.title = finalTitle || 'RACHID SHOP';
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';

    // مساعد لتحديث أو إنشاء وسوم الميتا
    const setMetaTag = (attr: 'name' | 'property', key: string, content: string) => {
      let meta = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, key);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // 3. تحديث وسوم الميتا القياسية و Open Graph و Twitter
    setMetaTag('name', 'description', finalDescription || '');
    setMetaTag('property', 'og:title', finalTitle || '');
    setMetaTag('property', 'og:description', finalDescription || '');
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:type', product ? 'product' : type);
    setMetaTag('property', 'og:site_name', 'RACHID SHOP');
    setMetaTag('property', 'og:locale', language === 'ar' ? 'ar_MA' : language === 'fr' ? 'fr_FR' : 'en_US');

    if (finalImage) {
      setMetaTag('property', 'og:image', finalImage);
      setMetaTag('name', 'twitter:image', finalImage);
    }

    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', finalTitle || '');
    setMetaTag('name', 'twitter:description', finalDescription || '');

    // 4. تحديث وسوم hreflang الثلاثة المعتمدة لدى قوقل
    try {
      const urlObj = new URL(currentUrl, window.location.origin);
      urlObj.searchParams.delete('lang');
      const baseCleanUrl = urlObj.origin + urlObj.pathname;

      const langs: ('ar' | 'en' | 'fr')[] = ['ar', 'en', 'fr'];
      langs.forEach(l => {
        let hreflangTag = document.querySelector(`link[rel="alternate"][hreflang="${l}"]`) as HTMLLinkElement | null;
        if (!hreflangTag) {
          hreflangTag = document.createElement('link');
          hreflangTag.rel = 'alternate';
          hreflangTag.setAttribute('hreflang', l);
          document.head.appendChild(hreflangTag);
        }
        hreflangTag.href = `${baseCleanUrl}?lang=${l}`;
      });

      let defaultHreflang = document.querySelector('link[rel="alternate"][hreflang="x-default"]') as HTMLLinkElement | null;
      if (!defaultHreflang) {
        defaultHreflang = document.createElement('link');
        defaultHreflang.rel = 'alternate';
        defaultHreflang.setAttribute('hreflang', 'x-default');
        document.head.appendChild(defaultHreflang);
      }
      defaultHreflang.href = baseCleanUrl;

      // تحديث الرابط الأساسي Canonical
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = language === 'ar' ? baseCleanUrl : `${baseCleanUrl}?lang=${language}`;
    } catch (e) {
      // Ignored in SSR
    }

    // 5. حقن البيانات المنظمة Schema.org JSON-LD لقوقل (Googlebot Rich Snippets)
    const jsonLdId = 'structured-data-jsonld';
    let scriptTag = document.getElementById(jsonLdId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = jsonLdId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    if (product) {
      const locName = getLocalizedProductName(product, language);
      const locDesc = getLocalizedProductDescription(product, language);
      const totalStock = product.inventory?.reduce((sum, item) => sum + item.stock, 0) || 0;
      const inStock = totalStock > 0;

      const productSchema = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        'name': locName,
        'image': finalImage || product.image,
        'description': locDesc || finalDescription,
        'sku': product.id,
        'inLanguage': language,
        'brand': {
          '@type': 'Brand',
          'name': 'RACHID SHOP'
        },
        'offers': {
          '@type': 'Offer',
          'url': currentUrl,
          'priceCurrency': currency === 'درهم' ? 'MAD' : currency,
          'price': product.price,
          'priceValidUntil': '2027-12-31',
          'itemCondition': 'https://schema.org/NewCondition',
          'availability': inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          'seller': {
            '@type': 'Organization',
            'name': 'RACHID SHOP'
          }
        }
      };
      scriptTag.textContent = JSON.stringify(productSchema);
    } else {
      const storeSchema = {
        '@context': 'https://schema.org',
        '@type': 'OnlineStore',
        'name': 'RACHID SHOP',
        'url': fullOrigin,
        'description': finalDescription,
        'inLanguage': language,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': `${fullOrigin}/?search={search_term_string}&lang=${language}`,
          'query-input': 'required name=search_term_string'
        }
      };
      scriptTag.textContent = JSON.stringify(storeSchema);
    }

  }, [title, description, image, url, type, product, category, collectionTitle, currency, language]);

  return null;
}
