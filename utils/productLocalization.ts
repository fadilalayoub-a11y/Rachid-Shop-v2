import { Product, Language } from '@/types';

interface CachedTranslation {
  name: string;
  description: string;
}

const LOCAL_STORAGE_PREFIX = 'rachid_trans_v2_';

// In-memory runtime translation dictionary to ensure instant reactivity across components
const runtimeCache: Record<string, CachedTranslation> = {};
const listeners: Array<() => void> = [];

export function subscribeToTranslationUpdates(callback: () => void) {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notifyTranslationUpdate() {
  listeners.forEach(cb => {
    try {
      cb();
    } catch (e) {
      console.error(e);
    }
  });
}

export function getLocalizedProductName(product: Product, lang: Language): string {
  if (!product) return '';

  // 1. Direct explicit translations stored on the product doc
  if (lang === 'en' && product.nameEn && product.nameEn.trim()) {
    return product.nameEn.trim();
  }
  if (lang === 'fr' && product.nameFr && product.nameFr.trim()) {
    return product.nameFr.trim();
  }
  if (lang === 'ar' && product.nameAr && product.nameAr.trim()) {
    return product.nameAr.trim();
  }

  // 2. In-memory runtime cache
  const cacheKey = `${product.id}_${lang}`;
  if (runtimeCache[cacheKey]?.name) {
    return runtimeCache[cacheKey].name;
  }

  // 3. LocalStorage persistence cache
  try {
    const cached = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${cacheKey}`);
    if (cached) {
      const parsed: CachedTranslation = JSON.parse(cached);
      if (parsed.name && parsed.name.trim()) {
        runtimeCache[cacheKey] = parsed;
        return parsed.name.trim();
      }
    }
  } catch {
    // Ignore storage errors
  }

  return product.name || product.title || '';
}

export function getLocalizedProductDescription(product: Product, lang: Language): string {
  if (!product) return '';

  // 1. Direct explicit translations stored on the product doc
  if (lang === 'en' && product.descriptionEn && product.descriptionEn.trim()) {
    return product.descriptionEn.trim();
  }
  if (lang === 'fr' && product.descriptionFr && product.descriptionFr.trim()) {
    return product.descriptionFr.trim();
  }
  if (lang === 'ar' && product.descriptionAr && product.descriptionAr.trim()) {
    return product.descriptionAr.trim();
  }

  // 2. In-memory runtime cache
  const cacheKey = `${product.id}_${lang}`;
  if (runtimeCache[cacheKey]?.description) {
    return runtimeCache[cacheKey].description;
  }

  // 3. LocalStorage persistence cache
  try {
    const cached = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${cacheKey}`);
    if (cached) {
      const parsed: CachedTranslation = JSON.parse(cached);
      if (parsed.description && parsed.description.trim()) {
        runtimeCache[cacheKey] = parsed;
        return parsed.description.trim();
      }
    }
  } catch {
    // Ignore storage errors
  }

  return product.description || '';
}

export function saveCachedTranslation(productId: string, lang: Language, name: string, description: string) {
  const cacheKey = `${productId}_${lang}`;
  runtimeCache[cacheKey] = { name, description };
  try {
    localStorage.setItem(
      `${LOCAL_STORAGE_PREFIX}${cacheKey}`,
      JSON.stringify({ name, description })
    );
  } catch {
    // Ignore storage errors
  }
  notifyTranslationUpdate();
}

export interface ProductTranslationsResult {
  ar: { name: string; description: string };
  en: { name: string; description: string };
  fr: { name: string; description: string };
}

/**
 * Triggers instant server-side AI translation for product name and description
 */
export async function requestProductAiTranslation(
  name: string,
  description: string,
  sourceLang: string = 'ar'
): Promise<ProductTranslationsResult> {
  const response = await fetch('/api/translate-product', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      description,
      sourceLang,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to translate product content');
  }

  const data = await response.json();
  return data.translations;
}

// Track pending translations to avoid duplicate API calls
const inFlightBatches = new Set<string>();

/**
 * Automatically translates products into the newly selected language
 * Triggered automatically whenever the user changes language in the store
 */
export async function autoTranslateProductsForLanguage(products: Product[], targetLang: Language): Promise<void> {
  if (!products || products.length === 0) return;

  // Filter products that do not have translations for the target language yet
  const missingItems = products.filter(product => {
    if (targetLang === 'en' && product.nameEn) return false;
    if (targetLang === 'fr' && product.nameFr) return false;
    if (targetLang === 'ar' && product.nameAr) return false;

    const cacheKey = `${product.id}_${targetLang}`;
    if (runtimeCache[cacheKey]?.name) return false;

    try {
      const stored = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${cacheKey}`);
      if (stored) {
        runtimeCache[cacheKey] = JSON.parse(stored);
        return false;
      }
    } catch {
      // Continue
    }

    return true;
  });

  if (missingItems.length === 0) return;

  // Translate in chunks of up to 15 items
  const batch = missingItems.slice(0, 15);
  const batchKey = `${targetLang}_${batch.map(p => p.id).join('_')}`;
  if (inFlightBatches.has(batchKey)) return;
  inFlightBatches.add(batchKey);

  try {
    const response = await fetch('/api/translate-batch-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetLang,
        items: batch.map(p => ({
          id: p.id,
          name: p.name || p.title || '',
          description: p.description || '',
        })),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.translations)) {
        data.translations.forEach((item: { id: string; name: string; description: string }) => {
          if (item.id && item.name) {
            saveCachedTranslation(item.id, targetLang, item.name, item.description || '');
          }
        });
      }
    }
  } catch (err) {
    console.warn('Auto batch translation failed:', err);
  } finally {
    inFlightBatches.delete(batchKey);
  }
}

