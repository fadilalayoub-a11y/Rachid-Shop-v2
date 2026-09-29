import firebaseConfig from '../../firebase-applet-config.json';

interface ProductData {
  id?: string;
  name: string;
  nameEn?: string;
  nameFr?: string;
  description: string;
  descriptionEn?: string;
  descriptionFr?: string;
  image: string;
  secondaryImage?: string | null;
  images?: string[];
  price: number;
  originalPrice?: number | null;
  category?: string;
  inventory?: { size: string; stock: number }[];
}

// دالة لجلب منتج محدد مع كافة تفاصيله والترجمات من Firestore REST API
async function fetchProduct(productId: string): Promise<ProductData | null> {
  try {
    const projectId = firebaseConfig.projectId;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${encodeURIComponent(productId)}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const doc = await res.json();
    const fields = doc.fields || {};

    const name = fields.name?.stringValue || 'منتج في متجر رشيد';
    const nameEn = fields.nameEn?.stringValue || fields.titleEn?.stringValue || undefined;
    const nameFr = fields.nameFr?.stringValue || fields.titleFr?.stringValue || undefined;

    const description = fields.description?.stringValue || 'تسوق الآن من متجر رشيد RACHID SHOP بأفضل الأسعار وأعلى جودة.';
    const descriptionEn = fields.descriptionEn?.stringValue || undefined;
    const descriptionFr = fields.descriptionFr?.stringValue || undefined;

    const image = fields.image?.stringValue || '';
    const secondaryImage = fields.secondaryImage?.stringValue || null;
    const price = fields.price?.doubleValue ?? (fields.price?.integerValue !== undefined ? Number(fields.price.integerValue) : 0);
    const originalPrice = fields.originalPrice?.doubleValue ?? (fields.originalPrice?.integerValue !== undefined ? Number(fields.originalPrice.integerValue) : null);
    const category = fields.category?.stringValue || 'shoes';

    // استخراج مصفوفة الصور الإضافية (images)
    let images: string[] = [];
    if (fields.images?.arrayValue?.values && Array.isArray(fields.images.arrayValue.values)) {
      images = fields.images.arrayValue.values
        .map((v: any) => v?.stringValue)
        .filter((s: any): s is string => typeof s === 'string' && s.trim().length > 0);
    }

    // استخراج مصفوفة المقاسات والمخزون (inventory)
    let inventory: { size: string; stock: number }[] = [];
    if (fields.inventory?.arrayValue?.values && Array.isArray(fields.inventory.arrayValue.values)) {
      inventory = fields.inventory.arrayValue.values
        .map((v: any) => {
          const mapFields = v?.mapValue?.fields || {};
          const size = mapFields.size?.stringValue || '';
          const stockVal = mapFields.stock?.doubleValue ?? mapFields.stock?.integerValue ?? 0;
          return {
            size,
            stock: typeof stockVal === 'string' ? parseInt(stockVal, 10) : Number(stockVal)
          };
        })
        .filter((item: any) => item.size);
    }

    return { 
      id: productId, 
      name,
      nameEn,
      nameFr,
      description,
      descriptionEn,
      descriptionFr,
      image, 
      secondaryImage, 
      images, 
      price, 
      originalPrice, 
      category, 
      inventory 
    };
  } catch (err) {
    console.error('Error fetching product for SSR metadata:', err);
    return null;
  }
}

// دالة لجلب أهم المنتجات لعرضها مباشرة داخل HTML كـ Pre-rendered Content
async function fetchTopProducts(category?: string): Promise<ProductData[]> {
  try {
    const projectId = firebaseConfig.projectId;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products?pageSize=24`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const data = await res.json();
    const docs = data.documents || [];

    const list: ProductData[] = docs.map((doc: any) => {
      const parts = (doc.name || '').split('/');
      const id = parts[parts.length - 1];
      const fields = doc.fields || {};
      return {
        id,
        name: fields.name?.stringValue || '',
        nameEn: fields.nameEn?.stringValue || fields.titleEn?.stringValue || undefined,
        nameFr: fields.nameFr?.stringValue || fields.titleFr?.stringValue || undefined,
        description: fields.description?.stringValue || '',
        descriptionEn: fields.descriptionEn?.stringValue || undefined,
        descriptionFr: fields.descriptionFr?.stringValue || undefined,
        image: fields.image?.stringValue || '',
        price: fields.price?.doubleValue ?? (fields.price?.integerValue !== undefined ? Number(fields.price.integerValue) : 0),
        category: fields.category?.stringValue || 'shoes',
      };
    });

    if (category && category !== 'home') {
      return list.filter(p => p.category === category);
    }
    return list;
  } catch (e) {
    return [];
  }
}

const STATIC_PAGE_SEO = {
  home: {
    ar: {
      title: 'متجر رشيد | RACHID SHOP - أحدث صيحات الموضة والأحذية والملابس الرجالية',
      description: 'متجر RACHID SHOP وجهتك الأولى لتسوق أرقى الملابس والأحذية العصرية بأفضل الأسعار وجودة أصلية مع توصيل سريع والدفع عند الاستلام.'
    },
    en: {
      title: 'RACHID SHOP - Luxury Men\'s Fashion, Shoes & Contemporary Apparel',
      description: 'Shop the finest men\'s clothing, sneakers, loafers, and curated fashion essentials with fast delivery and cash on delivery at RACHID SHOP.'
    },
    fr: {
      title: 'RACHID SHOP - Mode Masculine Haut de Gamme, Chaussures & Prêt-à-Porter',
      description: 'Découvrez les dernières tendances de vêtements pour hommes et chaussures de luxe avec livraison rapide et paiement à la livraison sur RACHID SHOP.'
    }
  },
  shoes: {
    ar: {
      title: 'أحذية رجالية عصرية وفاخرة - متجر رشيد | RACHID SHOP',
      description: 'تسوق أحدث تشكيلات الأحذية الرياضية (سنيكرز) والأحذية الكلاسيكية والجلدية الفاخرة بأفضل الأسعار وأعلى جودة من متجر رشيد.'
    },
    en: {
      title: 'Men\'s Shoes & Sneakers Collection - RACHID SHOP',
      description: 'Explore premium sneakers, casual footwear, and handcrafted leather shoes with unbeatable quality at RACHID SHOP.'
    },
    fr: {
      title: 'Chaussures & Baskets Homme - RACHID SHOP',
      description: 'Achetez des baskets élégantes, chaussures classiques et mocassins en cuir haut de gamme au meilleur prix sur RACHID SHOP.'
    }
  },
  clothes: {
    ar: {
      title: 'ملابس رجالية أنيقة وعصرية - متجر رشيد | RACHID SHOP',
      description: 'تشكيلة مميزة من الملابس العصرية الأنيقة التي تناسب ذوقك وتمنحك إطلالة فريدة ومتميزة من متجر رشيد.'
    },
    en: {
      title: 'Men\'s Contemporary Clothing & Apparel - RACHID SHOP',
      description: 'Shop premium t-shirts, jackets, hoodies, and refined trousers designed for modern lifestyle and quiet luxury at RACHID SHOP.'
    },
    fr: {
      title: 'Vêtements Homme Tendance & Haut de Gamme - RACHID SHOP',
      description: 'Large choix de t-shirts, vestes, sweats à capuche et pantalons élégants taillés dans des tissus d\'exception sur RACHID SHOP.'
    }
  },
  accessories: {
    ar: {
      title: 'إكسسوارات رجالية راقية تكمل أناقتك - متجر رشيد | RACHID SHOP',
      description: 'استكشف تشكيلتنا الفاخرة من الساعات، العطور، النظارات الشمسية، والقبعات المميزة في متجر رشيد.'
    },
    en: {
      title: 'Luxury Men\'s Accessories, Watches & Fragrances - RACHID SHOP',
      description: 'Complete your refined look with premium watches, perfumes, caps, and sunglasses at RACHID SHOP.'
    },
    fr: {
      title: 'Accessoires Homme de Luxe, Montres & Parfums - RACHID SHOP',
      description: 'Sublimez votre style avec notre sélection de montres, parfums, casquettes et lunettes de soleil chez RACHID SHOP.'
    }
  }
};

// دالة لتعديل وسوم الميتا وحقن محتوى HTML أولي حقيقي بلغات Google الثلاث (ar, en, fr)
export async function injectSeoTags(htmlTemplate: string, requestUrl: string, host: string, protocol: string): Promise<string> {
  const fullOrigin = `${protocol}://${host}`;
  const urlObj = new URL(requestUrl, fullOrigin);
  const pathname = urlObj.pathname;

  // استخراج اللغة المطلوبة من الرابط: ?lang=fr | ?lang=ar | ?lang=en
  const langParam = urlObj.searchParams.get('lang')?.toLowerCase();
  const currentLang: 'ar' | 'en' | 'fr' = (langParam === 'en' || langParam === 'fr' || langParam === 'ar') ? langParam : 'fr';
  const isRTL = currentLang === 'ar';

  // بناء روابط اللغات الثلاث لـ Googlebot (hreflang alternates)
  const cleanUrl = new URL(requestUrl, fullOrigin);
  cleanUrl.searchParams.delete('lang');
  const baseCanonical = `${cleanUrl.origin}${cleanUrl.pathname}`;

  const urlAr = `${baseCanonical}?lang=ar`;
  const urlEn = `${baseCanonical}?lang=en`;
  const urlFr = `${baseCanonical}?lang=fr`;
  const currentCanonicalUrl = currentLang === 'fr' ? baseCanonical : `${baseCanonical}?lang=${currentLang}`;

  let title = STATIC_PAGE_SEO.home[currentLang].title;
  let description = STATIC_PAGE_SEO.home[currentLang].description;
  let ogImage = `${fullOrigin}/logo.png`;
  let ogType = 'website';

  let preRenderedContentHtml = '';
  let initialDataScript = '';

  // 1. إذا كان الرابط لمنتج محدد: /product/:id
  const productMatch = pathname.match(/^\/product\/([^/]+)/);
  if (productMatch) {
    const productId = productMatch[1];
    const product = await fetchProduct(productId);

    if (product) {
      // اختيار الاسم والوصف حسب اللغة المطلوبة
      let localizedName = product.name;
      let localizedDesc = product.description;

      if (currentLang === 'en') {
        localizedName = product.nameEn || product.name;
        localizedDesc = product.descriptionEn || product.description;
        title = `${localizedName} - Men's Fashion | RACHID SHOP`;
        description = localizedDesc ? `${localizedDesc.slice(0, 150)}... - Price: ${product.price} MAD` : `Buy ${localizedName} at RACHID SHOP with high quality and fast delivery.`;
      } else if (currentLang === 'fr') {
        localizedName = product.nameFr || product.name;
        localizedDesc = product.descriptionFr || product.description;
        title = `${localizedName} - Mode Homme | RACHID SHOP`;
        description = localizedDesc ? `${localizedDesc.slice(0, 150)}... - Prix : ${product.price} MAD` : `Achetez ${localizedName} sur RACHID SHOP avec une qualité premium et livraison rapide.`;
      } else {
        // Arabic (default)
        title = `${product.name} - متجر رشيد | RACHID SHOP`;
        description = product.description ? `${product.description.slice(0, 150)}... - السعر: ${product.price} درهم` : `اشتري الآن ${product.name} بأفضل جودة من متجر رشيد.`;
      }

      if (product.image) {
        ogImage = product.image;
      }
      ogType = 'product';

      // جمع كافة صور المنتج (الأساسية والثانوية والمعرض)
      const allImages: string[] = [];
      if (product.image) allImages.push(product.image);
      if (product.secondaryImage && !allImages.includes(product.secondaryImage)) allImages.push(product.secondaryImage);
      if (product.images) {
        product.images.forEach(img => {
          if (img && !allImages.includes(img)) allImages.push(img);
        });
      }

      // بناء وسوم الصور المصغرة
      const thumbnailsHtml = allImages.length > 1 ? `
        <div class="flex gap-2 mt-3 overflow-x-auto py-1 max-w-full">
          ${allImages.map((img, i) => `
            <img src="${img}" alt="${localizedName} - ${i + 1}" class="w-14 h-14 object-cover rounded-xl border border-stone-200 shrink-0" />
          `).join('')}
        </div>
      ` : '';

      // مسميات حسب اللغة
      const sizesLabel = currentLang === 'en' ? 'Available Sizes:' : currentLang === 'fr' ? 'Tailles disponibles :' : 'المقاسات المتوفرة:';
      const ctaLabel = currentLang === 'en' ? 'Order Product Now' : currentLang === 'fr' ? 'Commander le produit' : 'طلب المنتج الآن';
      const homeLabel = currentLang === 'en' ? 'Home' : currentLang === 'fr' ? 'Accueil' : 'الرئيسية';
      const catLabels: Record<string, { ar: string; en: string; fr: string }> = {
        clothes: { ar: 'ملابس', en: 'Clothes', fr: 'Vêtements' },
        shoes: { ar: 'أحذية', en: 'Shoes', fr: 'Chaussures' },
        accessories: { ar: 'إكسسوارات', en: 'Accessories', fr: 'Accessoires' },
      };
      const catName = catLabels[product.category || 'shoes']?.[currentLang] || catLabels.shoes[currentLang];
      const guaranteeText1 = currentLang === 'en' ? '✓ 100% Authentic Quality Guaranteed' : currentLang === 'fr' ? '✓ Produit authentique & Qualité garantie' : '✓ منتج أصلي ومضمون الجودة';
      const guaranteeText2 = currentLang === 'en' ? '✓ Fast Delivery across Morocco' : currentLang === 'fr' ? '✓ Livraison rapide partout au Maroc' : '✓ توصيل سريع لجميع المدن المغربية';
      const guaranteeText3 = currentLang === 'en' ? '✓ Cash on Delivery' : currentLang === 'fr' ? '✓ Paiement à la réception (Espèces)' : '✓ الدفع عند الاستلام';

      // بناء وسوم المقاسات المتوفرة
      const sizesHtml = product.inventory && product.inventory.length > 0 ? `
        <div class="mb-5 pt-3 border-t border-stone-200">
          <span class="text-xs font-bold text-stone-900 block mb-2">${sizesLabel}</span>
          <div class="flex flex-wrap gap-2">
            ${product.inventory.map(inv => `
              <span class="inline-flex items-center justify-center min-w-[42px] px-3 py-1.5 rounded-xl border text-xs font-bold ${
                inv.stock > 0 ? 'bg-white text-stone-900 border-stone-300' : 'bg-stone-50 text-stone-400 border-stone-200 line-through'
              }">
                ${inv.size}
              </span>
            `).join('')}
          </div>
        </div>
      ` : '';

      // حقن كود HTML متكامل للمنتج يقرأه روبوت Google Search Console باللغة المحددة
      preRenderedContentHtml = `
        <article class="p-6 max-w-4xl mx-auto my-8 bg-white rounded-3xl shadow-xs border border-stone-200" id="ssr-product-content" dir="${isRTL ? 'rtl' : 'ltr'}">
          <nav aria-label="Breadcrumb" class="text-sm text-stone-500 mb-4">
            <a href="/?lang=${currentLang}" class="underline">${homeLabel}</a> &gt; 
            <a href="/${product.category || 'shoes'}?lang=${currentLang}" class="underline">${catName}</a> &gt; 
            <span class="text-stone-900 font-bold">${localizedName}</span>
          </nav>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              ${product.image ? `<img src="${product.image}" alt="${localizedName}" class="w-full h-auto rounded-2xl object-cover max-h-[460px]" />` : ''}
              ${thumbnailsHtml}
            </div>
            <div>
              <h1 class="text-3xl font-extrabold text-stone-950 mb-3">${localizedName}</h1>
              <p class="text-2xl font-black text-emerald-700 mb-4">${product.price} MAD</p>
              
              <div class="text-stone-700 leading-relaxed mb-5">
                ${localizedDesc}
              </div>

              ${sizesHtml}

              <div class="p-4 bg-stone-50 rounded-xl border border-stone-200/80 text-sm text-stone-600 mb-6 space-y-1">
                <p>${guaranteeText1}</p>
                <p>${guaranteeText2}</p>
                <p>${guaranteeText3}</p>
              </div>

              <a href="${currentCanonicalUrl}" class="inline-block px-8 py-3.5 bg-stone-950 text-white rounded-xl font-bold shadow-md hover:bg-stone-900 transition-colors">
                ${ctaLabel}
              </a>
            </div>
          </div>
        </article>
      `;

      initialDataScript = `<script id="initial-product-data">window.__INITIAL_PRODUCT_DATA__ = ${JSON.stringify(product)};</script>`;
    }
  } else {
    // 2. صفحات الأقسام أو الرئيسية
    let catFilter: string | undefined = undefined;
    if (pathname === '/shoes') {
      title = STATIC_PAGE_SEO.shoes[currentLang].title;
      description = STATIC_PAGE_SEO.shoes[currentLang].description;
      catFilter = 'shoes';
    } else if (pathname === '/clothes') {
      title = STATIC_PAGE_SEO.clothes[currentLang].title;
      description = STATIC_PAGE_SEO.clothes[currentLang].description;
      catFilter = 'clothes';
    } else if (pathname === '/accessories') {
      title = STATIC_PAGE_SEO.accessories[currentLang].title;
      description = STATIC_PAGE_SEO.accessories[currentLang].description;
      catFilter = 'accessories';
    }

    const sampleProducts = await fetchTopProducts(catFilter);
    if (sampleProducts.length > 0) {
      preRenderedContentHtml = `
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="ssr-category-content" dir="${isRTL ? 'rtl' : 'ltr'}">
          <header class="mb-8">
            <h1 class="text-2xl sm:text-3xl font-extrabold text-stone-950 mb-2">${title.split(' - ')[0]}</h1>
            <p class="text-stone-600">${description}</p>
          </header>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-7 lg:gap-8">
            ${sampleProducts.map(p => {
              const pName = currentLang === 'en' ? (p.nameEn || p.name) : currentLang === 'fr' ? (p.nameFr || p.name) : p.name;
              const pDesc = currentLang === 'en' ? (p.descriptionEn || p.description) : currentLang === 'fr' ? (p.descriptionFr || p.description) : p.description;
              const btnLabel = currentLang === 'en' ? 'View Details' : currentLang === 'fr' ? 'Détails du produit' : 'عرض تفاصيل المنتج';
              return `
                <div class="bg-white rounded-2xl p-3 border border-stone-200/80 shadow-2xs flex flex-col justify-between">
                  <div>
                    ${p.image ? `<img src="${p.image}" alt="${pName}" class="w-full aspect-square object-cover rounded-xl mb-3" loading="lazy" />` : ''}
                    <h2 class="font-bold text-stone-900 text-sm sm:text-base line-clamp-1 mb-1">${pName}</h2>
                    <p class="text-xs text-stone-500 line-clamp-2 mb-2">${pDesc}</p>
                  </div>
                  <div>
                    <p class="font-black text-stone-950 text-sm sm:text-base mb-2">${p.price} MAD</p>
                    <a href="/product/${p.id}?lang=${currentLang}" class="block text-center text-xs font-bold py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors">
                      ${btnLabel}
                    </a>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      `;
    }
  }

  // تنظيف النصوص لمنع أي كسر لـ HTML
  const escapeHtml = (str: string) => str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImage = escapeHtml(ogImage);
  const safeCanonical = escapeHtml(currentCanonicalUrl);

  let modifiedHtml = htmlTemplate;

  // تحديث سمات وسم <html> لتطابق لغة واتجاه الصفحة المطلوبة لبوت قوقل
  modifiedHtml = modifiedHtml.replace(
    /<html\s+lang="[^"]*"\s+dir="[^"]*">/i,
    `<html lang="${currentLang}" dir="${isRTL ? 'rtl' : 'ltr'}">`
  );

  // استبدال وسم <title>
  modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/i, `<title>${safeTitle}</title>`);

  // استبدال أو حقن الوسوم الأساسية و وسوم hreflang الثلاثة المعتمدة لدى قوقل
  const tagsToInject = `
    <!-- Googlebot Multilingual hreflang Alternate Tags -->
    <link rel="alternate" hreflang="ar" href="${urlAr}" />
    <link rel="alternate" hreflang="en" href="${urlEn}" />
    <link rel="alternate" hreflang="fr" href="${urlFr}" />
    <link rel="alternate" hreflang="x-default" href="${baseCanonical}" />
    <link rel="canonical" href="${safeCanonical}" />

    <!-- Dynamic Server-Side Meta Tags for Crawlers & Social Previews -->
    <meta name="description" content="${safeDescription}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:url" content="${safeCanonical}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:locale" content="${currentLang === 'ar' ? 'ar_MA' : currentLang === 'fr' ? 'fr_FR' : 'en_US'}" />
    <meta property="og:locale:alternate" content="ar_MA" />
    <meta property="og:locale:alternate" content="fr_FR" />
    <meta property="og:locale:alternate" content="en_US" />
    <meta property="og:site_name" content="RACHID SHOP" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeImage}" />
    ${initialDataScript}
  `;

  // إزالة الوسوم القديمة المكررة في index.html لضمان نظافة الرأس
  modifiedHtml = modifiedHtml
    .replace(/<meta\s+name="description"[^>]*>/gi, '')
    .replace(/<meta\s+property="og:title"[^>]*>/gi, '')
    .replace(/<meta\s+property="og:description"[^>]*>/gi, '')
    .replace(/<meta\s+property="og:type"[^>]*>/gi, '')
    .replace(/<meta\s+name="twitter:card"[^>]*>/gi, '');

  // حقن الوسوم والبيانات في <head>
  modifiedHtml = modifiedHtml.replace('</head>', `${tagsToInject}\n</head>`);

  // حل مشكلة الصفحة البيضاء لبوت قوقل (Pre-rendered HTML inside <div id="root">)
  if (preRenderedContentHtml) {
    modifiedHtml = modifiedHtml.replace(
      '<div id="root"></div>',
      `<div id="root">${preRenderedContentHtml}</div>`
    );
  }

  return modifiedHtml;
}
