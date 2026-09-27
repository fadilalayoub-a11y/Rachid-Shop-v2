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

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. إضافة الصفحات الرئيسية
  for (const route of staticRoutes) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${route.path}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // 2. إضافة روابط كل المنتجات الموجودة في قاعدة البيانات تلقائياً
  for (const prod of products) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/product/${prod.id}</loc>\n`;
    if (prod.updatedAt) {
      xml += `    <lastmod>${prod.updatedAt}</lastmod>\n`;
    }
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}
