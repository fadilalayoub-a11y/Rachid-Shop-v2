import {
  ShoppingCart,
  Menu,
  X,
  User as UserIcon,
  Search,
  ArrowRight,
  ShieldCheck,
  LogOut,
  Sparkles,
  Phone,
  Scale,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
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
import { AnnouncementBar } from './AnnouncementBar';
import { Logo, BrandEmblem } from './Logo';

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
  onSearchSubmit,
}: HeaderProps) {
  const { language, t, isRTL } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Modals for Compare & Theme Features
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const desktopSearchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);
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

  // Close dropdown on click outside
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

      if (showProfileMenu && !insideProfile) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery, showProfileMenu]);

  // Lock body scroll when mobile menu is open
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

  // Live quick search suggestions
  const quickSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q))
      )
      .slice(0, 5);
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

  // Smooth scroll helper
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Nav labels matching screenshot
  const navItems = [
    {
      id: 'shop',
      labelEn: 'Shop',
      labelAr: 'المتجر',
      labelFr: 'Boutique',
      onClick: () => {
        setActiveTab('home');
        if (onSearchChange) onSearchChange('');
        scrollToSection('products-section');
      },
    },
    {
      id: 'collections',
      labelEn: 'Collections',
      labelAr: 'التشكيلات',
      labelFr: 'Collections',
      onClick: () => {
        scrollToSection('shop-by-style');
      },
    },
    {
      id: 'explore',
      labelEn: 'Explore',
      labelAr: 'استكشف',
      labelFr: 'Explorer',
      onClick: () => {
        scrollToSection('shop-by-categories');
      },
    },
    {
      id: 'compare',
      labelEn: 'Compare',
      labelAr: 'المقارنة',
      labelFr: 'Comparer',
      onClick: () => {
        setIsCompareOpen(true);
      },
    },
    {
      id: 'contact',
      labelEn: 'Contact',
      labelAr: 'تواصل معنا',
      labelFr: 'Contact',
      onClick: () => {
        window.open('https://wa.me/212600000000', '_blank');
      },
    },
    {
      id: 'theme_features',
      labelEn: 'Theme features',
      labelAr: 'المميزات',
      labelFr: 'Caractéristiques',
      onClick: () => {
        setIsFeaturesOpen(true);
      },
    },
  ];

  const getNavLabel = (item: (typeof navItems)[0]) => {
    if (language === 'ar') return item.labelAr;
    if (language === 'fr') return item.labelFr;
    return item.labelEn;
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-2xs font-sans">
      {/* 1. Top Announcement Bar (matching screenshot) */}
      <AnnouncementBar />

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Full-Width Search Header (when search is open) */}
        {isSearchOpen && (
          <div className="md:hidden flex items-center h-18 gap-2" ref={mobileSearchContainerRef}>
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setIsDropdownOpen(false);
              }}
              className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-black cursor-pointer rounded-xl hover:bg-zinc-100 transition-colors"
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
                className="w-full bg-zinc-100 text-zinc-900 text-xs sm:text-sm rounded-xl py-2 pl-9 pr-9 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="w-8 h-8 flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                  aria-label={t.searchClearTitle}
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Mobile Suggestions */}
              {isDropdownOpen && searchQuery.trim().length > 0 && (
                <div className="absolute right-0 left-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 max-h-80 overflow-y-auto">
                  {quickSearchResults.length > 0 ? (
                    <div>
                      {quickSearchResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="flex items-center gap-3 px-3.5 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <img
                            src={normalizeProductImageUrl(product.image)}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-contain bg-zinc-50 border border-gray-100"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{product.name}</p>
                            <p className="text-[11px] text-gray-500 font-medium">
                              {product.price} {t.currency}
                            </p>
                          </div>
                        </div>
                      ))}
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

        {/* Desktop / Default Header Row */}
        <div className={`justify-between h-18 sm:h-20 items-center ${isSearchOpen ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Left: Brand Logo & Emblem */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Menu Button */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center text-zinc-800 hover:text-black rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link
              to="/"
              onClick={() => {
                setActiveTab('home');
                if (onSearchChange) onSearchChange('');
              }}
              className="flex items-center gap-2.5 text-zinc-950 hover:opacity-90 transition-opacity select-none group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 text-zinc-950 flex items-center justify-center transition-transform group-hover:scale-105">
                <BrandEmblem className="w-8 h-8 sm:w-9 sm:h-9" />
              </div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight font-sans text-black">
                RACHID SHOP
              </span>
            </Link>
          </div>

          {/* Center: Exact Navigation Links (Shop, Collections, Explore, Compare, Contact, Theme features) */}
          <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8 flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="text-[14.5px] lg:text-[15px] font-medium text-zinc-800 hover:text-black tracking-normal transition-colors cursor-pointer py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-black hover:after:w-full after:transition-all after:duration-200"
              >
                {getNavLabel(item)}
              </button>
            ))}
          </nav>

          {/* Right: Three Minimalist Icons (Search, Profile, Cart) */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* 1. Search Icon / Expandable Bar */}
            <div className="relative flex items-center" ref={desktopSearchContainerRef}>
              {isSearchOpen ? (
                <div className="hidden md:flex items-center relative w-64 lg:w-72 transition-all duration-300">
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
                    className="w-full bg-zinc-100 text-zinc-900 text-xs sm:text-sm rounded-xl py-2 pl-9 pr-9 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all shadow-inner"
                  />
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

                  {searchQuery ? (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-800 cursor-pointer"
                      title={t.searchClearTitle}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsSearchOpen(false);
                        setIsDropdownOpen(false);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-800 cursor-pointer"
                      title={t.searchCloseTitle}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(true);
                    setIsDropdownOpen(true);
                  }}
                  className="w-10 h-10 flex items-center justify-center text-zinc-800 hover:text-black hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
                  aria-label={t.searchButtonTitle}
                  title={t.searchButtonTitle}
                >
                  <Search className="w-5 h-5 stroke-[1.8]" />
                </button>
              )}

              {/* Suggestions Dropdown */}
              {isSearchOpen && isDropdownOpen && searchQuery.trim().length > 0 && (
                <div className="hidden md:block absolute top-full right-0 mt-2 w-72 lg:w-80 bg-white rounded-2xl shadow-2xl border border-zinc-100 py-2 z-50">
                  {quickSearchResults.length > 0 ? (
                    <div>
                      <div className="px-3.5 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        {t.searchSuggestions}
                      </div>
                      {quickSearchResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="flex items-center gap-3 px-3.5 py-2 hover:bg-zinc-50 cursor-pointer transition-colors"
                        >
                          <img
                            src={normalizeProductImageUrl(product.image)}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-100 object-contain p-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-zinc-900 truncate">{product.name}</p>
                            <p className="text-xs text-zinc-600 font-bold mt-0.5">
                              {product.price} {t.currency}
                            </p>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          if (onSearchSubmit) onSearchSubmit();
                        }}
                        className="w-full text-center py-2 text-xs font-bold text-black hover:bg-zinc-100 border-t border-zinc-100 mt-1 transition-colors cursor-pointer"
                      >
                        {t.searchViewAllResults}
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-zinc-500">
                      {t.searchNoResults} "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. User Account / Profile Icon */}
            <div className="relative" ref={profileMenuRef}>
              {user ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-10 h-10 flex items-center justify-center text-zinc-800 hover:text-black hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
                    aria-label={t.userProfile}
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-7 h-7 rounded-full border border-zinc-200" />
                    ) : (
                      <UserIcon className="w-5 h-5 stroke-[1.8]" />
                    )}
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl shadow-xl bg-white border border-zinc-100 py-1.5 focus:outline-none z-50 text-xs">
                      <div className="px-4 py-2 border-b border-zinc-100">
                        <p className="text-zinc-900 font-bold truncate">{user.displayName || t.userProfile}</p>
                        <p className="text-zinc-500 text-[11px] truncate">{user.email}</p>
                      </div>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-zinc-700 hover:bg-zinc-50 hover:text-black font-medium transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <span>{t.adminDashboard}</span>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-rose-600 hover:bg-rose-50 font-medium transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>{t.logout}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-10 h-10 flex items-center justify-center text-zinc-800 hover:text-black hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
                  aria-label={t.login}
                  title={t.login}
                >
                  <UserIcon className="w-5 h-5 stroke-[1.8]" />
                </button>
              )}
            </div>

            {/* 3. Shopping Cart Icon */}
            <button
              type="button"
              onClick={onOpenCart}
              className="w-10 h-10 flex items-center justify-center text-zinc-800 hover:text-black hover:bg-zinc-100 rounded-full transition-colors cursor-pointer relative"
              aria-label={t.cartTitle}
              title={t.cartTitle}
            >
              <ShoppingCart className="w-5 h-5 stroke-[1.8]" />
              {cartItemsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[10px] font-bold text-white bg-black rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isMobileMenuOpen && (
              <div className="md:hidden fixed inset-0 z-[9999]" dir={isRTL ? 'rtl' : 'ltr'}>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                  onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Drawer */}
                <motion.div
                  initial={{ x: isRTL ? '100%' : '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: isRTL ? '100%' : '-100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                  className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} w-72 max-w-[80vw] bg-white shadow-2xl flex flex-col justify-between z-[10000] overflow-y-auto`}
                >
                  <div>
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BrandEmblem className="w-7 h-7 text-black" />
                        <span className="font-extrabold text-sm tracking-tight">RACHID SHOP</span>
                      </div>
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-1.5 text-zinc-500 hover:text-black rounded-full hover:bg-zinc-100 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Nav Links */}
                    <div className="p-4 space-y-1">
                      {navItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            item.onClick();
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-800 hover:text-black hover:bg-zinc-50 transition-colors text-left"
                        >
                          <span>{getNavLabel(item)}</span>
                          <ArrowRight className={`w-3.5 h-3.5 text-zinc-400 ${isRTL ? 'rotate-180' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Footer inside mobile menu */}
                  <div className="p-4 border-t border-gray-100 bg-zinc-50/70 text-xs text-zinc-500 space-y-2">
                    <p className="font-bold text-zinc-900">RACHID SHOP</p>
                    <p>Luxe & Contemporary Menswear</p>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Compare Modal */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-zinc-100 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-black" />
                <h3 className="font-bold text-base text-zinc-900">
                  {language === 'ar' ? 'مقارنة أنماط وتشكيلات المتجر' : 'Style & Quality Comparison'}
                </h3>
              </div>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-black hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-700">
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                <h4 className="font-bold text-zinc-900 mb-1">👑 Old Money vs. 🔥 Streetwear</h4>
                <p className="text-zinc-600 leading-relaxed">
                  {language === 'ar'
                    ? 'ستايل أولد موني يعتمد على الأقمشة الطبيعية الفاخرة (الكتان والقطن الفاخر) والقصات الهادئة، بينما ستايل الستريت وير يركز على القصات الأوفر سايز العصرية والطابع الشبابي الجريء.'
                    : 'Old Money features refined linen, tailored silhouettes, and understated quiet luxury, whereas Streetwear prioritizes relaxed oversized cuts and urban bold statements.'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                <h4 className="font-bold text-zinc-900 mb-1">👟 أحذية كلاسيكية vs. سنيكرز رياضية</h4>
                <p className="text-zinc-600 leading-relaxed">
                  {language === 'ar'
                    ? 'الأحذية الكلاسيكية مصنوعة من جلد عالي الجودة ومناسبة للمناسبات والعمل، بينما السنيكرز الرياضية مصممة للراحة اليومية والنزهات الطويلة.'
                    : 'Classic footwear is crafted with premium leather for business and events, while contemporary sneakers deliver all-day ergonomic comfort.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCompareOpen(false)}
              className="w-full py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-900 cursor-pointer transition-colors"
            >
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* Theme Features Modal */}
      {isFeaturesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-100 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-black" />
                <h3 className="font-bold text-base text-zinc-900">
                  {language === 'ar' ? 'مميزات متجر رشيد' : 'Theme & Store Features'}
                </h3>
              </div>
              <button
                onClick={() => setIsFeaturesOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-black hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-700">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-zinc-900">{language === 'ar' ? 'أصلي 100%' : '100% Authentic Quality'}</p>
                  <p className="text-zinc-500 text-[11px]">{language === 'ar' ? 'أقمشة وخامات راقية مضمونة بالكامل' : 'Handpicked premium materials and guaranteed craft'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-zinc-900">{language === 'ar' ? 'معاينة المنتج قبل الدفع' : 'Inspect Before You Pay'}</p>
                  <p className="text-zinc-500 text-[11px]">{language === 'ar' ? 'الدفع نقداً عند الاستلام بعد التأكد من المقاس والجودة' : 'Cash on delivery with full order inspection rights'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-zinc-900">{language === 'ar' ? 'توصيل سريع لكافة المدن' : 'Fast Express Delivery'}</p>
                  <p className="text-zinc-500 text-[11px]">{language === 'ar' ? 'توصيل إلى باب منزلك في 24 إلى 48 ساعة' : 'To your doorstep in 24 to 48 hours across Morocco'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsFeaturesOpen(false)}
              className="w-full py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-900 cursor-pointer transition-colors"
            >
              {language === 'ar' ? 'حسناً' : 'Got it'}
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />}
    </header>
  );
}
