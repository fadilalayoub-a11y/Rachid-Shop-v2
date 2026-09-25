import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import apiApp from "./api/index"; // استيراد مسارات API
import { injectSeoTags } from "./src/server/seoPrerender";
import { generateSitemapXml } from "./src/server/sitemapGenerator";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // إعداد الثقة في Proxy للبيئات السحابية
  app.set('trust proxy', 1);

  // ربط مسارات الـ API أولاً
  app.use(apiApp);

  // مسار خريطة الموقع الديناميكي لـ Google Search Console
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol || 'http';
      const baseUrl = `${protocol}://${host}`;

      const sitemap = await generateSitemapXml(baseUrl);
      res.header('Content-Type', 'application/xml');
      res.header('Cache-Control', 'public, max-age=3600'); // كاش لمدة ساعة لتحسين الأداء
      res.status(200).send(sitemap);
    } catch (err) {
      console.error('Error serving dynamic sitemap:', err);
      res.status(500).end();
    }
  });

  if (process.env.NODE_ENV !== "production") {
    // بيئة التطوير (Development with Vite Middleware)
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });

    app.use(vite.middlewares);

    // معالجة كافة طلبات صفحات HTML مع حقن وسوم السيو ومعاينة المنتجات للروابط
    app.get('*', async (req, res, next) => {
      // استثناء مسارات الملفات الثابتة أو الـ API
      if (req.url.startsWith('/api') || req.url.includes('.')) {
        return next();
      }

      try {
        const rawIndex = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        const transformedHtml = await vite.transformIndexHtml(req.originalUrl, rawIndex);
        
        // حقن وسوم السيو ومعاينة المنتج بالخادم (Server-side Meta Tags)
        const host = req.get('host') || 'localhost:3000';
        const protocol = req.protocol || 'http';
        const finalHtml = await injectSeoTags(transformedHtml, req.originalUrl, host, protocol);

        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(finalHtml);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });

  } else {
    // بيئة الإنتاج (Production / Cloud Run)
    const distPath = path.join(process.cwd(), 'dist');
    const indexHtmlPath = path.join(distPath, 'index.html');

    // خدمة الملفات الثابتة (js, css, images) أولاً
    app.use(express.static(distPath, { index: false }));

    // معالجة صفحات HTML مع حقن وسوم الميتا
    app.get('*', async (req, res, next) => {
      if (req.url.startsWith('/api') || req.url.includes('.')) {
        return next();
      }

      try {
        if (!fs.existsSync(indexHtmlPath)) {
          return res.status(404).send('Build files not found');
        }
        const rawIndex = fs.readFileSync(indexHtmlPath, 'utf-8');
        const host = req.get('host') || 'localhost:3000';
        const protocol = req.protocol || 'http';
        const finalHtml = await injectSeoTags(rawIndex, req.originalUrl, host, protocol);

        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(finalHtml);
      } catch (err) {
        next(err);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
