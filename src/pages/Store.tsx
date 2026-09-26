import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Search, X, Sparkles, Tag, Layers } from 'lucide-react';
import { db } from '../lib/firebase';
import { Product, CartItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { SeoHead } from '../components/SeoHead';
import { ProductCard } from '../components/ProductCard';
import { ProductSection } from '../components/ProductSection';
import { ShopByCategories } from '../components/ShopByCategories';
import { FacetedFilter, FilterState } from '../components/FacetedFilter';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { Footer } from '../components/Footer';
import { LIFESTYLE_COLLECTIONS, isProductInCollection } from '../utils/collections';

interface StoreProps {
  initialTab?: 'home' | 'clothes' | 'shoes' | 'accessories';
}

export function Store({ initialTab }: StoreProps) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { categorySlug, productId, collectionSlug } = useParams<{
    categorySlug?: string;
    productId?: string;
    collectionSlug?: string;
  }>();

  // اكتشاف المجموعة النشطة (إن وجدت) من المسار أو المعاملات
  const activeCollection = useMemo(() => {
    if (collectionSlug) {
      return LIFESTYLE_COLLECTIONS.find(c => c.slug === collectionSlug) || null;
    }
    const match = location.pathname.match(/\/collections?\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return LIFESTYLE_COLLECTIONS.find(c => c.slug === match[1]) || null;
    }
    const searchParams = new URLSearchParams(location.search);
    const queryColl = searchParams.get('collection');
    if (queryColl) {
      return LIFESTYLE_COLLECTIONS.find(c => c.slug === queryColl) || null;
    }
    return null;
  }, [collectionSlug, location.pathname, location.search]);

  // تحديد التبويب الحالي بناء على مسار الـ URL
  const determineActiveTab = useCallback((): 'home' | 'clothes' | 'shoes' | 'accessories' => {
    if (initialTab) return initialTab;
    if (categorySlug) {
      if (['clothes', 'shoes', 'accessories'].includes(categorySlug)) {
        return categorySlug as 'clothes' | 'shoes' | 'accessories';
      }
    }
    const path = location.pathname.replace(/^\//, '').toLowerCase();
    if (path === 'clothes' || path === 'shoes' || path === 'accessories') {
      return path as 'clothes' | 'shoes' | 'accessories';
    }
    return 'home';
  }, [initialTab, categorySlug, location.pathname]);

  // قراءة البيانات الأولية المحقونة من الخادم لتفادي التعارض أو الوميض
  const getInitialProduct = useCallback((): Product | null => {
    if (typeof window !== 'undefined' && productId) {
      const ssrData = (window as any).__INITIAL_PRODUCT_DATA__;
      if (ssrData && ssrData.id === productId) {
        return ssrData as Product;
      }
    }
    return null;
  }, [productId]);

  const [activeTab, setActiveTabState] = useState<'home' | 'clothes' | 'shoes' | 'accessories'>(determineActiveTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(getInitialProduct);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const productsSectionRef = useRef<HTMLDivElement>(null);

  // حالة الفلترة المتقدمة (Size-First & Facets)
  const [filterState, setFilterState] = useState<FilterState>({
    size: null,
    categoryType: null,
    brand: null,
    priceRange: null,
    inStockOnly: true,
  });

  // تحديث التبويب تلقائياً عند تغير مسار الرابط (URL)
  useEffect(() => {
    const tabFromUrl = determineActiveTab();
    setActiveTabState(tabFromUrl);
    // تفريغ الفلتر عند التنقل بين الأقسام
    setFilterState({
      size: null,
      categoryType: null,
      brand: null,
      priceRange: null,
      inStockOnly: true,
    });
  }, [determineActiveTab, location.pathname]);

  // دالة تغيير التبويب مع تحديث رابط المتصفح
  const handleTabChange = (tab: 'home' | 'clothes' | 'shoes' | 'accessories') => {
    setActiveTabState(tab);
    setSearchQuery('');
    if (tab === 'home') {
      navigate('/', { replace: false });
    } else {
      navigate(`/${tab}`, { replace: false });
    }
  };

  // دالة اختيار المنتج مع تحديث رابط المتصفح إلى /product/:id
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    navigate(`/product/${product.id}`, { replace: false });
  };

  // دالة إغلاق نافذة تفاصيل المنتج والعودة للرابط المناسب
  const handleCloseProductModal = () => {
    setSelectedProduct(null);
    if (location.pathname.startsWith('/product/')) {
      if (activeCollection) {
        navigate(`/collection/${activeCollection.slug}`, { replace: false });
      } else if (activeTab === 'home') {
        navigate('/', { replace: false });
      } else {
        navigate(`/${activeTab}`, { replace: false });
      }
    }
  };

  const scrollToProducts = () => {
    if (productsSectionRef.current) {
      const yOffset = -80;
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

  // جلب المنتجات من Firestore
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

  // فتح المنتج تلقائياً عند الدخول برابط مباشر ومزامنة البيانات الحية
  useEffect(() => {
    if (productId) {
      if (products.length > 0) {
        const found = products.find(p => p.id === productId);
        if (found) {
          setSelectedProduct(prev => {
            if (prev && prev.id === found.id) {
              return { ...prev, ...found };
            }
            return found;
          });
        }
      } else {
        const initial = getInitialProduct();
        if (initial) {
          setSelectedProduct(prev => prev || initial);
        }
      }
    } else if (!location.pathname.startsWith('/product/') && selectedProduct && !productId) {
      setSelectedProduct(null);
    }
  }, [productId, products, location.pathname, getInitialProduct]);

  const addToCart = (product: Product, size: string) => {
    setCartItems(prev => {
      const cartItemId = size ? `${product.id}-${size}` : product.id;
      const existing = prev.find(item => item.cartItemId === cartItemId);
      
      const productInventory = product.inventory?.find(i => i.size === size);
      const maxStock = productInventory ? productInventory.stock : Infinity;

      if (existing) {
        if (existing.quantity >= maxStock) {
          return prev;
        }
        return prev.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size, cartItemId }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        
        const productInventory = item.inventory?.find(i => i.size === item.selectedSize);
        const maxStock = productInventory ? productInventory.stock : Infinity;
        
        if (newQty > maxStock) return item;
        
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeItem = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  // المنتجات المتوفرة فقط (التي بها مخزون كلي أكبر من صفر)
  const availableProducts = useMemo(() => {
    return products.filter(p => {
      const totalStock = p.inventory?.reduce((sum, item) => sum + item.stock, 0) || 0;
      return totalStock > 0;
    });
  }, [products]);

  // 1. وصل حديثاً: أحدث 8-12 منتج مضاف للمتجر عبر جميع التصنيفات لإظهار عمق المخزون
  const newArrivals = useMemo(() => {
    const getTime = (p: Product) => {
      if (!p.createdAt) return 0;
      if (typeof p.createdAt.toMillis === 'function') return p.createdAt.toMillis();
      if (p.createdAt.seconds) return p.createdAt.seconds * 1000;
      const parsed = new Date(p.createdAt).getTime();
      return isNaN(parsed) ? 0 : parsed;
    };

    const sortedByDate = [...availableProducts].sort((a, b) => getTime(b) - getTime(a));
    return sortedByDate.slice(0, 12);
  }, [availableProducts]);

  // 2. العروض الخاصة: المنتجات المخفضة (originalPrice > price)
  const discountProducts = useMemo(() => {
    return availableProducts.filter(p => p.originalPrice && p.originalPrice > p.price);
  }, [availableProducts]);

  // تحديد المنتجات المناسبة للمجموعة أو القسم الحالي قبل تطبيق الفلاتر
  const baseCollectionPool = useMemo(() => {
    if (activeCollection) {
      return availableProducts.filter(p => isProductInCollection(p, activeCollection.slug));
    }
    if (activeTab === 'home') {
      return availableProducts;
    }
    return availableProducts.filter(p => p.category === activeTab);
  }, [activeCollection, activeTab, availableProducts]);

  // أنواع القطع المتوفرة في هذا القسم للفلترة
  const availableCategoryTypes = useMemo(() => {
    if (activeCollection) {
      return activeCollection.categoryTypes;
    }
    if (activeTab === 'clothes') {
      return [
        { id: 'jeans', nameAr: 'بناطيل جينز', nameEn: 'Jeans' },
        { id: 'trackpants', nameAr: 'كيطمة وبناطيل رياضية', nameEn: 'Trackpants' },
        { id: 'shirt', nameAr: 'قمصان', nameEn: 'Shirts' },
        { id: 'jacket', nameAr: 'جواكت وهوديز', nameEn: 'Jackets & Hoodies' },
        { id: 'shorts', nameAr: 'شورتات', nameEn: 'Shorts' },
      ];
    }
    if (activeTab === 'shoes') {
      return [
        { id: 'sneakers', nameAr: 'سنيكرز وأحذية رياضية', nameEn: 'Sneakers' },
        { id: 'casual-shoe', nameAr: 'أحذية كاجوال وجلدية', nameEn: 'Casual Shoes' },
        { id: 'slides', nameAr: 'كلاكيط وصنادل', nameEn: 'Slides & Sandals' },
      ];
    }
    if (activeTab === 'accessories') {
      return [
        { id: 'watch', nameAr: 'ساعات يد', nameEn: 'Watches' },
        { id: 'perfume', nameAr: 'عطور', nameEn: 'Perfumes' },
        { id: 'sunglasses', nameAr: 'نظارات شمسية', nameEn: 'Sunglasses' },
        { id: 'caps', nameAr: 'قبعات', nameEn: 'Caps' },
      ];
    }
    return [];
  }, [activeCollection, activeTab]);

  // المنتجات المصفاة بناء على الفلترة المتعددة (Size-First + Facets + Search)
  const filteredProducts = useMemo(() => {
    let list = [...baseCollectionPool];

    // 1. فلترة المقاس (مع إخفاء المتغيرات غير المتوفرة تلقائياً):
    // Variant Management: If Size 42 is chosen, only show products where size 42 has stock > 0
    if (filterState.size) {
      list = list.filter(p =>
        p.inventory && p.inventory.some(inv => inv.size.trim() === filterState.size && inv.stock > 0)
      );
    }

    // 2. فلترة نوع القطعة (Jeans, Shirts, Sneakers, etc.)
    if (filterState.categoryType) {
      const type = filterState.categoryType.toLowerCase();
      
      // قاموس مرادفات موسع للتعرف التلقائي الذكي من خلال القسم التفصيلي والاسم والوصف والوسوم
      const typeSynonyms: Record<string, string[]> = {
        jeans: ['جينز', 'دينيم', 'denim', 'jean', 'jeans', 'pantalon jean', 'سروال جينز', 'trousers'],
        trackpants: ['كيطمة', 'سيرفيت', 'survetement', 'trackpant', 'trackpants', 'jogger', 'joggers', 'جوجرز', 'سروال رياضي', 'بنطلون رياضي', 'sweatpants'],
        shirt: ['قميص', 'قمصان', 'chemise', 'chemises', 'shirt', 'shirts', 'polo', 'بولو', 'تيشيرت', 't-shirt', 't-shirts'],
        jacket: ['جاكيت', 'جاكيتات', 'جواكت', 'هودي', 'هوديز', 'veste', 'jacket', 'bomber', 'hoodie', 'hoodies', 'sweat', 'سويت شيرت', 'معطف', 'manteau', 'jackets'],
        shorts: ['شورت', 'شورتات', 'short', 'shorts', 'برمودا', 'bermuda'],
        sneakers: ['سنيكرز', 'sneaker', 'sneakers', 'حذاء رياضي', 'سبادري', 'running', 'جري', 'nike', 'adidas', 'puma', 'jordan', 'dunk', 'running-shoes'],
        'casual-shoe': ['كاجوال', 'جلد', 'حذاء كاجوال', 'mocassin', 'لوفر', 'موكاسان', 'chaussure', 'formal-shoes'],
        slides: ['صندل', 'كلاكيط', 'سلايدز', 'slide', 'slides', 'sandal', 'sandals', 'claquette', 'claquettes'],
        watch: ['ساعة', 'ساعات', 'watch', 'watches', 'montre', 'montres', 'watches-perfumes'],
        perfume: ['عطر', 'عطور', 'perfume', 'fragrance', 'parfum', 'parfums', 'watches-perfumes'],
        sunglasses: ['نظارة', 'نظارات', 'sunglass', 'sunglasses', 'lunette', 'lunettes'],
        caps: ['قبعة', 'طاقية', 'كاب', 'cap', 'caps', 'casquette', 'caps-hats', 'bags'],
      };

      const synonyms = typeSynonyms[type] || [type];

      list = list.filter(p => {
        if (p.subcategory && (p.subcategory.toLowerCase() === type || synonyms.includes(p.subcategory.toLowerCase()))) {
          return true;
        }
        const corpus = `${p.name || ''} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
        return synonyms.some(syn => corpus.includes(syn.toLowerCase()));
      });
    }

    // 3. فلترة الماركة
    if (filterState.brand) {
      list = list.filter(p => p.brand === filterState.brand);
    }

    // 4. فلترة نطاق السعر
    if (filterState.priceRange) {
      if (filterState.priceRange === 'under-200') {
        list = list.filter(p => p.price < 200);
      } else if (filterState.priceRange === '200-400') {
        list = list.filter(p => p.price >= 200 && p.price <= 400);
      } else if (filterState.priceRange === '400-plus') {
        list = list.filter(p => p.price > 400);
      }
    }

    // 5. تصفية نتائج البحث
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    return list;
  }, [baseCollectionPool, filterState, searchQuery]);

  // العناوين الديناميكية
  const pageTitle = useMemo(() => {
    if (activeCollection) {
      return language === 'ar' ? activeCollection.nameAr : activeCollection.nameEn;
    }
    switch (activeTab) {
      case 'clothes': return t.navClothes;
      case 'shoes': return t.navShoes;
      case 'accessories': return t.navAccessories;
      default: return t.navHome;
    }
  }, [activeCollection, activeTab, language, t]);

  const pageSubtitle = useMemo(() => {
    if (activeCollection) {
      return language === 'ar' ? activeCollection.subtitleAr : activeCollection.subtitleEn;
    }
    return t.curatedCollectionSubtitle;
  }, [activeCollection, language, t]);

  return (
    <div className="min-h-screen bg-[#f8f8fa] font-sans text-[#222222] flex flex-col">
      {/* Dynamic SEO & Schema.org Structured Data */}
      <SeoHead 
        category={activeCollection ? 'collection' : activeTab}
        collectionTitle={activeCollection ? (language === 'ar' ? activeCollection.nameAr : activeCollection.nameEn) : undefined}
        description={activeCollection ? (language === 'ar' ? activeCollection.seoDescriptionAr : activeCollection.seoDescriptionEn) : undefined}
        product={selectedProduct} 
        currency={t.currency}
      />

      <Header 
        cartItemsCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        products={products}
        onSelectProduct={handleSelectProduct}
        onSearchSubmit={scrollToProducts}
      />

      <main className="flex-1 pb-16">
        {/* البانر الرئيسي يظهر في الصفحة الرئيسية فقط عند عدم وجود بحث أو تصفح مجموعة */}
        {activeTab === 'home' && !activeCollection && !searchQuery && (
          <Hero onShopNow={scrollToProducts} />
        )}

        <div ref={productsSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-9 scroll-mt-24">
          
          {/* عنوان نتائج البحث إن وجد */}
          {searchQuery.trim() && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-stone-200/80 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-stone-950 text-white flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-950 tracking-tight">
                    {t.searchResultsFor(searchQuery)}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                    {t.foundResults(filteredProducts.length)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="self-start sm:self-auto min-h-[44px] text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4" />
                <span>{t.clearSearch}</span>
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-stone-950 border-t-transparent"></div>
            </div>
          ) : searchQuery.trim() ? (
            /* نتائج البحث */
            filteredProducts.length === 0 ? (
              <div className="text-center py-16 px-5 bg-white rounded-3xl border border-stone-200/80 max-w-lg mx-auto flex flex-col items-center shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-stone-50 text-stone-400 flex items-center justify-center mb-4 border border-stone-100">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-stone-950">{t.noMatchingSearchProducts}</h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1.5">
                  {t.noMatchingSearchDescription(searchQuery)}
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-6 min-h-[44px] px-6 py-2.5 bg-stone-950 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-stone-900 transition-colors cursor-pointer"
                >
                  {t.viewAllProducts}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
                {filteredProducts.map(product => (
                  <div key={product.id} className="flex flex-col">
                    <ProductCard 
                      product={product} 
                      onSelect={handleSelectProduct} 
                    />
                  </div>
                ))}
              </div>
            )
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-stone-500 bg-white rounded-3xl border border-stone-200/80 p-8">
              {t.noProductsAvailable}
            </div>
          ) : activeTab === 'home' && !activeCollection ? (
            /* 1. الصفحة الرئيسية */
            <div className="space-y-10 sm:space-y-12">
              
              {/* قسم المجموعات الأربع المنتقاة: SHOP BY CATEGORIES (Denim & Casual, Sportswear, Summer, Watches & Fragrances) */}
              <ShopByCategories />

              {/* القسم الأول: وصل حديثاً (8 إلى 12 منتج ديناميكياً عبر كافة التصنيفات) */}
              <ProductSection 
                title={t.newArrivalsTitle}
                subtitle={t.newArrivalsSubtitle}
                badge={t.newBadge}
                products={newArrivals}
                onSelectProduct={handleSelectProduct}
                emptyMessage={t.noProductsAvailable}
              />

              {/* قسم العروض الخاصة (Special Offers / Sale Section) بدلاً من قسم جميع المنتجات */}
              <ProductSection 
                title={t.discountsTitle}
                subtitle={t.discountsSubtitle}
                badge={t.saleBadge}
                products={discountProducts}
                onSelectProduct={handleSelectProduct}
                emptyMessage={t.noDiscountsMessage}
              />
            </div>
          ) : (
            /* 2. صفحة مجموعة منتقاة أو قسم رئيسي (ملابس، أحذية، إكسسوارات) مع نظام الفلترة البارز بالمقاس */
            <div className="flex flex-col">
              
              {/* ترويسة القسم / المجموعة الأنيقة مع مسار التنقل */}
              <div className="mb-6 bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-stone-200/80 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-400 mb-2 uppercase tracking-wider">
                  <span className="hover:text-stone-700 cursor-pointer" onClick={() => navigate('/')}>
                    {t.navHome}
                  </span>
                  <span>/</span>
                  <span className="text-stone-900">{pageTitle}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-950 tracking-tight flex items-center gap-3">
                      <span>{pageTitle}</span>
                      {activeCollection && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-700 text-xs font-bold border border-stone-200">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>{language === 'ar' ? 'مجموعة منتقاة' : 'Curated Drop'}</span>
                        </span>
                      )}
                    </h1>
                    <p className="mt-1.5 text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
                      {pageSubtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-stone-600 bg-stone-50 px-3.5 py-2 rounded-xl border border-stone-200 self-start md:self-auto shrink-0">
                    <Layers className="w-4 h-4 text-stone-500" />
                    <span>{language === 'ar' ? `${filteredProducts.length} قطعة متوفرة` : `${filteredProducts.length} items`}</span>
                  </div>
                </div>
              </div>

              {/* شريط الفلترة البارز بمبدأ المقاس أولاً (Size-First Faceted Filter) */}
              <FacetedFilter
                products={baseCollectionPool}
                filterState={filterState}
                onFilterChange={setFilterState}
                availableCategoryTypes={availableCategoryTypes}
                totalResultsCount={filteredProducts.length}
              />

              {/* شبكة المنتجات (Catalog Grid) */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 px-6 bg-white rounded-3xl border border-stone-200/80 max-w-md mx-auto my-6 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
                    <Tag className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black text-stone-950">
                    {language === 'ar' ? 'لا توجد قطع متوفرة بهذا المقاس أو الفلتر' : 'No items match your selected filters'}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 mb-5">
                    {language === 'ar' ? 'جرب اختيار مقاس آخر أو إلغاء بعض الفلاتر لعرض باقي القطع' : 'Try selecting a different size or clear your filters'}
                  </p>
                  <button
                    onClick={() => setFilterState({ size: null, categoryType: null, brand: null, priceRange: null, inStockOnly: true })}
                    className="px-5 py-2.5 rounded-xl bg-stone-950 text-white text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer shadow-sm"
                  >
                    {language === 'ar' ? 'إعادة ضبط كل الفلاتر' : 'Reset Filters'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="flex flex-col">
                      <ProductCard 
                        product={product} 
                        onSelect={handleSelectProduct} 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Full Product Detail Modal with URL sync */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={handleCloseProductModal}
        onAddToCart={(prod, size) => {
          addToCart(prod, size);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => {
          setIsCartOpen(false);
        }}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={() => {
          setIsCartOpen(false);
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
