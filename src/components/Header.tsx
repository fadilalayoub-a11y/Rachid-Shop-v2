import { ShoppingCart, Menu, X, UserCircle, LogOut, ShieldCheck, User as UserIcon, Search, ArrowRight } from 'lucide-react';
import { useState, useRef, useEffect, useMemo, KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';
import { Product } from '../types';
import { normalizeProductImageUrl } from '../utils/image';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from './Logo';
import { AnnouncementBar } from './AnnouncementBar';

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
  const { t, isRTL } = useLanguage();
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

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

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
    { id: 'home', label: t.navHome },
    { id: 'clothes', label: t.navClothes },
    { id: 'shoes', label: t.navShoes },
    { id: 'accessories', label: t.navAccessories },
  ] as const;

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs sticky top-0 z-40 transition-shadow">
      {/* الشريط الإعلاني العلوي باللغات الرسمية للموقع */}
      <AnnouncementBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8">
        
        {/* Mobile Full-Width Search Header */}
        {isSearchOpen && (
          <div className="md:hidden flex items-center h-20 gap-2" ref={mobileSearchContainerRef}>
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setIsDropdownOpen(false);
              }}
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-600 hover:text-stone-950 cursor-pointer rounded-xl hover:bg-stone-100 transition-colors active:scale-95"
              aria-label={t.searchCloseAria}
            >
              <ArrowRight className={`w-5 h-5 ${isRTL ? '' : 'rotate-180'}`} />
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
                placeholder={t.searchPlaceholder}
                className={`w-full bg-stone-100 text-stone-950 text-sm rounded-xl py-2.5 h-11 focus:outline-none focus:ring-2 focus:ring-stone-950 focus:bg-white transition-all ${
                  isRTL ? 'pl-9 pr-10' : 'pr-9 pl-10'
                }`}
              />
              <Search className={`w-4 h-4 text-stone-400 absolute top-1/2 -translate-y-1/2 pointer-events-none ${
                isRTL ? 'right-3.5' : 'left-3.5'
              }`} />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center absolute top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer ${
                    isRTL ? 'left-1' : 'right-1'
                  }`}
                  aria-label={t.searchClearTitle}
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
                        {t.searchSuggestions}
                      </div>
                      {quickSearchResults.map(product => (
                        <div
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 shrink-0 flex items-center justify-center p-0.5 overflow-hidden">
                            <img 
                              src={normalizeProductImageUrl(product.image)} 
                              alt={product.name} 
                              className="w-full h-full object-contain" 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{product.name}</p>
                            <p className="text-[11px] text-gray-500 font-medium">{product.price} {t.currency}</p>
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
                        {t.searchViewAllResults}
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-500">
                      {t.searchNoResults} "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Header Row */}
        <div className={`relative justify-between h-20 items-center ${isSearchOpen ? 'hidden md:flex' : 'flex'}`}>
          
          <div className="flex items-center gap-2 md:gap-0 z-10">
            {/* Mobile menu button with 44px touch target */}
            <button
              className="md:hidden w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center -ms-1 text-stone-700 hover:text-stone-950 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer active:scale-95"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo (Desktop display in normal flow) */}
            <div 
              className="hidden md:flex flex-shrink-0 items-center cursor-pointer py-1" 
              onClick={() => {
                setActiveTab('home');
                if (onSearchChange) onSearchChange('');
              }}
            >
              <Logo className="h-10 sm:h-12 w-auto" />
            </div>
          </div>

          {/* Mobile Logo Centered */}
          <div 
            className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer pointer-events-auto"
            onClick={() => {
              setActiveTab('home');
              if (onSearchChange) onSearchChange('');
            }}
          >
            <Logo className="h-9 sm:h-10 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex items-center gap-1 lg:gap-2 flex-1 ${isRTL ? 'mr-6 lg:mr-10' : 'ml-6 lg:ml-10'}`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (onSearchChange) onSearchChange('');
                }}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id && !searchQuery
                    ? 'text-stone-950 bg-stone-100 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-stone-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
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
                    placeholder={t.searchPlaceholder}
                    className={`w-full bg-stone-100 text-stone-950 text-sm rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-stone-950 focus:bg-white transition-all shadow-inner ${
                      isRTL ? 'pl-9 pr-10' : 'pr-9 pl-10'
                    }`}
                  />
                  <Search className={`w-4 h-4 text-stone-400 absolute top-1/2 -translate-y-1/2 pointer-events-none ${
                    isRTL ? 'right-3.5' : 'left-3.5'
                  }`} />
                  
                  {searchQuery ? (
                    <button
                      onClick={handleClearSearch}
                      className={`absolute top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer ${
                        isRTL ? 'left-2.5' : 'right-2.5'
                      }`}
                      title={t.searchClearTitle}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsSearchOpen(false);
                        setIsDropdownOpen(false);
                      }}
                      className={`absolute top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer ${
                        isRTL ? 'left-2.5' : 'right-2.5'
                      }`}
                      title={t.searchCloseTitle}
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
                  className="w-11 h-11 min-w-[44px] min-h-[44px] text-stone-700 hover:text-stone-950 transition-colors cursor-pointer rounded-xl hover:bg-stone-100 flex items-center justify-center active:scale-95"
                  aria-label={t.searchButtonTitle}
                  title={t.searchButtonTitle}
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              {/* Desktop Live Suggestions */}
              {isSearchOpen && isDropdownOpen && searchQuery.trim().length > 0 && (
                <div className={`hidden md:block absolute top-full mt-2 w-72 lg:w-88 bg-white rounded-2xl shadow-2xl border border-stone-100 py-2 z-50 ${
                  isRTL ? 'right-0' : 'left-0'
                }`}>
                  {quickSearchResults.length > 0 ? (
                    <div>
                      <div className="px-3.5 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                        {t.searchSuggestions}
                      </div>
                      {quickSearchResults.map(product => (
                        <div
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="flex items-center gap-3 px-3.5 py-2 hover:bg-stone-50 cursor-pointer transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-stone-50 border border-stone-100 shrink-0 flex items-center justify-center p-0.5 overflow-hidden">
                            <img 
                              src={normalizeProductImageUrl(product.image)} 
                              alt={product.name} 
                              className="w-full h-full object-contain" 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-stone-900 truncate">{product.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-stone-900 font-bold">{product.price} {t.currency}</span>
                              {product.category && (
                                <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                                  {product.category === 'clothes' ? t.navClothes : product.category === 'shoes' ? t.navShoes : t.navAccessories}
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
                        className="w-full text-center py-2.5 text-xs font-bold text-stone-900 hover:bg-stone-100 border-t border-stone-100 mt-1 transition-colors cursor-pointer"
                      >
                        {t.searchViewAllResults}
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-stone-500">
                      {t.searchNoResults} "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
              
            {/* Authentication Button & Profile Dropdown */}
            <div className="hidden md:block relative" ref={profileMenuRef}>
              {user ? (
                <div>
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all cursor-pointer focus:outline-none"
                    aria-label={t.userProfile}
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-stone-200" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center border border-stone-200">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className={`absolute mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-stone-100 focus:outline-none z-50 ${
                      isRTL ? 'left-0' : 'right-0'
                    }`}>
                      <div className="px-4 py-3">
                        <p className="text-sm text-stone-900 truncate font-bold">{user.displayName || t.userProfile}</p>
                        <p className="text-xs text-stone-500 truncate mt-1">{user.email}</p>
                      </div>
                      {isAdmin && (
                        <div className="py-1">
                          <Link
                            to="/admin"
                            className="group flex items-center px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <ShieldCheck className="mx-3 w-4 h-4 text-stone-400 group-hover:text-stone-600" />
                            {t.adminDashboard}
                          </Link>
                        </div>
                      )}
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="group flex w-full items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="mx-3 w-4 h-4 text-rose-500 group-hover:text-rose-600" />
                          {t.logout}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-700 hover:text-stone-950 transition-colors cursor-pointer rounded-xl hover:bg-stone-100"
                  aria-label={t.login}
                  title={t.login}
                >
                  <UserCircle className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Cart Button with 44px Touch Target & Gold/Stone Luxury Badge */}
            <button
              onClick={onOpenCart}
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-700 hover:text-stone-950 relative transition-colors cursor-pointer rounded-xl hover:bg-stone-100 active:scale-95"
              aria-label={t.cartTitle}
              title={t.cartTitle}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black leading-none text-stone-950 bg-[#e5be6b] border border-stone-950/20 rounded-full shadow-xs">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Sidebar Drawer (البار الجانبي) via Portal with Smooth Directional Slide */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-[9999]" dir={isRTL ? 'rtl' : 'ltr'}>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/65 backdrop-blur-xs"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
              />

              {/* Sidebar Drawer - Opens smoothly from the same side as the menu button */}
              <motion.div 
                initial={{ x: isRTL ? '100%' : '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: isRTL ? '100%' : '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className={`fixed inset-y-0 ${isRTL ? 'right-0 border-l' : 'left-0 border-r'} w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between z-[10000] overflow-y-auto border-gray-100`}
              >
                {/* Top Area */}
                <div>
                  {/* Sidebar Header */}
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => {
                        setActiveTab('home');
                        if (onSearchChange) onSearchChange('');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Logo className="h-9 w-auto" />
                    </div>

                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-200/70 transition-colors cursor-pointer"
                      aria-label="Close menu"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Navigation Tabs */}
                  <div className="p-4 space-y-1.5">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
                      {isRTL ? 'أقسام المتجر' : 'Categories'}
                    </p>
                    {tabs.map((tab) => {
                      const isActive = activeTab === tab.id && !searchQuery;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            if (onSearchChange) onSearchChange('');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-gray-950 text-white shadow-sm'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span>{tab.label}</span>
                          {isActive && (
                            <span className="w-2 h-2 rounded-full bg-blue-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sidebar Bottom / Profile / Cart Actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/70 space-y-3">
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-gray-200/80 shadow-2xs">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="Profile" className="w-9 h-9 rounded-full border border-gray-200 shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 border border-gray-200">
                            <UserIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-900 truncate">{user.displayName || t.userProfile}</p>
                          <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>{t.adminDashboard}</span>
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center justify-center gap-2 w-full py-2 px-3 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-red-100"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t.logout}</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-3 px-4 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      <UserCircle className="w-4 h-4" />
                      <span>{t.login}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenCart();
                    }}
                    className="w-full py-2.5 px-4 bg-white hover:bg-gray-100 border border-gray-200 text-gray-900 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-blue-600" />
                      <span>{t.cartTitle}</span>
                    </div>
                    <span className="bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {cartItemsCount}
                    </span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}