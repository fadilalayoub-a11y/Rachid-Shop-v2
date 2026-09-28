import firebaseConfig from '../../firebase-applet-config.json';

interface ProductIdAndDate {
  id: string;
  updatedAt?: string;
}

// دالة لجلب قائمة جميع المنتجات الحالية من Firestore
async function fetchAllProductIds(): Promise<ProductIdAndDate[]> {
  try {
    const projectId = firebaseConfig.projectId;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products?pageSize=300`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const documents = data.documents || [];

    return documents.map((doc: any) => {
      // اسم المستند يكون بالشكل projects/.../databases/.../documents/products/PRODUCT_ID
      const parts = (doc.name || '').split('/');
      const id = parts[parts.length - 1];
      const updatedAt = doc.updateTime ? doc.updateTime.split('T')[0] : undefined;
      return { id, updatedAt };
    }).filter((item: ProductIdAndDate) => !!item.id);
  } catch (err) {
    console.error('Error fetching product list for sitemap:', err);
    return [];
  }
}

// دالة لتوليد XML لخريطة الموقع بالكامل بشكل ديناميكي
export async function generateSitemapXml(baseUrl: string): Promise<string> {
  const today = new Date().toISOString().split('T')[0];
  const products = await fetchAllProductIds();

  // روابط الأقسام الثابتة
  const staticRoutes = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '/shoes', priority: '0.9', changefreq: 'daily' },
    { path: '/clothes', priority: '0.9', changefreq: 'daily' },
    { path: '/accessories', priority: '0.8', changefreq: 'weekly' },
  ];

  const langs = ['ar', 'en', 'fr'];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  // Helper to generate hreflang links
  const getHreflangTags = (basePath: string) => {
    let tags = '';
    tags += `    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}${basePath}" />\n`;
    tags += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en${basePath === '/' ? '' : basePath}" />\n`;
    tags += `    <xhtml:link rel="alternate" hreflang="fr" href="${baseUrl}/fr${basePath === '/' ? '' : basePath}" />\n`;
    tags += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${basePath}" />\n`;
    return tags;
  };

  // 1. إضافة الصفحات الرئيسية بجميع اللغات
  for (const route of staticRoutes) {
    const basePath = route.path || '/';
    for (const lang of langs) {
      const pathPrefix = lang === 'ar' ? '' : `/${lang}`;
      const fullPath = basePath === '/' ? pathPrefix || '/' : `${pathPrefix}${basePath}`;
      
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${fullPath === '//' ? '/' : fullPath}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += getHreflangTags(basePath === '/' ? '' : basePath);
      xml += `  </url>\n`;
    }
  }

  // 2. إضافة روابط كل المنتجات الموجودة في قاعدة البيانات تلقائياً
  for (const prod of products) {
    const basePath = `/product/${prod.id}`;
    for (const lang of langs) {
      const pathPrefix = lang === 'ar' ? '' : `/${lang}`;
      
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${pathPrefix}${basePath}</loc>\n`;
      if (prod.updatedAt) {
        xml += `    <lastmod>${prod.updatedAt}</lastmod>\n`;
      }
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += getHreflangTags(basePath);
      xml += `  </url>\n`;
    }
  }

  xml += `</urlset>`;
  return xml;
}
