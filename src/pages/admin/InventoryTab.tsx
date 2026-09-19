import { Product } from '../../types';
import { Package, ShieldAlert, Trash2, Edit, Search, X, Plus } from 'lucide-react';

interface InventoryTabProps {
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
      {/* Header with Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">إدارة المخزون والمنتجات</h2>
          <p className="text-xs text-gray-500 mt-1">
            تتبع كميات المقاسات المتوفرة بالمخزون، وتعديل الأسعار وحالات التوفر
          </p>
        </div>

        <button
          onClick={onGoToAddProduct}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          إضافة منتج جديد
        </button>
      </div>

      {/* Quick Inventory Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">إجمالي القطع بالمخزون</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{inventoryStats.totalItems}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setStockFilter(stockFilter === 'low_stock' ? 'all' : 'low_stock')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            stockFilter === 'low_stock'
              ? 'bg-amber-50 border-amber-300 shadow-sm ring-2 ring-amber-400/30'
              : 'bg-white border-gray-100 shadow-sm hover:border-amber-200'
          }`}
          title="اضغط للتصفية حسب المخزون المنخفض"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-700 font-medium">مخزون منخفض (≤ 5)</p>
              <p className="text-2xl font-black text-amber-900 mt-1">{inventoryStats.lowStockCount}</p>
            </div>
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div
          onClick={() => setStockFilter(stockFilter === 'out_of_stock' ? 'all' : 'out_of_stock')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            stockFilter === 'out_of_stock'
              ? 'bg-red-50 border-red-300 shadow-sm ring-2 ring-red-400/30'
              : 'bg-white border-gray-100 shadow-sm hover:border-red-200'
          }`}
          title="اضغط للتصفية حسب المنتجات المنتهية"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-700 font-medium">نفذ من المخزون</p>
              <p className="text-2xl font-black text-red-900 mt-1">{inventoryStats.outOfStockCount}</p>
            </div>
            <div className="p-3 bg-red-100 text-red-700 rounded-xl">
              <Trash2 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Products & Inventory Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Card Header & Search Bar */}
        <div className="p-5 border-b border-gray-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">قائمة المنتجات وجرد المخزون</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                عرض {filteredProducts.length} من أصل {products.length} منتج
              </p>
            </div>

            {/* Stock and Category filters */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">كل الأقسام</option>
                <option value="clothes">ملابس</option>
                <option value="shoes">أحذية</option>
                <option value="accessories">إكسسوارات</option>
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">كل حالات المخزون</option>
                <option value="in_stock">متوفر فقط</option>
                <option value="low_stock">مخزون منخفض (≤ 5)</option>
                <option value="out_of_stock">نفذ من المخزون</option>
              </select>
            </div>
          </div>

          {/* Search Input in Inventory */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في المخزون (اسم المنتج، المقاس كـ M أو 42، القسم...)"
              className="w-full bg-gray-50 text-gray-900 text-sm rounded-xl pl-10 pr-10 py-2.5 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-transparent transition-all"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 cursor-pointer rounded-full hover:bg-gray-200 transition-colors"
                title="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Active filters pill bar */}
          {(searchQuery || categoryFilter !== 'all' || stockFilter !== 'all') && (
            <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
              <span className="text-gray-500 font-medium">عوامل التصفية النشطة:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-medium">
                  بحث: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-blue-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {categoryFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-medium">
                  القسم:{' '}
                  {categoryFilter === 'clothes' ? 'ملابس' : categoryFilter === 'shoes' ? 'أحذية' : 'إكسسوارات'}
                  <button onClick={() => setCategoryFilter('all')} className="hover:text-blue-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {stockFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-medium">
                  المخزون: {stockFilter === 'in_stock' ? 'متوفر' : stockFilter === 'low_stock' ? 'منخفض' : 'نفذ'}
                  <button onClick={() => setStockFilter('all')} className="hover:text-blue-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setStockFilter('all');
                }}
                className="text-gray-500 hover:text-red-600 underline font-medium cursor-pointer mr-auto"
              >
                إعادة ضبط الكل
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-right">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">المنتج</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">القسم</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">السعر</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">المخزون والقطع</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredProducts.map((product) => {
                const totalStock =
                  product.inventory?.reduce((sum, item) => sum + (Number(item.stock) || 0), 0) ?? 0;
                return (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                          <img className="h-12 w-12 object-cover" src={product.image} alt={product.name} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate max-w-[240px]">
                            {product.name}
                          </div>
                          {product.description && (
                            <p className="text-xs text-gray-500 truncate max-w-[240px] mt-0.5">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-lg bg-gray-100 text-gray-700">
                        {product.category === 'clothes'
                          ? 'ملابس'
                          : product.category === 'shoes'
                          ? 'أحذية'
                          : 'إكسسوارات'}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-black">{product.price} درهم</span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through mr-1 block">
                          {product.originalPrice} درهم
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1.5 min-w-[140px]">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            totalStock === 0
                              ? 'bg-red-100 text-red-700'
                              : totalStock <= 5
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {totalStock === 0 ? 'نفذ من المخزون' : `${totalStock} قطعة إجمالية`}
                        </span>

                        {product.inventory && product.inventory.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.inventory.map((inv, idx) => {
                              const count = Number(inv.stock) || 0;
                              return (
                                <span
                                  key={idx}
                                  className={`text-[11px] px-1.5 py-0.5 rounded font-medium border ${
                                    count === 0
                                      ? 'bg-gray-100 text-gray-400 border-gray-200 line-through'
                                      : count <= 2
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-gray-50 text-gray-700 border-gray-200'
                                  }`}
                                >
                                  {inv.size}: <strong className="font-bold">{count}</strong>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEditProduct(product)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
                          title="تعديل المنتج والمخزون"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
                          title="حذف المنتج"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                        <Search className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">
                        {products.length === 0 ? 'لا توجد منتجات مضافة حتى الآن' : 'لم يتم العثور على أي نتائج'}
                      </h3>
                      <p className="text-xs text-gray-500 mb-4 text-center">
                        {products.length === 0
                          ? 'ابدأ بإضافة أول منتج وتحديد مقاساته ومخزونه من تبويب إضافة المنتجات.'
                          : 'لا يوجد أي منتج أو مقاس يطابق معايير البحث الحالية.'}
                      </p>
                      {products.length === 0 ? (
                        <button
                          onClick={onGoToAddProduct}
                          className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          إضافة أول منتج الآن
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setCategoryFilter('all');
                            setStockFilter('all');
                          }}
                          className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                          تفريغ البحث وعرض جميع المنتجات
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
