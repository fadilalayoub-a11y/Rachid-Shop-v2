import React from 'react';
import { Product } from '../../../types';
import { Package, ShieldAlert, Trash2, Edit, Search, X, Plus } from 'lucide-react';
import { normalizeProductImageUrl } from '../../../utils/image';
import { STORE_SUBCATEGORIES } from '../../../constants/categories';

export interface InventoryTabProps {
  products: Product[];
  filteredProducts: Product[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  categoryFilter: 'all' | 'clothes' | 'shoes' | 'accessories';
  setCategoryFilter: (c: 'all' | 'clothes' | 'shoes' | 'accessories') => void;
  stockFilter: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  setStockFilter: (s: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock') => void;
  inventoryStats: {
    totalItems: number;
    outOfStockCount: number;
    lowStockCount: number;
  };
  onEditProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onGoToAddProduct: () => void;
}

export function InventoryTab({
  products,
  filteredProducts,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  stockFilter,
  setStockFilter,
  inventoryStats,
  onEditProduct,
  onDeleteProduct,
  onGoToAddProduct,
}: InventoryTabProps) {
  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400">إجمالي المنتجات المسجلة</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{products.length}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600">منتجات منخفضة المخزون</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{inventoryStats.lowStockCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-rose-600">منتجات نفذت من المخزن</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{inventoryStats.outOfStockCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المنتج، الماركة، أو القسم..."
            className="w-full pr-10 pl-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-gray-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white font-bold text-gray-700"
          >
            <option value="all">كل الأقسام</option>
            <option value="clothes">الملابس</option>
            <option value="shoes">الأحذية</option>
            <option value="accessories">الإكسسوارات</option>
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white font-bold text-gray-700"
          >
            <option value="all">كل الحالات</option>
            <option value="in_stock">متوفر</option>
            <option value="low_stock">مخزون منخفض (&lt; 5)</option>
            <option value="out_of_stock">نفذ من المخزن (0)</option>
          </select>

          <button
            onClick={onGoToAddProduct}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-gray-50/80 text-gray-600 font-bold border-b border-gray-100">
              <tr>
                <th className="p-4">المنتج</th>
                <th className="p-4">القسم</th>
                <th className="p-4">السعر</th>
                <th className="p-4">إجمالي المخزون</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400">
                    <Package className="w-10 h-10 mx-auto stroke-1 text-gray-300 mb-2" />
                    <p className="font-bold">لا توجد منتجات مطابقة لخيارات البحث</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const subObj = STORE_SUBCATEGORIES.find((s) => s.id === product.subcategory_id || s.id === product.subcategory);
                  const totalStock = product.variants
                    ? product.variants.reduce((a, b) => a + (Number(b.stock) || 0), 0)
                    : product.inventory
                    ? product.inventory.reduce((a, b) => a + (Number(b.stock) || 0), 0)
                    : 0;

                  const isLow = totalStock > 0 && totalStock <= 5;
                  const isOut = totalStock === 0;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Product Thumbnail + Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                            <img
                              src={normalizeProductImageUrl(product.image)}
                              alt={product.title || product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 line-clamp-1">
                              {product.title || product.name}
                            </p>
                            <p className="text-[11px] text-gray-400 font-mono" dir="ltr">
                              {product.brand || 'RACHID SHOP'} • {product.sku || 'SKU-N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 font-bold rounded-lg text-[11px]">
                          {subObj ? subObj.nameAr : product.category_id || product.category || 'عام'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-4">
                        <div className="font-black text-gray-900">
                          {product.price} DH
                        </div>
                        {product.compare_at_price && (
                          <div className="text-[10px] text-gray-400 line-through">
                            {product.compare_at_price} DH
                          </div>
                        )}
                      </td>

                      {/* Stock Badge */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            isOut
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isOut ? 'bg-rose-600' : isLow ? 'bg-amber-600' : 'bg-emerald-600'
                            }`}
                          />
                          <span>{totalStock} قطعة</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEditProduct(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                            title="تعديل المنتج"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(product.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="حذف المنتج"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
