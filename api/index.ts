import "dotenv/config";
import express from "express";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import rateLimit from "express-rate-limit";

import { v2 as cloudinary } from "cloudinary";

const app = express();

// ضروري جداً لبيئات الاستضافة مثل Vercel و Cloud Run التي تستخدم Proxy
// لكي تتمكن مكتبة rateLimit من معرفة عنوان IP الحقيقي للزائر وعدم حظره بالخطأ
app.set('trust proxy', 1);

// Middleware لمعالجة البيانات القادمة بصيغة JSON
app.use(express.json());

// مسار لتوليد توقيع Cloudinary للرفع الآمن
app.get("/api/cloudinary-sign", (req, res) => {
  const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    const missing: string[] = [];
    if (!cloudName) missing.push("VITE_CLOUDINARY_CLOUD_NAME");
    if (!apiKey) missing.push("CLOUDINARY_API_KEY");
    if (!apiSecret) missing.push("CLOUDINARY_API_SECRET");
    return res.status(500).json({
      error: `إعدادات Cloudinary غير مكتملة في السيرفر. المتغيرات المفقودة: (${missing.join(", ")}). يرجى إضافتها في ملف .env أو استخدام رابط صورة مباشر.`
    });
  }

  const timestamp = Math.round(new Date().getTime() / 1000);

  // المعاملات التي نريد توقيعها (في حالتنا فقط timestamp)
  const paramsToSign = {
    timestamp: timestamp
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  res.json({
    timestamp,
    signature,
    apiKey,
    cloudName
  });
});

// دالة مبدئية لتعريف Firebase Admin باستخدام متغيرات البيئة
let adminDb: FirebaseFirestore.Firestore | null = null;
function getAdminDb() {
  if (!adminDb) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // إصلاح مشكلة الأسطر الجديدة

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Missing Firebase Admin credentials");
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
// يمنع أي IP من إرسال أكثر من 5 طلبات شراء خلال 15 دقيقة
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 طلبات كحد أقصى لكل IP
  message: { 
    success: false, 
    error: "لقد تجاوزت الحد المسموح به من الطلبات. يرجى المحاولة بعد 15 دقيقة." 
  },
  standardHeaders: true, // إرجاع معلومات الحد في ترويسات RateLimit-*
  legacyHeaders: false, // تعطيل ترويسات X-RateLimit-* القديمة
});

// مسار اختبار للتأكد من عمل السيرفر (API Route)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "السيرفر يعمل بنجاح!" });
});

// مسار جلب إحصائيات المنتجات الأكثر مبيعاً استناداً إلى الطلبات المكتملة (Delivered)
app.get("/api/best-sellers", async (req, res) => {
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
app.post("/api/checkout", checkoutLimiter, async (req, res) => {
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
