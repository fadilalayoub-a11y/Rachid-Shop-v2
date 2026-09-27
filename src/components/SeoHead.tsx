import { useEffect } from 'react';
import { Product } from '../types';

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
  useEffect(() => {
    const fullOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    // 1. تحديد العنوان والميتا تلقائياً بناء على المنتج أو القسم
    let finalTitle = title;
    let finalDescription = description;
    let finalImage = image;

    if (product) {
      finalTitle = `${product.name} - متجر رشيد | RACHID SHOP`;
      finalDescription = product.description || `اشتري الآن ${product.name} بأفضل الأسعار وأعلى جودة من متجر رشيد. متوفر بمقاسات متعددة وتوصيل سريع.`;
      finalImage = product.image ? (product.image.startsWith('http') ? product.image : `${fullOrigin}${product.image}`) : undefined;
    } else if (collectionTitle) {
      finalTitle = `${collectionTitle} - تشكيلات متجر رشيد | RACHID SHOP`;
      finalDescription = description || `تسوق تشكيلة ${collectionTitle} الفاخرة للرجال من متجر رشيد. أزياء مختارة بأعلى جودة مع توصيل سريع.`;
    } else if (!finalTitle) {
      switch (category) {
        case 'shoes':
          finalTitle = 'أحذية رجالية ونسائية عصرية - متجر رشيد | RACHID SHOP';
          finalDescription = 'تسوق أحدث تشكيلات الأحذية الرياضية والكلاسيكية المريحة بأفضل الأسعار وأعلى جودة من متجر رشيد.';
          break;
        case 'clothes':
          finalTitle = 'ملابس أنيقة وعصرية لجميع الإطلالات - متجر رشيد | RACHID SHOP';
          finalDescription = 'تشكيلة مميزة من الملابس العصرية الأنيقة التي تناسب ذوقك وتمنحك إطلالة فريدة ومتميزة من متجر رشيد.';
          break;
        case 'accessories':
          finalTitle = 'إكسسوارات راقية تكمل أناقتك - متجر رشيد | RACHID SHOP';
          finalDescription = 'استكشف تشكيلتنا الفاخرة من الإكسسوارات الرجالية والنسائية المميزة في متجر رشيد.';
          break;
        default:
          finalTitle = 'متجر رشيد | RACHID SHOP - أحدث صيحات الموضة والأحذية والملابس';
          finalDescription = 'متجر رشيد RACHID SHOP وجهتك الأولى لتسوق أرقى الملابس والأحذية العصرية بأفضل الأسعار وجودة أصلية مع توصيل سريع.';
          break;
      }
    }

    if (!finalDescription) {
      finalDescription = 'متجر رشيد RACHID SHOP وجهتك الأولى لتسوق أرقى الملابس والأحذية العصرية بأفضل الأسعار.';
    }

    // 2. تحديث عنوان الصفحة
    document.title = finalTitle;

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
    setMetaTag('name', 'description', finalDescription);
    setMetaTag('property', 'og:title', finalTitle);
    setMetaTag('property', 'og:description', finalDescription);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:type', product ? 'product' : type);
    setMetaTag('property', 'og:site_name', 'RACHID SHOP');

    if (finalImage) {
      setMetaTag('property', 'og:image', finalImage);
      setMetaTag('name', 'twitter:image', finalImage);
    }

    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', finalTitle);
    setMetaTag('name', 'twitter:description', finalDescription);

    // 4. تحديث الرابط الأساسي Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = currentUrl;

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
      // مخطط المنتج الكامل Schema.org Product
      const totalStock = product.inventory?.reduce((sum, item) => sum + item.stock, 0) || 0;
      const inStock = totalStock > 0;

      const productSchema = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        'name': product.name,
        'image': finalImage || product.image,
        'description': finalDescription,
        'sku': product.id,
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
      // مخطط المتجر الإلكتروني Schema.org Store / WebSite
      const storeSchema = {
        '@context': 'https://schema.org',
        '@type': 'OnlineStore',
        'name': 'RACHID SHOP',
        'url': fullOrigin,
        'description': finalDescription,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': `${fullOrigin}/?search={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      };
      scriptTag.textContent = JSON.stringify(storeSchema);
    }

  }, [title, description, image, url, type, product, category, currency]);

  return null;
}
