import { useState, useMemo, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { Product, CartItem } from '../types';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { Footer } from '../components/Footer';

export function Store() {
  const [activeTab, setActiveTab] = useState<'home' | 'clothes' | 'shoes' | 'accessories'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const productsSectionRef = useRef<HTMLDivElement>(null);

  const scrollToProducts = () => {
    if (productsSectionRef.current) {
      const yOffset = -80; // Offset for header
      const element = productsSectionRef.current;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleSearchChange = (queryText: string) => {
    setSearchQuery(queryText);
    if (queryText.trim().length > 1) {
      scrollToProducts();
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      // In RTL: positive scrollBy scrolls right, negative scrolls left
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProducts: Product[] = [];
      snapshot.forEach((doc) => {
        fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(fetchedProducts);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching products:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addToCart = (product: Product, size: string) => {
    setCartItems(prev => {
      const cartItemId = size ? `${product.id}-${size}` : product.id;
      const existing = prev.find(item => item.cartItemId === cartItemId);
      
      const productInventory = product.inventory?.find(i => i.size === size);
      const maxStock = productInventory ? productInventory.stock : Infinity;

      if (existing) {
        if (existing.quantity >= maxStock) return prev; // Cannot add more than stock
        return prev.map(item => 
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size, cartItemId }];
    });
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const productInventory = item.inventory?.find(i => i.size === item.selectedSize);
        const maxStock = productInventory ? productInventory.stock : Infinity;
        const safeQuantity = Math.min(quantity, maxStock);
        return { ...item, quantity: safeQuantity };
      }
      return item;
    }));
  };

  const removeItem = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const filteredProducts = useMemo(() => {
    let list = activeTab === 'home' ? products : products.filter(p => p.category === activeTab);

    // Apply search filter if active
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      // Search in all products or within current category if selected
      const basePool = activeTab === 'home' ? products : products.filter(p => p.category === activeTab);
      list = basePool.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }
    
    // Sort products so in-stock products appear first, out-of-stock items move to the bottom
    return [...list].sort((a, b) => {
      const stockA = a.inventory?.reduce((sum, item) => sum + item.stock, 0) ?? 0;
      const stockB = b.inventory?.reduce((sum, item) => sum + item.stock, 0) ?? 0;

      const aOutOfStock = stockA === 0;
      const bOutOfStock = stockB === 0;

      if (aOutOfStock && !bOutOfStock) return 1;
      if (!aOutOfStock && bOutOfStock) return -1;
      return 0;
    });
  }, [activeTab, products, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Header 
        cartItemsCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
        }}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onSearchSubmit={scrollToProducts}
      />

      <main className="flex-1">
        {activeTab === 'home' && !searchQuery.trim() && (
          <Hero onShopNow={scrollToProducts} />
        )}

        <div ref={productsSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {/* Section Header: Search Banner or Category Header */}
          {searchQuery.trim() ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-xs mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                    نتائج البحث عن: <span className="text-gray-900">"{searchQuery.trim()}"</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    تم العثور على {filteredProducts.length} {filteredProducts.length === 1 ? 'منتج' : 'منتجات'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="self-start sm:self-auto text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>مسح نتائج البحث</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                  {activeTab === 'home' 
                    ? 'وصل حديثاً' 
                    : activeTab === 'clothes' 
                      ? 'تشكيلة الملابس' 
                      : activeTab === 'shoes' 
                        ? 'تشكيلة الأحذية' 
                        : 'الإكسسوارات'}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'home' ? 'تسوق أحدث المنتجات المضافة للمتجر' : 'تشكيلة مختارة بعناية لأجلك'}
                </p>
              </div>

              {/* Carousel navigation buttons */}
              {!loading && filteredProducts.length > 0 && (
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs text-gray-400 hidden sm:inline ml-2">مرر للتصفح</span>
                  <button
                    onClick={() => scroll('right')}
                    aria-label="Previous products"
                    className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => scroll('left')}
                    aria-label="Next products"
                    className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            searchQuery.trim() ? (
              <div className="text-center py-16 px-4 bg-white rounded-3xl border border-gray-100 max-w-lg mx-auto flex flex-col items-center shadow-xs">
                <div className="w-16 h-16 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mb-4 border border-gray-100">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">لا توجد منتجات مطابقة للبحث</h3>
                <p className="text-sm text-gray-500 mt-1">
                  لم نتمكن من العثور على أي منتج يطابق "{searchQuery}". حاول استخدام كلمات بحث أخرى أو تصفح الأقسام مباشرة.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-6 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  عرض جميع المنتجات
                </button>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-gray-100 p-8">
                لا توجد منتجات حالياً. سيتم إضافة المنتجات قريباً.
              </div>
            )
          ) : searchQuery.trim() ? (
            /* Responsive Grid for Search Results */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="flex flex-col">
                  <ProductCard 
                    product={product} 
                    onSelect={(p) => setSelectedProduct(p)} 
                  />
                </div>
              ))}
            </div>
          ) : (
            /* Regular Category Horizontal Carousel */
            <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div 
                ref={scrollContainerRef}
                className="flex gap-5 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth no-scrollbar"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {filteredProducts.map(product => (
                  <div 
                    key={product.id}
                    className="w-[230px] sm:w-[250px] shrink-0 snap-start flex flex-col transition-transform duration-200"
                  >
                    <ProductCard 
                      product={product} 
                      onSelect={(p) => setSelectedProduct(p)} 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Full Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(prod, size) => {
          addToCart(prod, size);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => {
          setIsCartOpen(false);
          setSelectedProduct(null);
        }}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setSelectedProduct(null);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderSuccess={() => {
          setCartItems([]);
        }}
      />
    </div>
  );
}
