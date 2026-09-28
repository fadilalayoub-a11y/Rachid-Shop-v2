/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate, Outlet, useParams, useLocation } from 'react-router-dom';
import { Store } from './pages/Store';
import { Admin } from './pages/Admin';
import { useEffect } from 'react';
import { useLanguage } from './context/LanguageContext';

function LangSync() {
  const { lang } = useParams();
  const { language, setLanguage } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    // If we are at root level (no lang param), assume 'ar' as default.
    // Wait, useParams matches from parent routes, if we don't have a param, it's undefined.
    // We can also check pathname directly to be safe.
    let currentLang = 'ar';
    if (location.pathname.startsWith('/en')) currentLang = 'en';
    if (location.pathname.startsWith('/fr')) currentLang = 'fr';
    
    if (currentLang !== language) {
      setLanguage(currentLang as 'ar' | 'en' | 'fr');
    }
  }, [location.pathname, language, setLanguage]);

  return <Outlet />;
}

const storeRoutes = (
  <>
    <Route path="" element={<Store />} />
    <Route path="shoes" element={<Store initialTab="shoes" />} />
    <Route path="clothes" element={<Store initialTab="clothes" />} />
    <Route path="accessories" element={<Store initialTab="accessories" />} />
    <Route path="category/:categorySlug" element={<Store />} />
    <Route path="collection/:collectionSlug" element={<Store />} />
    <Route path="collections/:collectionSlug" element={<Store />} />
    <Route path="product/:productId" element={<Store />} />
  </>
);

export default function App() {
  return (
    <Routes>
      {/* 1. Admin Routes - Independent of language paths */}
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/products/create" element={<Admin defaultTab="add_product" />} />
      <Route path="/admin/products" element={<Admin defaultTab="inventory" />} />
      <Route path="/admin/orders" element={<Admin defaultTab="orders" />} />

      {/* 2. Language Routes */}
      {/* Default (Arabic) */}
      <Route path="/" element={<LangSync />}>
        {storeRoutes}
      </Route>
      
      {/* English */}
      <Route path="/en" element={<LangSync />}>
        {storeRoutes}
      </Route>
      
      {/* French */}
      <Route path="/fr" element={<LangSync />}>
        {storeRoutes}
      </Route>

      {/* 3. Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
