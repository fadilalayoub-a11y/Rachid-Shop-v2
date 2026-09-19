import { useState, useEffect, useMemo, FormEvent } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
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
} from './admin';

export function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [adminTab, setAdminTab] = useState<AdminTabType>('inventory');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Search and inventory filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'clothes' | 'shoes' | 'accessories'>('all');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [inventory, setInventory] = useState<{ size: string; stock: string }[]>([{ size: '', stock: '' }]);
  const [category, setCategory] = useState<'clothes' | 'shoes' | 'accessories'>('clothes');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormMessage({ type: '', text: '' });

    if (!imageFile || !name || !description || !price) {
      setFormMessage({ type: 'error', text: 'يرجى تعبئة جميع الحقول وإرفاق صورة' });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Get Signature from secure Serverless Function
      const signatureRes = await fetch('/api/cloudinary-sign');
      const signatureData = await signatureRes.json();

      if (!signatureRes.ok) {
        throw new Error(signatureData.error || 'فشل الحصول على تصريح رفع الصورة');
      }

      const { timestamp, signature, apiKey, cloudName } = signatureData;

      // 2. Upload Image to Cloudinary (Signed)
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Error uploading image to Cloudinary');
      }

      const imageUrl = data.secure_url;

      // 3. Save Product to Firestore
      const validInventory = inventory
        .filter((item) => item.size.trim() !== '')
        .map((item) => ({
          size: item.size.trim(),
          stock: item.stock ? Number(item.stock) : 0,
        }));

      await addDoc(collection(db, 'products'), {
        name,
        description,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        inventory: validInventory,
        category,
        image: imageUrl,
        createdAt: serverTimestamp(),
      });

      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setOriginalPrice('');
      setInventory([{ size: '', stock: '' }]);
      setCategory('clothes');
      setImageFile(null);
      setFormMessage({ type: 'success', text: 'تمت إضافة المنتج بنجاح!' });
    } catch (error: any) {
      console.error('Error adding product:', error);
      if (error.code === 'permission-denied') {
        setFormMessage({
          type: 'error',
          text: 'لا تملك الصلاحية لإضافة منتجات. يرجى تعديل Firestore Rules أولاً.',
        });
      } else {
        setFormMessage({
          type: 'error',
          text: `حدث خطأ أثناء إضافة المنتج: ${error.message}`,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
            onTabChange={setAdminTab}
            productsCount={products.length}
            pendingOrdersCount={pendingOrdersCount}
          />

          {/* Tab 1: Orders */}
          {adminTab === 'orders' && <AdminOrders />}

          {/* Tab 2: Add Product */}
          {adminTab === 'add_product' && (
            <AddProductTab
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              price={price}
              setPrice={setPrice}
              originalPrice={originalPrice}
              setOriginalPrice={setOriginalPrice}
              inventory={inventory}
              setInventory={setInventory}
              category={category}
              setCategory={setCategory}
              imageFile={imageFile}
              setImageFile={setImageFile}
              isSubmitting={isSubmitting}
              formMessage={formMessage}
              setFormMessage={setFormMessage}
              productsCount={products.length}
              onGoToInventory={() => setAdminTab('inventory')}
              onSubmit={handleSubmit}
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
              onGoToAddProduct={() => setAdminTab('add_product')}
            />
          )}
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
