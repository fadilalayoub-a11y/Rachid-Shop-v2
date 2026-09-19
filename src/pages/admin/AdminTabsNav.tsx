import { Package, Plus, ClipboardList } from 'lucide-react';

export type AdminTabType = 'inventory' | 'add_product' | 'orders';

interface AdminTabsNavProps {
  currentTab: AdminTabType;
  onTabChange: (tab: AdminTabType) => void;
  productsCount: number;
  pendingOrdersCount: number;
}

export function AdminTabsNav({
  currentTab,
  onTabChange,
  productsCount,
  pendingOrdersCount,
}: AdminTabsNavProps) {
  return (
    <div className="flex items-center gap-2 border-b border-gray-200 mb-8 pb-3 overflow-x-auto">
      <button
        onClick={() => onTabChange('inventory')}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
          currentTab === 'inventory'
            ? 'bg-gray-900 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        <Package className="w-4 h-4" />
        <span>المخزون</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            currentTab === 'inventory' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {productsCount}
        </span>
      </button>

      <button
        onClick={() => onTabChange('add_product')}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
          currentTab === 'add_product'
            ? 'bg-gray-900 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        <Plus className="w-4 h-4" />
        <span>إضافة المنتجات</span>
      </button>

      <button
        onClick={() => onTabChange('orders')}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer relative ${
          currentTab === 'orders'
            ? 'bg-gray-900 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        <ClipboardList className="w-4 h-4" />
        <span>الطلبات والمبيعات</span>
        {pendingOrdersCount > 0 && (
          <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
            {pendingOrdersCount} جديد
          </span>
        )}
      </button>
    </div>
  );
}
