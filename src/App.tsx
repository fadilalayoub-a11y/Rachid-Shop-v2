/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route } from 'react-router-dom';
import { Store } from './pages/Store';
import { Admin } from './pages/Admin';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Store />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
