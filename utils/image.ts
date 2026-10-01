export const DEFAULT_PRODUCT_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none"><rect width="400" height="400" fill="%23f3f4f6"/><path d="M160 180a20 20 0 100-40 20 20 0 000 40zm80 70H160l35-45 25 30 15-20 45 55z" fill="%239ca3af"/><rect x="130" y="110" width="140" height="180" rx="8" stroke="%23cbd5e1" stroke-width="4"/></svg>';

/**
 * توحيد أبعاد ومقاسات صور المنتجات لتكون بنسبة مربعة متطابقة (1:1)
 * وتوسيط المنتج في المنتصف تماماً مثل بقية المنتجات
 * في حال كانت الصورة غير معرفة أو فارغة يتم إرجاع صورة افتراضية آمنة لمنع خطأ empty src
 */
export function normalizeProductImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return DEFAULT_PRODUCT_PLACEHOLDER;
  }

  const trimmed = url.trim();

  // إذا كانت الصورة مرفوعة عبر Cloudinary، نطبق توحيد المقاس (800x800) مع تحويل الخلفية الأوف-وايت إلى بيضاء نقية ومتجانسة 100%
  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/image/upload/')) {
    if (!trimmed.includes('/c_pad,')) {
      return trimmed.replace('/image/upload/', '/image/upload/e_brightness:5,c_pad,w_800,h_800,b_white,f_auto,q_auto/');
    }
  }

  return trimmed;
}

