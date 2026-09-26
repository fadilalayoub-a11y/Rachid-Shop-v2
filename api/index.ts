import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

import express from "express";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import rateLimit from "express-rate-limit";
import { v2 as cloudinary } from "cloudinary";

const app = express();

// ضروري جداً لبيئات الاستضافة مثل Vercel و Cloud Run التي تستخدم Proxy
app.set('trust proxy', 1);

// Middleware لمعالجة البيانات القادمة بصيغة JSON
app.use(express.json());

// دالة مساعدة لجلب متغيرات Cloudinary بمرونة (تدعم بادئة VITE_ أو بدونها لمنع فقدان الإعدادات على Vercel)
function getCloudinaryConfig() {
  const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.VITE_CLOUDINARY_API_SECRET;
  return { cloudName, apiKey, apiSecret };
}

// مسار لتوليد توقيع Cloudinary للرفع الآمن (يدعم المسارين /api/cloudinary-sign و /cloudinary-sign لتوافق Vercel Rewrites)
app.get(["/api/cloudinary-sign", "/cloudinary-sign"], (req, res) => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

  if (!cloudName || !apiKey || !apiSecret) {
    const missing: string[] = [];
    if (!cloudName) missing.push("VITE_CLOUDINARY_CLOUD_NAME / CLOUDINARY_CLOUD_NAME");
    if (!apiKey) missing.push("CLOUDINARY_API_KEY");
    if (!apiSecret) missing.push("CLOUDINARY_API_SECRET");
    return res.status(500).json({
      error: `إعدادات Cloudinary غير مكتملة في السيرفر. المتغيرات المفقودة: (${missing.join(", ")}). يرجى التأكد من تفعيلها لبيئات Production و Preview في Vercel.`
    });
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = { timestamp };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  res.json({
    timestamp,
    signature,
    apiKey,
    cloudName
  });
});

// تنقية ومعالجة المفتاح الخاص لـ Firebase Admin بمرونة تامة (يدعم Base64 و \n المشفرة والأقواس)
function sanitizePrivateKey(rawKey?: string): string | undefined {
  if (!rawKey) return undefined;
  let key = rawKey.trim();

  // إزالة أي علامات اقتباس خارجية
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }

  // فحص ما إذا كان المفتاح مشفراً بصيغة Base64 لتفادي أخطاء الأسطر
  if (!key.includes("-----BEGIN PRIVATE KEY-----")) {
    try {
      const decoded = Buffer.from(key, "base64").toString("utf-8");
      if (decoded.includes("-----BEGIN PRIVATE KEY-----")) {
        key = decoded.trim();
      }
    } catch {
      // ليس بصيغة Base64
    }
  }

  // تحويل أي \n نصية إلى أسطر حقيقية
  key = key.replace(/\\n/g, "\n");
  return key;
}

// دالة مهيأة لتعريف Firebase Admin باستخدام متغيرات البيئة بمرونة فائقة
let adminDb: FirebaseFirestore.Firestore | null = null;
function getAdminDb() {
  if (!adminDb) {
    // 1. خيار المفتاح الكامل المشفر (Full Service Account JSON or Base64 JSON)
    const fullServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT;
    if (fullServiceAccount) {
      try {
        let parsed: any;
        const trimmed = fullServiceAccount.trim();
        if (trimmed.startsWith("{")) {
          parsed = JSON.parse(trimmed);
        } else {
          const decoded = Buffer.from(trimmed, "base64").toString("utf-8");
          parsed = JSON.parse(decoded);
        }
        if (parsed && parsed.private_key) {
          parsed.private_key = sanitizePrivateKey(parsed.private_key);
        }
        if (getApps().length === 0) {
          initializeApp({ credential: cert(parsed) });
        }
        adminDb = getFirestore();
        return adminDb;
      } catch (e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e);
      }
    }

    // 2. خيار المتغيرات الفردية
    let defaultProjectId = "";
    try {
      // محاولة استيراد الملف كخيار احتياطي دون التسبب بانهيار السيرفر إن لم يكن متاحاً
      const config = require("../firebase-applet-config.json");
      defaultProjectId = config.projectId || "";
    } catch {
      // تم تشغيله على Vercel بدون الملف المضمن
    }

    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || defaultProjectId;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = sanitizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Missing Firebase Admin credentials (FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID)");
    }

    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }
    adminDb = getFirestore();
  }
  return adminDb;
}

// إعداد حماية Rate Limiting (الحد من معدل الطلبات)
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { 
    success: false, 
    error: "لقد تجاوزت الحد المسموح به من الطلبات. يرجى المحاولة بعد 15 دقيقة." 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// مسار اختبار للتأكد من عمل السيرفر (API Route)
app.get(["/api/health", "/health"], (req, res) => {
  res.json({ status: "ok", message: "السيرفر يعمل بنجاح على Vercel / Node.js!" });
});

// مسار جلب إحصائيات المنتجات الأكثر مبيعاً استناداً إلى الطلبات المكتملة (Delivered)
app.get(["/api/best-sellers", "/best-sellers"], async (req, res) => {
  try {
    let db: FirebaseFirestore.Firestore;
    try {
      db = getAdminDb();
    } catch {
      return res.json({ salesCounts: {} });
    }

    const ordersSnapshot = await db.collection("orders").where("status", "==", "delivered").get();
    const salesCounts: Record<string, number> = {};

    ordersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (Array.isArray(data.items)) {
        for (const item of data.items) {
          const productId = item.productId || item.id;
          if (productId) {
            const qty = Number(item.quantity) || 1;
            salesCounts[productId] = (salesCounts[productId] || 0) + qty;
          }
        }
      }
    });

    res.json({ salesCounts });
  } catch (err: any) {
    console.error("Error calculating best sellers:", err);
    res.status(500).json({ salesCounts: {} });
  }
});

// مسار إرسال الطلبات وخصم المخزون بشكل آمن (محمي بالـ Limiter)
app.post(["/api/checkout", "/checkout"], checkoutLimiter, async (req, res) => {
  try {
    const { customerName, customerPhone, customerCity, customerAddress, totalAmount, cartItems } = req.body;

    let db: FirebaseFirestore.Firestore;
    try {
      db = getAdminDb();
    } catch (adminErr: any) {
      // في حال لم يقم المطور بإضافة مفاتيح Admin بعد، سنحاكي العملية للنجاح للتجربة
      console.warn("⚠️ Firebase Admin غير مُعد بعد. يتم محاكاة تسجيل الطلب...");
      return res.json({ success: true, message: "Order processed (Mock mode - Admin missing)" });
    }

    // 1. استخدام Transaction لضمان خصم المخزون بأمان دون تضارب
    await db.runTransaction(async (transaction) => {
      const productRefs = cartItems.map((item: any) => db.collection('products').doc(item.id));
      const productDocs = await transaction.getAll(...productRefs);

      const updates = [];

      // 2. التحقق من المخزون لكل المنتجات قبل خصم أي شيء
      for (let i = 0; i < productDocs.length; i++) {
        const pDoc = productDocs[i];
        const item = cartItems[i];
        
        if (!pDoc.exists) {
          throw new Error(`المنتج ${item.name} غير موجود.`);
        }

        const pData = pDoc.data() as { inventory?: Array<{ size: string; stock: number }> } | undefined;
        const inventory = pData?.inventory || [];
        const sizeInvIndex = inventory.findIndex((inv: any) => inv.size === item.selectedSize);

        if (sizeInvIndex === -1 || inventory[sizeInvIndex].stock < item.quantity) {
          throw new Error(`عذراً، الكمية المطلوبة من ${item.name} مقاس ${item.selectedSize} نفدت قبل قليل.`);
        }

        // تجهيز التحديث
        inventory[sizeInvIndex].stock -= item.quantity;
        updates.push({ ref: pDoc.ref, data: { inventory } });
      }

      // 3. تطبيق الخصم الفعلي
      for (const update of updates) {
        transaction.update(update.ref, update.data);
      }

      // 4. تسجيل الطلب في مجموعة Orders
      const orderRef = db.collection('orders').doc();
      transaction.set(orderRef, {
        customerName,
        customerPhone,
        customerCity,
        customerAddress,
        totalAmount,
        items: cartItems,
        status: 'pending',
        createdAt: FieldValue.serverTimestamp()
      });
    });

    res.json({ success: true });
  } catch (err: any) {
    console.error("Checkout transaction error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// تصدير التطبيق ليتم استخدامه في Vercel Serverless
export default app;
