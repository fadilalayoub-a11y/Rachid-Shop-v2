import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { Product } from '../types';
import { EditProductModal } from '../components/EditProductModal';
import { AdminOrders } from '../components/AdminOrders';
import { useAuth } from '../hooks/useAuth';
import {
  AdminAuthGate,
  AdminHeader,
  AdminTabsNav,
  AdminTabType,
  InventoryTab,
  AddProductTab,
  DeleteConfirmModal,
  HeroImagesTab,
  CategoryImagesTab,
} from './admin';

interface AdminProps {
  defaultTab?: AdminTabType;
}

export function Admin({ defaultTab }: AdminProps) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  const initialTab = useMemo<AdminTabType>(() => {
    if (defaultTab) return defaultTab;
    if (location.pathname === '/admin/products/create') return 'add_product';
    if (location.pathname === '/admin/orders') return 'orders';
    if (location.pathname === '/admin/products') return 'inventory';
    return 'inventory';
  }, [defaultTab, location.pathname]);

  const [adminTab, setAdminTab] = useState<AdminTabType>(initialTab);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Sync tab with route changes
  useEffect(() => {
    if (location.pathname === '/admin/products/create') {
      setAdminTab('add_product');
    } else if (location.pathname === '/admin/orders') {
      setAdminTab('orders');
    } else if (location.pathname === '/admin/products') {
      setAdminTab('inventory');
    }
  }, [location.pathname]);

  const handleTabChange = (tab: AdminTabType) => {
    setAdminTab(tab);
    if (tab === 'add_product') {
      navigate('/admin/products/create');
    } else if (tab === 'inventory') {
      navigate('/admin/products');
    } else if (tab === 'orders') {
      navigate('/admin/orders');
    } else {
      navigate('/admin');
    }
  };

  // Search and inventory filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'clothes' | 'shoes' | 'accessories'>('all');
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const handleLogout = () => signOut(auth);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedProducts: Product[] = [];
        snapshot.forEach((d) => {
          fetchedProducts.push({ id: d.id, ...d.data() } as Product);
        });
        setProducts(fetchedProducts);
      },
      (err) => {
        console.error('Error listening to products:', err);
      }
    );

    // Listen to orders count for badge
    const qOrders = query(collection(db, 'orders'));
    const unsubscribeOrders = onSnapshot(
      qOrders,
      (snapshot) => {
        let pending = 0;
        snapshot.forEach((d) => {
          if (d.data().status === 'pending') pending++;
        });
        setPendingOrdersCount(pending);
      },
      (err) => {
        console.warn('Orders count snapshot status:', err.message);
      }
    );

    return () => {
      unsubscribe();
      unsubscribeOrders();
    };
  }, [user]);

  // Filter products by search query, category, and inventory stock
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Search Query filter (matches name, description, category, or size)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesName = product.name?.toLowerCase().includes(q);
        const matchesDesc = product.description?.toLowerCase().includes(q);
        const matchesCategory =
          product.category?.toLowerCase().includes(q) ||
          (product.category === 'clothes' && 'ملابس'.includes(q)) ||
          (product.category === 'shoes' && 'أحذية'.includes(q)) ||
          (product.category === 'accessories' && 'إكسسوارات'.includes(q));

        const matchesSize = product.inventory?.some((inv) =>
          inv.size.toLowerCase().includes(q)
        );

        if (!matchesName && !matchesDesc && !matchesCategory && !matchesSize) {
          return false;
        }
      }

      // 2. Category filter
      if (categoryFilter !== 'all' && product.category !== categoryFilter) {
        return false;
      }

      // 3. Stock filter
      const totalStock =
        product.inventory?.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0) ?? 0;
      if (stockFilter === 'out_of_stock' && totalStock > 0) return false;
      if (stockFilter === 'low_stock' && (totalStock === 0 || totalStock > 5)) return false;
      if (stockFilter === 'in_stock' && totalStock === 0) return false;

      return true;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  // Total inventory stats
  const inventoryStats = useMemo(() => {
    let totalItems = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;

    products.forEach((p) => {
      const stock =
        p.inventory?.reduce((sum, item) => sum + (Number(item.stock) || 0), 0) ?? 0;
      totalItems += stock;
      if (stock === 0) outOfStockCount++;
      else if (stock <= 5) lowStockCount++;
    });

    return { totalItems, outOfStockCount, lowStockCount };
  }, [products]);

  const confirmDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <AdminAuthGate
      loading={loading}
      user={user}
      isAdmin={isAdmin}
      onLogout={handleLogout}
    >
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8" dir="rtl">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <AdminHeader userEmail={user?.email || ''} onLogout={handleLogout} />

          {/* Navigation Tabs */}
          <AdminTabsNav
            currentTab={adminTab}
            onTabChange={handleTabChange}
            productsCount={products.length}
            pendingOrdersCount={pendingOrdersCount}
          />

          {/* Tab 1: Orders */}
          {adminTab === 'orders' && <AdminOrders />}

          {/* Tab 2: Add Product */}
          {adminTab === 'add_product' && (
            <AddProductTab
              productsCount={products.length}
              onGoToInventory={() => handleTabChange('inventory')}
            />
          )}

          {/* Tab 3: Inventory */}
          {adminTab === 'inventory' && (
            <InventoryTab
              products={products}
              filteredProducts={filteredProducts}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              stockFilter={stockFilter}
              setStockFilter={setStockFilter}
              inventoryStats={inventoryStats}
              onEditProduct={(p) => setEditingProduct(p)}
              onDeleteProduct={(id) => setProductToDelete(id)}
              onGoToAddProduct={() => handleTabChange('add_product')}
            />
          )}

          {/* Tab 4: Category Images */}
          {adminTab === 'category_images' && <CategoryImagesTab />}

          {/* Tab 5: Hero Images */}
          {adminTab === 'hero_images' && <HeroImagesTab />}
        </div>

        {/* Edit Product Modal */}
        <EditProductModal
          product={editingProduct}
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={!!productToDelete}
          onClose={() => setProductToDelete(null)}
          onConfirm={() => productToDelete && confirmDelete(productToDelete)}
        />
      </div>
    </AdminAuthGate>
  );
}
