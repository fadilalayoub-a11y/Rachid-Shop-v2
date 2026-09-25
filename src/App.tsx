/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { Store } from './pages/Store';
import { Admin } from './pages/Admin';

export default function App() {
  return (
    <Routes>
      {/* 1. الرئيسية */}
      <Route path="/" element={<Store />} />

      {/* 2. أقسام وتصنيفات المتجر مع روابط URL واضحة */}
      <Route path="/shoes" element={<Store initialTab="shoes" />} />
      <Route path="/clothes" element={<Store initialTab="clothes" />} />
      <Route path="/accessories" element={<Store initialTab="accessories" />} />
      
      {/* 3. رابط مخصص للتصنيفات البديلة والمجموعات المنتقاة */}
      <Route path="/category/:categorySlug" element={<Store />} />
      <Route path="/collection/:collectionSlug" element={<Store />} />
      <Route path="/collections/:collectionSlug" element={<Store />} />

      {/* 4. رابط مخصص ومباشر لكل منتج (Deep Linking) */}
      <Route path="/product/:productId" element={<Store />} />

      {/* 5. لوحة التحكم */}
      <Route path="/admin" element={<Admin />} />

      {/* 6. تحويل أي مسار غير معروف إلى الصفحة الرئيسية */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
