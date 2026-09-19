import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import apiApp from "./api/index"; // استيراد مسارات API

async function startServer() {
  const app = express();
  const PORT = 3000;

  // إعداد الثقة في Proxy للبيئات السحابية
  app.set('trust proxy', 1);

  // ربط مسارات الـ API
  app.use(apiApp);

  // إعداد Vite Middleware ليعمل مع السيرفر في بيئة التطوير
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // إعداد الملفات الثابتة لبيئة الإنتاج (للتشغيل المحلي / Cloud Run)
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
