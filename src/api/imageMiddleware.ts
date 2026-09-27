import { Request, Response, NextFunction } from "express";
import sharp from "sharp";

/**
 * دالة Middleware للتحقق من مقاسات صورة المنتج ومعالجتها وتوحيد قالبها وحفظها بصيغة WebP
 */
export const resizeProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // التأكد من وجود ملف مرفوع بواسطة multer (MemoryStorage)
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "لم يتم رفع أي صورة" });
    }

    // 1. قراءة أبعاد ومعلومات الصورة
    const image = sharp(req.file.buffer);
    const metadata = await image.metadata();

    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // 2. التحقق من المقاس: رفض الصورة إذا كان العرض أو الارتفاع أقل من 600 بكسل
    if (width < 600 || height < 600) {
      return res.status(400).json({
        error: "الصورة صغيرة جداً، يرجى رفع صورة أبعادها لا تقل عن 600x600 بكسل",
      });
    }

    // 3. توحيد المقاس واللون وحفظ الصورة بصيغة WebP:
    // - قالب أبعاده 800x800 بكسل مع وضع المنتج في المنتصف (fit: "contain")
    // - تعبئة الخلفية باللون الأبيض الصافي #ffffff دون تشويه أبعاد المنتج
    // - تصدير الصورة بصيغة WebP
    const processedBuffer = await sharp(req.file.buffer)
      .resize(800, 800, {
        fit: "contain",
        background: "#ffffff",
      })
      .webp({ quality: 85 })
      .toBuffer();

    // تحديث خصائص الملف في الطلب ليتمكن المسار التالي من حفظه أو استخدامه
    req.file.buffer = processedBuffer;
    req.file.mimetype = "image/webp";
    if (req.file.originalname) {
      const baseName = req.file.originalname.replace(/\.[^/.]+$/, "");
      req.file.originalname = `${baseName}.webp`;
    }

    next();
  } catch (error) {
    console.error("خطأ أثناء معالجة الصورة:", error);
    return res.status(500).json({ error: "حدث خطأ أثناء معالجة الصورة" });
  }
};
