import firebaseConfig from '../../firebase-applet-config.json';

interface ProductData {
  id?: string;
  name: string;
  description: string;
  image: string;
  secondaryImage?: string | null;
  images?: string[];
  price: number;
  originalPrice?: number | null;
  category?: string;
  inventory?: { size: string; stock: number }[];
}

// دالة لجلب منتج محدد مع كافة تفاصيله (المقاسات والصور الإضافية) من Firestore REST API
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
    const description = fields.description?.stringValue || 'تسوق الآن من متجر رشيد RACHID SHOP بأفضل الأسعار وأعلى جودة.';
    const nameEn = fields.nameEn?.stringValue || '';
    const nameFr = fields.nameFr?.stringValue || '';
    const descriptionEn = fields.descriptionEn?.stringValue || '';
    const descriptionFr = fields.descriptionFr?.stringValue || '';
    
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
      descriptionEn,
      descriptionFr,
      description, 
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
        nameEn: fields.nameEn?.stringValue || '',
        nameFr: fields.nameFr?.stringValue || '',
        description: fields.description?.stringValue || '',
        descriptionEn: fields.descriptionEn?.stringValue || '',
        descriptionFr: fields.descriptionFr?.stringValue || '',
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

// دالة لتعديل وسوم الميتا وحقن محتوى HTML أولي حقيقي بدلاً من الصفحة البيضاء
export async function injectSeoTags(htmlTemplate: string, requestUrl: string, host: string, protocol: string): Promise<string> {
  const fullOrigin = `${protocol}://${host}`;
  const urlObj = new URL(requestUrl, fullOrigin);
  const pathname = urlObj.pathname;

  // Extract Language
  let lang = 'ar';
  let pathWithoutLang = pathname;
  if (pathname.startsWith('/en/')) {
    lang = 'en';
    pathWithoutLang = pathname.replace(/^\/en/, '');
  } else if (pathname === '/en') {
    lang = 'en';
    pathWithoutLang = '/';
  } else if (pathname.startsWith('/fr/')) {
    lang = 'fr';
    pathWithoutLang = pathname.replace(/^\/fr/, '');
  } else if (pathname === '/fr') {
    lang = 'fr';
    pathWithoutLang = '/';
  }

  let title = 'RACHID SHOP - متجر رشيد';
  let description = 'متجر RACHID SHOP وجهتك الأولى لتسوق أرقى الملابس والأحذية العصرية بأفضل الأسعار وجودة أصلية مع توصيل سريع.';
  
  if (lang === 'en') {
    title = 'RACHID SHOP - Premium Fashion';
    description = 'RACHID SHOP is your premier destination for the finest clothing and modern footwear at the best prices with fast delivery.';
  } else if (lang === 'fr') {
    title = 'RACHID SHOP - Mode Premium';
    description = 'RACHID SHOP est votre destination de choix pour les meilleurs vêtements et chaussures modernes aux meilleurs prix avec livraison rapide.';
  }

  let ogImage = `${fullOrigin}/logo.png`;
  let ogType = 'website';
  const canonicalUrl = `${fullOrigin}${pathname}`;

  let preRenderedContentHtml = '';
  let initialDataScript = '';

  // 1. إذا كان الرابط لمنتج محدد: /product/:id
  const productMatch = pathWithoutLang.match(/^\/product\/([^/]+)/);
  if (productMatch) {
    const productId = productMatch[1];
    const product = await fetchProduct(productId);

    if (product) {
      // Apply Language
      let pName = product.name;
      let pDesc = product.description;
      if (lang === 'en' && (product as any).nameEn) pName = (product as any).nameEn;
      if (lang === 'fr' && (product as any).nameFr) pName = (product as any).nameFr;
      if (lang === 'en' && (product as any).descriptionEn) pDesc = (product as any).descriptionEn;
      if (lang === 'fr' && (product as any).descriptionFr) pDesc = (product as any).descriptionFr;

      if (lang === 'en') {
        title = `${pName} - Rachid Shop`;
        description = pDesc ? `${pDesc.slice(0, 150)}... - Price: ${product.price} MAD` : `Buy ${pName} now in best quality at Rachid Shop.`;
      } else if (lang === 'fr') {
        title = `${pName} - Rachid Shop`;
        description = pDesc ? `${pDesc.slice(0, 150)}... - Prix: ${product.price} MAD` : `Achetez ${pName} maintenant en meilleure qualité chez Rachid Shop.`;
      } else {
        title = `${pName} - متجر رشيد | RACHID SHOP`;
        description = pDesc ? `${pDesc.slice(0, 150)}... - السعر: ${product.price} درهم` : `اشتري الآن ${pName} بأفضل جودة من متجر رشيد.`;
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
            <img src="${img}" alt="${pName} - ${i + 1}" class="w-14 h-14 object-cover rounded-xl border border-stone-200 shrink-0" />
          `).join('')}
        </div>
      ` : '';

      // بناء وسوم المقاسات المتوفرة
      const sizesHtml = product.inventory && product.inventory.length > 0 ? `
        <div class="mb-5 pt-3 border-t border-stone-200">
          <span class="text-xs font-bold text-stone-900 block mb-2">${lang === 'en' ? 'Available Sizes:' : lang === 'fr' ? 'Tailles Disponibles :' : 'المقاسات المتوفرة:'}</span>
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

      const breadcrumbHome = lang === 'en' ? 'Home' : lang === 'fr' ? 'Accueil' : 'الرئيسية';
      let breadcrumbCat = product.category === 'clothes' ? (lang==='en'?'Clothes':lang==='fr'?'Vêtements':'ملابس') : product.category === 'accessories' ? (lang==='en'?'Accessories':lang==='fr'?'Accessoires':'إكسسوارات') : (lang==='en'?'Shoes':lang==='fr'?'Chaussures':'أحذية');

      // حقن كود HTML متكامل للمنتج يراه روبوت Google وفاحص Google Search Console فوراً
      preRenderedContentHtml = `
        <article class="p-6 max-w-4xl mx-auto my-8 bg-white rounded-3xl shadow-sm border border-stone-200" id="ssr-product-content" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
          <nav aria-label="Breadcrumb" class="text-sm text-stone-500 mb-4">
            <a href="/${lang === 'ar' ? '' : lang}" class="underline">${breadcrumbHome}</a> &gt; 
            <a href="/${lang === 'ar' ? '' : lang + '/'}${product.category || 'shoes'}" class="underline">${breadcrumbCat}</a> &gt; 
            <span class="text-stone-900 font-bold">${pName}</span>
          </nav>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              ${product.image ? `<img src="${product.image}" alt="${pName}" class="w-full h-auto rounded-2xl object-cover max-h-[460px]" />` : ''}
              ${thumbnailsHtml}
            </div>
            <div>
              <h1 class="text-3xl font-extrabold text-stone-950 mb-3">${pName}</h1>
              <p class="text-2xl font-black text-emerald-700 mb-4">${product.price} MAD</p>
              
              <div class="text-stone-700 leading-relaxed mb-5">
                ${pDesc}
              </div>

              ${sizesHtml}

              <a href="${canonicalUrl}" class="inline-block px-8 py-3.5 bg-stone-950 text-white rounded-xl font-bold shadow-md hover:bg-stone-900 transition-colors">
                ${lang === 'en' ? 'Order Now' : lang === 'fr' ? 'Commander' : 'طلب المنتج الآن'}
              </a>
            </div>
          </div>
        </article>
      `;

      // حقن كائن البيانات كاملاً للمتصفح حتى لا يحدث أي تعارض أو تكرار
      initialDataScript = `<script id="initial-product-data">window.__INITIAL_PRODUCT_DATA__ = ${JSON.stringify(product)};</script>`;
    }
  } else {
    // 2. صفحات الأقسام أو الرئيسية
    let catFilter: string | undefined = undefined;
    if (pathWithoutLang === '/shoes') {
      if (lang === 'en') { title = 'Shoes - Rachid Shop'; description = 'Shop modern shoes.'; }
      else if (lang === 'fr') { title = 'Chaussures - Rachid Shop'; description = 'Acheter des chaussures.'; }
      else { title = 'أحذية رجالية ونسائية عصرية - متجر رشيد | RACHID SHOP'; description = 'تسوق أحدث تشكيلات الأحذية الرياضية والكلاسيكية المريحة بأفضل الأسعار وأعلى جودة من متجر رشيد.'; }
      catFilter = 'shoes';
    } else if (pathWithoutLang === '/clothes') {
      if (lang === 'en') { title = 'Clothes - Rachid Shop'; description = 'Shop modern clothes.'; }
      else if (lang === 'fr') { title = 'Vêtements - Rachid Shop'; description = 'Acheter des vêtements.'; }
      else { title = 'ملابس أنيقة وعصرية لجميع الإطلالات - متجر رشيد | RACHID SHOP'; description = 'تشكيلة مميزة من الملابس العصرية الأنيقة التي تناسب ذوقك وتمنحك إطلالة فريدة ومتميزة من متجر رشيد.'; }
      catFilter = 'clothes';
    } else if (pathWithoutLang === '/accessories') {
      if (lang === 'en') { title = 'Accessories - Rachid Shop'; description = 'Shop modern accessories.'; }
      else if (lang === 'fr') { title = 'Accessoires - Rachid Shop'; description = 'Acheter des accessoires.'; }
      else { title = 'إكسسوارات راقية تكمل أناقتك - متجر رشيد | RACHID SHOP'; description = 'استكشف تشكيلتنا الفاخرة من الإكسسوارات الرجالية والنسائية المميزة في متجر رشيد.'; }
      catFilter = 'accessories';
    }

    const sampleProducts = await fetchTopProducts(catFilter);
    if (sampleProducts.length > 0) {
      preRenderedContentHtml = `
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="ssr-category-content" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
          <header class="mb-8">
            <h1 class="text-2xl sm:text-3xl font-extrabold text-stone-950 mb-2">${title.split(' - ')[0]}</h1>
            <p class="text-stone-600">${description}</p>
          </header>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-7 lg:gap-8">
            ${sampleProducts.map(p => {
              let pName = p.name;
              let pDesc = p.description;
              if (lang === 'en' && (p as any).nameEn) pName = (p as any).nameEn;
              if (lang === 'fr' && (p as any).nameFr) pName = (p as any).nameFr;
              if (lang === 'en' && (p as any).descriptionEn) pDesc = (p as any).descriptionEn;
              if (lang === 'fr' && (p as any).descriptionFr) pDesc = (p as any).descriptionFr;
              
              return `
              <div class="bg-white rounded-2xl p-3 border border-stone-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  ${p.image ? `<img src="${p.image}" alt="${pName}" class="w-full aspect-square object-cover rounded-xl mb-3" loading="lazy" />` : ''}
                  <h2 class="font-bold text-stone-900 text-sm sm:text-base line-clamp-1 mb-1">${pName}</h2>
                  <p class="text-xs text-stone-500 line-clamp-2 mb-2">${pDesc}</p>
                </div>
                <div>
                  <p class="font-black text-stone-950 text-sm sm:text-base mb-2">${p.price} MAD</p>
                  <a href="/${lang === 'ar' ? '' : lang + '/'}product/${p.id}" class="block text-center text-xs font-bold py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors">
                    ${lang === 'en' ? 'View Details' : lang === 'fr' ? 'Voir détails' : 'عرض تفاصيل المنتج'}
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
  const safeUrl = escapeHtml(canonicalUrl);

  let modifiedHtml = htmlTemplate;

  // استبدال وسم <title>
  modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/i, `<title>${safeTitle}</title>`);
  
  // Set html lang and dir
  modifiedHtml = modifiedHtml.replace(/<html[^>]*>/i, `<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">`);

  // Hreflang URLs
  const arUrl = `${fullOrigin}${pathWithoutLang}`;
  const enUrl = `${fullOrigin}/en${pathWithoutLang === '/' ? '' : pathWithoutLang}`;
  const frUrl = `${fullOrigin}/fr${pathWithoutLang === '/' ? '' : pathWithoutLang}`;

  // استبدال أو حقن الوسوم الأساسية
  const tagsToInject = `
    <!-- Dynamic Server-Side Meta Tags for Crawlers & Social Previews -->
    <meta name="description" content="${safeDescription}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:url" content="${safeUrl}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:site_name" content="RACHID SHOP" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeImage}" />
    <link rel="canonical" href="${safeUrl}" />
    <link rel="alternate" hreflang="ar" href="${arUrl}" />
    <link rel="alternate" hreflang="en" href="${enUrl}" />
    <link rel="alternate" hreflang="fr" href="${frUrl}" />
    <link rel="alternate" hreflang="x-default" href="${arUrl}" />
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
