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

// دالة لتوليد XML لخريطة الموقع بالكامل باللغات الثلاث لـ Googlebot وفق معايير Google Search Central
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

  const langs: ('ar' | 'en' | 'fr')[] = ['ar', 'en', 'fr'];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  // 1. إضافة الصفحات الرئيسية والأقسام باللغات الثلاث مع وسوم xhtml:link
  for (const route of staticRoutes) {
    const rawUrl = `${baseUrl}${route.path}`;

    // رابط الصفحة الافتراضي
    xml += `  <url>\n`;
    xml += `    <loc>${rawUrl}</loc>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="ar" href="${rawUrl}?lang=ar"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${rawUrl}?lang=en"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="fr" href="${rawUrl}?lang=fr"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${rawUrl}"/>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;

    // روابط اللغات الثلاث المباشرة حتى يزحف إليها قوقل بشكل صريح
    for (const l of langs) {
      xml += `  <url>\n`;
      xml += `    <loc>${rawUrl}?lang=${l}</loc>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="ar" href="${rawUrl}?lang=ar"/>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="en" href="${rawUrl}?lang=en"/>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="fr" href="${rawUrl}?lang=fr"/>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${rawUrl}"/>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${(Number(route.priority) - 0.1).toFixed(1)}</priority>\n`;
      xml += `  </url>\n`;
    }
  }

  // 2. إضافة روابط كل المنتجات الموجودة في قاعدة البيانات باللغات الثلاث
  for (const prod of products) {
    const prodUrl = `${baseUrl}/product/${prod.id}`;
    const lastmod = prod.updatedAt || today;

    // الرابط الأساسي للمنتج
    xml += `  <url>\n`;
    xml += `    <loc>${prodUrl}</loc>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="ar" href="${prodUrl}?lang=ar"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${prodUrl}?lang=en"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="fr" href="${prodUrl}?lang=fr"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${prodUrl}"/>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;

    // روابط المنتجات المباشرة لكل لغة (AR, EN, FR)
    for (const l of langs) {
      xml += `  <url>\n`;
      xml += `    <loc>${prodUrl}?lang=${l}</loc>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="ar" href="${prodUrl}?lang=ar"/>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="en" href="${prodUrl}?lang=en"/>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="fr" href="${prodUrl}?lang=fr"/>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${prodUrl}"/>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }
  }

  xml += `</urlset>`;
  return xml;
}
