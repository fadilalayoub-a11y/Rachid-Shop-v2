/**
 * تحويل اسم المنتج إلى Slug مناسب لرابط الـ URL
 * يدعم اللغات العربية والإنجليزية والأرقام مع إزالة الرموز الخاصة واستبدال المسافات بشرطة (-)
 */
export function generateProductSlug(product: { id?: string; name?: string; nameAr?: string; nameEn?: string; slug?: string }): string {
  // إذا كان المنتج يحتوي على slug مخصص مسبقاً، نستخدمه
  if (product.slug && product.slug.trim()) {
    return cleanSlug(product.slug);
  }

  // استخدام اسم المنتج
  const sourceName = product.nameEn || product.name || product.nameAr || product.id || 'product';
  return cleanSlug(sourceName);
}

/**
 * تنظيف النص وتجهيزه ليصبح slug نظيف وصالح للـ URL
 */
export function cleanSlug(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .trim()
    .toLowerCase()
    // استبدال المسافات والرموز بشرطة
    .replace(/[\s\t\n]+/g, '-')
    // إزالة الحروف الخاصة غير المسموح بها في الروابط مع الحفاظ على الحروف العربية واللاتينية والأرقام والشرطات
    .replace(/[^\w\u0600-\u06FF\-]+/g, '')
    // دمج الشرطات المتكررة بشرطة واحدة
    .replace(/\-\-+/g, '-')
    // إزالة الشرطة من البداية والنهاية
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
