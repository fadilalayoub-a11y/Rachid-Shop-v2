import { ShoppingCart, Menu, X, ShoppingBag, UserCircle, LogOut, ShieldCheck, User as UserIcon, Search, ArrowRight } from 'lucide-react';
import { useState, useRef, useEffect, useMemo, KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';
import { Product } from '../types';

interface HeaderProps {
  cartItemsCount: number;
  onOpenCart: () => void;
  activeTab: 'home' | 'clothes' | 'shoes' | 'accessories';
  setActiveTab: (tab: 'home' | 'clothes' | 'shoes' | 'accessories') => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
  onSearchSubmit?: () => void;
}

export function Header({ 
  cartItemsCount, 
  onOpenCart, 
  activeTab, 
  setActiveTab,
  searchQuery = '',
  onSearchChange,
  products = [],
  onSelectProduct,
  onSearchSubmit
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const desktopSearchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);
  
  // Ref للقائمة المنسدلة للمستخدم
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        if (window.innerWidth >= 768) {
          desktopSearchInputRef.current?.focus();
        } else {
          mobileSearchInputRef.current?.focus();
        }
      }, 50);
    }
  }, [isSearchOpen]);

  // Close dropdown / search on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideDesktop = desktopSearchContainerRef.current?.contains(target);
      const insideMobile = mobileSearchContainerRef.current?.contains(target);
      const insideProfile = profileMenuRef.current?.contains(target);
      
      if (!insideDesktop && !insideMobile) {
        setIsDropdownOpen(false);
        if (!searchQuery) {
          setIsSearchOpen(false);
        }
      }
      
      // التعديل: إغلاق قائمة الحساب فقط إذا كان النقر خارجها
      if (showProfileMenu && !insideProfile) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery, showProfileMenu]);

  // Live instant suggestions (limit to 5)
  const quickSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [searchQuery, products]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowProfileMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleClearSearch = () => {
    if (onSearchChange) onSearchChange('');
    if (window.innerWidth >= 768) {
      desktopSearchInputRef.current?.focus();
    } else {
      mobileSearchInputRef.current?.focus();
    }
  };

  const handleProductClick = (product: Product) => {
    setIsDropdownOpen(false);
    setIsSearchOpen(false);
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setIsSearchOpen(false);
      if (onSearchChange) onSearchChange('');
    } else if (e.key === 'Enter') {
      setIsDropdownOpen(false);
      if (onSearchSubmit) onSearchSubmit();
    }
  };

  const tabs = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'clothes', label: 'الملابس' },
    { id: 'shoes', label: 'الأحذية' },
    { id: 'accessories', label: 'الإكسسوارات' },
  ] as const;

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Full-Width Search Header */}
        {isSearchOpen && (
          <div className="md:hidden flex items-center h-20 gap-3" ref={mobileSearchContainerRef}>
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setIsDropdownOpen(false);
              }}
              className="p-2 text-gray-600 hover:text-gray-900 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
              aria-label="إغلاق البحث"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <div className="relative flex-1">
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  if (onSearchChange) onSearchChange(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="ابحث عن منتج، ملابس، أحذية..."
                className="w-full bg-gray-100 text-gray-900 text-sm rounded-xl pl-9 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                  aria-label="مسح النص"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Mobile Live Suggestions Dropdown */}
              {isDropdownOpen && searchQuery.trim().length > 0 && (
                <div className="absolute right-0 left-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 max-h-80 overflow-y-auto">
                  {quickSearchResults.length > 0 ? (
                    <div>
                      <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        اقتراحات البحث
                      </div>
                      {quickSearchResults.map(product => (
                        <div
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{product.name}</p>
                            <p className="text-[11px] text-gray-500 font-medium">{product.price} درهم</p>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          if (onSearchSubmit) onSearchSubmit();
                        }}
                        className="w-full text-center py-2 text-xs font-bold text-gray-900 hover:bg-gray-100 border-t border-gray-100 mt-1 transition-colors cursor-pointer"
                      >
                        عرض جميع النتائج المطابقة
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-500">
                      لا توجد نتائج مطابقة لـ "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Header Row */}
        <div className={`justify-between h-20 items-center ${isSearchOpen ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Logo */}
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer gap-2" 
            onClick={() => {
              setActiveTab('home');
              if (onSearchChange) onSearchChange('');
            }}
          >
            <div className="bg-gray-900 text-white p-2 rounded-lg">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
                Rachid Shop
              </span>
              <span className="text-[0.65rem] md:text-xs text-gray-500 font-medium tracking-[0.2em] uppercase">
                Premium Quality
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 space-x-reverse flex-1 mr-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (onSearchChange) onSearchChange('');
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === tab.id && !searchQuery
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4 space-x-reverse">
            
            {/* Desktop Search */}
            <div className="relative flex items-center" ref={desktopSearchContainerRef}>
              {isSearchOpen ? (
                <div className="hidden md:flex items-center relative w-64 lg:w-80 transition-all duration-300">
                  <input
                    ref={desktopSearchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      if (onSearchChange) onSearchChange(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="ابحث عن منتج، ملابس، أحذية..."
                    className="w-full bg-gray-100 text-gray-900 text-sm rounded-full pl-9 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all shadow-inner"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  
                  {searchQuery ? (
                    <button
                      onClick={handleClearSearch}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                      title="مسح البحث"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsSearchOpen(false);
                        setIsDropdownOpen(false);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                      title="إغلاق البحث"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsSearchOpen(true);
                    setIsDropdownOpen(true);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer rounded-full hover:bg-gray-100 flex items-center justify-center"
                  aria-label="البحث عن منتج"
                  title="بحث عن منتج"
                >
                  <Search className="w-6 h-6" />
                </button>
              )}

              {/* Desktop Live Suggestions */}
              {isSearchOpen && isDropdownOpen && searchQuery.trim().length > 0 && (
                <div className="hidden md:block absolute right-0 top-full mt-2 w-72 lg:w-88 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                  {quickSearchResults.length > 0 ? (
                    <div>
                      <div className="px-3.5 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        اقتراحات البحث السريع
                      </div>
                      {quickSearchResults.map(product => (
                        <div
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="flex items-center gap-3 px-3.5 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{product.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-900 font-bold">{product.price} درهم</span>
                              {product.category && (
                                <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                  {product.category === 'clothes' ? 'ملابس' : product.category === 'shoes' ? 'أحذية' : 'إكسسوارات'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          if (onSearchSubmit) onSearchSubmit();
                        }}
                        className="w-full text-center py-2.5 text-xs font-bold text-gray-900 hover:bg-gray-100 border-t border-gray-100 mt-1 transition-colors cursor-pointer"
                      >
                        عرض كل النتائج المطابقة في الصفحة
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-500">
                      لا توجد منتجات مطابقة لـ "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
              
            {/* Authentication Button & Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              {user ? (
                <div>
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-pointer focus:outline-none"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border border-gray-200">
                        <UserIcon className="w-5 h-5" />
                      </div>
                    )}
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute left-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-50">
                      <div className="px-4 py-3">
                        <p className="text-sm text-gray-900 truncate font-medium">{user.displayName || 'مستخدم'}</p>
                        <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
                      </div>
                      {isAdmin && (
                        <div className="py-1">
                          <Link
                            to="/admin"
                            className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <ShieldCheck className="mr-3 ml-3 w-4 h-4 text-gray-400 group-hover:text-gray-500" />
                            لوحة الإدارة
                          </Link>
                        </div>
                      )}
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="mr-3 ml-3 w-4 h-4 text-red-500 group-hover:text-red-600" />
                          تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer rounded-full hover:bg-gray-50 border border-transparent"
                  aria-label="تسجيل الدخول"
                >
                  <UserCircle className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="p-2 text-gray-600 hover:text-gray-900 relative transition-colors cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-blue-600 rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="القائمة"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (onSearchChange) onSearchChange('');
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-right px-3 py-2 rounded-md text-base font-medium ${
                  activeTab === tab.id && !searchQuery
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}