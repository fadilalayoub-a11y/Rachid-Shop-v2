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
        description: fields.description?.stringValue || '',
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

  let title = 'RACHID SHOP - متجر رشيد';
  let description = 'متجر RACHID SHOP وجهتك الأولى لتسوق أرقى الملابس والأحذية العصرية بأفضل الأسعار وجودة أصلية مع توصيل سريع.';
  let ogImage = `${fullOrigin}/logo.png`;
  let ogType = 'website';
  const canonicalUrl = `${fullOrigin}${pathname}`;

  let preRenderedContentHtml = '';
  let initialDataScript = '';

  // 1. إذا كان الرابط لمنتج محدد: /product/:id
  const productMatch = pathname.match(/^\/product\/([^/]+)/);
  if (productMatch) {
    const productId = productMatch[1];
    const product = await fetchProduct(productId);

    if (product) {
      title = `${product.name} - متجر رشيد | RACHID SHOP`;
      description = product.description ? `${product.description.slice(0, 150)}... - السعر: ${product.price} درهم` : `اشتري الآن ${product.name} بأفضل جودة من متجر رشيد.`;
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
            <img src="${img}" alt="${product.name} - ${i + 1}" class="w-14 h-14 object-cover rounded-xl border border-stone-200 shrink-0" />
          `).join('')}
        </div>
      ` : '';

      // بناء وسوم المقاسات المتوفرة
      const sizesHtml = product.inventory && product.inventory.length > 0 ? `
        <div class="mb-5 pt-3 border-t border-stone-200">
          <span class="text-xs font-bold text-stone-900 block mb-2">المقاسات المتوفرة:</span>
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

      // حقن كود HTML متكامل للمنتج يراه روبوت Google وفاحص Google Search Console فوراً
      preRenderedContentHtml = `
        <article class="p-6 max-w-4xl mx-auto my-8 bg-white rounded-3xl shadow-sm border border-stone-200" id="ssr-product-content">
          <nav aria-label="Breadcrumb" class="text-sm text-stone-500 mb-4">
            <a href="/" class="underline">الرئيسية</a> &gt; 
            <a href="/${product.category || 'shoes'}" class="underline">${product.category === 'clothes' ? 'ملابس' : product.category === 'accessories' ? 'إكسسوارات' : 'أحذية'}</a> &gt; 
            <span class="text-stone-900 font-bold">${product.name}</span>
          </nav>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              ${product.image ? `<img src="${product.image}" alt="${product.name}" class="w-full h-auto rounded-2xl object-cover max-h-[460px]" />` : ''}
              ${thumbnailsHtml}
            </div>
            <div>
              <h1 class="text-3xl font-extrabold text-stone-950 mb-3">${product.name}</h1>
              <p class="text-2xl font-black text-emerald-700 mb-4">${product.price} MAD (درهم مغربي)</p>
              
              <div class="text-stone-700 leading-relaxed mb-5">
                ${product.description}
              </div>

              ${sizesHtml}

              <div class="p-4 bg-stone-50 rounded-xl border border-stone-200/80 text-sm text-stone-600 mb-6">
                <p>✓ منتج أصلي ومضمون الجودة</p>
                <p>✓ توصيل سريع لجميع المدن المغربية</p>
                <p>✓ الدفع عند الاستلام</p>
              </div>

              <a href="${canonicalUrl}" class="inline-block px-8 py-3.5 bg-stone-950 text-white rounded-xl font-bold shadow-md hover:bg-stone-900 transition-colors">
                طلب المنتج الآن
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
    if (pathname === '/shoes') {
      title = 'أحذية رجالية ونسائية عصرية - متجر رشيد | RACHID SHOP';
      description = 'تسوق أحدث تشكيلات الأحذية الرياضية والكلاسيكية المريحة بأفضل الأسعار وأعلى جودة من متجر رشيد.';
      catFilter = 'shoes';
    } else if (pathname === '/clothes') {
      title = 'ملابس أنيقة وعصرية لجميع الإطلالات - متجر رشيد | RACHID SHOP';
      description = 'تشكيلة مميزة من الملابس العصرية الأنيقة التي تناسب ذوقك وتمنحك إطلالة فريدة ومتميزة من متجر رشيد.';
      catFilter = 'clothes';
    } else if (pathname === '/accessories') {
      title = 'إكسسوارات راقية تكمل أناقتك - متجر رشيد | RACHID SHOP';
      description = 'استكشف تشكيلتنا الفاخرة من الإكسسوارات الرجالية والنسائية المميزة في متجر رشيد.';
      catFilter = 'accessories';
    }

    const sampleProducts = await fetchTopProducts(catFilter);
    if (sampleProducts.length > 0) {
      preRenderedContentHtml = `
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="ssr-category-content">
          <header class="mb-8">
            <h1 class="text-2xl sm:text-3xl font-extrabold text-stone-950 mb-2">${title.split(' - ')[0]}</h1>
            <p class="text-stone-600">${description}</p>
          </header>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-7 lg:gap-8">
            ${sampleProducts.map(p => `
              <div class="bg-white rounded-2xl p-3 border border-stone-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  ${p.image ? `<img src="${p.image}" alt="${p.name}" class="w-full aspect-square object-cover rounded-xl mb-3" loading="lazy" />` : ''}
                  <h2 class="font-bold text-stone-900 text-sm sm:text-base line-clamp-1 mb-1">${p.name}</h2>
                  <p class="text-xs text-stone-500 line-clamp-2 mb-2">${p.description}</p>
                </div>
                <div>
                  <p class="font-black text-stone-950 text-sm sm:text-base mb-2">${p.price} MAD</p>
                  <a href="/product/${p.id}" class="block text-center text-xs font-bold py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors">
                    عرض تفاصيل المنتج
                  </a>
                </div>
              </div>
            `).join('')}
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
