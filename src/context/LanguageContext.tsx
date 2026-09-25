import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar' | 'fr';

export interface Translations {
  // Brand & Slogans
  brandName: string;
  brandTagline: string;
  currency: string;

  // Announcement Top Bar
  announcementAuthentic: string;
  announcementFreeShipping: string;
  announcementInspectBeforePay: string;

  // Header Nav
  navHome: string;
  navClothes: string;
  navShoes: string;
  navAccessories: string;

  // Search
  searchPlaceholder: string;
  searchButtonTitle: string;
  searchCloseTitle: string;
  searchClearTitle: string;
  searchCloseAria: string;
  searchSuggestions: string;
  searchNoResults: string;
  searchViewAllResults: string;
  searchResultsFor: string;
  foundProductsCount: (count: number) => string;
  clearSearch: string;
  noMatchingProductsTitle: string;
  noMatchingProductsDesc: (query: string) => string;
  showAllProducts: string;

  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;

  // Sections
  newArrivalsTitle: string;
  newArrivalsSubtitle: string;
  newBadge: string;
  discountsTitle: string;
  discountsSubtitle: string;
  saleBadge: string;
  allProductsTitle: string;
  allProductsSubtitle: string;
  emptyProductsNotice: string;
  clothesTitle: string;
  shoesTitle: string;
  accessoriesTitle: string;

  // Product Card & Details
  outOfStock: string;
  remainingStock: (count: number) => string;
  viewDetailsAndSizes: string;
  requestStockAlert: string;
  selectSizeFirst: string;
  selectSizePrompt: string;
  availableSizes: string;
  addToCart: string;
  productAddedToCart: string;
  instantCheckout: string;
  quantity: string;
  descriptionTitle: string;
  guaranteedQuality: string;
  fastShipping: string;
  easyReturn: string;
  close: string;
  backToShopping: string;
  zoomImage: string;
  inStock: string;
  sizeLabel: string;
  priceLabel: string;
  discountOff: (percent: number) => string;
  defaultProductDescription: string;
  anySizeAvailable: string;
  sizeOption: (size: string) => string;
  notifyModalOk: string;
  notifyModalNotice: (productName: string) => string;
  preferredNotificationMethod: string;
  enterWhatsAppError: string;
  enterEmailError: string;
  checkoutTotalLabel: string;
  completeOrderBtn: string;

  // Store Compatibility Aliases
  foundResults: (count: number) => string;
  noMatchingSearchProducts: string;
  noMatchingSearchDescription: (query: string) => string;
  viewAllProducts: string;
  noProductsAvailable: string;
  specialOffersBadge: string;
  noDiscountsMessage: string;
  curatedCollectionSubtitle: string;
  noCategoryProducts: string;

  // Cart Drawer
  cartTitle: string;
  cartEmptyTitle: string;
  cartEmptyBrowse: string;
  cartSubtotal: string;
  cartTotal: string;
  cartCheckoutBtn: string;
  cartRemoveItem: string;

  // Checkout Modal
  checkoutTitle: string;
  checkoutSubtitle: string;
  customerNameLabel: string;
  customerNamePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  cityLabel: string;
  cityPlaceholder: string;
  addressLabel: string;
  addressPlaceholder: string;
  orderSummaryTitle: string;
  confirmOrderBtn: string;
  submittingOrder: string;
  orderSuccessTitle: string;
  orderSuccessDesc: string;
  orderSuccessTip: string;
  continueShoppingBtn: string;
  requiredFieldsError: string;
  invalidPhoneError: string;
  orderThrottleError: string;
  cashOnDeliveryNotice: string;

  // Stock Notification (Waitlist) Modal
  notifyModalTitle: string;
  notifyModalSubtitle: string;
  contactMethodWhatsApp: string;
  contactMethodEmail: string;
  whatsAppPlaceholder: string;
  emailPlaceholder: string;
  preferredSizeOptional: string;
  notifySubmitBtn: string;
  notifySubmitting: string;
  directWhatsAppInquiry: string;
  notifySuccessTitle: string;
  notifySuccessDesc: string;
  enterContactError: string;

  // Auth & Profile
  userProfile: string;
  adminDashboard: string;
  logout: string;
  login: string;

  // Footer
  footerDescription: string;
  allRightsReserved: string;
  adminLoginLink: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    brandName: 'Rachid Shop',
    brandTagline: 'Premium Quality',
    currency: 'MAD',

    announcementAuthentic: '100% Original & Certified Products',
    announcementFreeShipping: 'Free Delivery on 2+ items',
    announcementInspectBeforePay: 'Inspect your order upon delivery before paying',

    navHome: 'Home',
    navClothes: 'Clothing',
    navShoes: 'Shoes',
    navAccessories: 'Accessories',

    searchPlaceholder: 'Search for products, clothes, shoes...',
    searchButtonTitle: 'Search for products',
    searchCloseTitle: 'Close search',
    searchClearTitle: 'Clear search',
    searchCloseAria: 'Close search',
    searchSuggestions: 'Quick Suggestions',
    searchNoResults: 'No matching products for',
    searchViewAllResults: 'View all matching results on page',
    searchResultsFor: 'Search results for:',
    foundProductsCount: (count: number) => `Found ${count} ${count === 1 ? 'product' : 'products'}`,
    clearSearch: 'Clear search results',
    noMatchingProductsTitle: 'No matching products found',
    noMatchingProductsDesc: (query: string) => `We couldn't find any product matching "${query}". Try different search terms or browse categories directly.`,
    showAllProducts: 'View all products',

    heroTitle: 'Discover Modern Fashion Trends',
    heroSubtitle: 'A curated collection of contemporary clothing and shoes designed to match your lifestyle and elevate your everyday look.',
    heroCta: 'Shop Now',

    newArrivalsTitle: 'New Arrivals',
    newArrivalsSubtitle: 'Explore the latest additions and contemporary styles in our shop',
    newBadge: 'NEW',
    discountsTitle: 'Special Offers',
    discountsSubtitle: 'Unbeatable deals and discounts on selected pieces',
    saleBadge: 'SALE',
    allProductsTitle: 'All Products',
    allProductsSubtitle: 'Browse our complete catalog of high-quality items',
    emptyProductsNotice: 'No products currently available. Check back soon!',
    clothesTitle: 'Clothing Collection',
    shoesTitle: 'Shoes Collection',
    accessoriesTitle: 'Accessories Collection',

    outOfStock: 'Sold Out',
    remainingStock: (count: number) => `Only ${count} left`,
    viewDetailsAndSizes: 'View Details & Sizes',
    requestStockAlert: 'Notify Me When Available',
    selectSizeFirst: 'Please select a size first',
    selectSizePrompt: 'Select your size:',
    availableSizes: 'Available Sizes',
    addToCart: 'Add to Cart',
    productAddedToCart: 'Added to cart successfully!',
    instantCheckout: 'Order Now',
    quantity: 'Quantity',
    descriptionTitle: 'Product Description',
    guaranteedQuality: 'Guaranteed Quality',
    fastShipping: 'Fast & Secure Delivery',
    easyReturn: 'Easy Exchange & Return',
    close: 'Close',
    backToShopping: 'Back to Shopping',
    zoomImage: 'Zoom Image',
    inStock: 'In Stock',
    sizeLabel: 'Size:',
    priceLabel: 'Price:',
    discountOff: (percent: number) => `${percent}% OFF`,
    defaultProductDescription: 'A carefully curated piece crafted with top-grade standards and modern comfort.',
    anySizeAvailable: 'Any size when available',
    sizeOption: (size: string) => `Size ${size}`,
    notifyModalOk: 'Okay, thank you',
    notifyModalNotice: (name: string) => `We will notify you as soon as "${name}" is back in stock.`,
    preferredNotificationMethod: 'Preferred Notification Method:',
    enterWhatsAppError: 'Please enter your WhatsApp number',
    enterEmailError: 'Please enter your email address',
    checkoutTotalLabel: 'Total:',
    completeOrderBtn: 'Complete Order',

    foundResults: (count: number) => `Found ${count} ${count === 1 ? 'product' : 'products'}`,
    noMatchingSearchProducts: 'No matching products found',
    noMatchingSearchDescription: (query: string) => `We couldn't find any product matching "${query}". Try different search terms or browse categories directly.`,
    viewAllProducts: 'View all products',
    noProductsAvailable: 'No products currently available. Check back soon!',
    specialOffersBadge: 'SALE',
    noDiscountsMessage: 'No discounted products at the moment.',
    curatedCollectionSubtitle: 'Curated styles designed for exceptional comfort and modern looks',
    noCategoryProducts: 'No products found in this category.',

    cartTitle: 'Shopping Cart',
    cartEmptyTitle: 'Your cart is empty',
    cartEmptyBrowse: 'Browse Products',
    cartSubtotal: 'Subtotal',
    cartTotal: 'Total',
    cartCheckoutBtn: 'Proceed to Checkout',
    cartRemoveItem: 'Remove item',

    checkoutTitle: 'Complete Your Order',
    checkoutSubtitle: 'Cash on delivery across Morocco. Please enter accurate details.',
    customerNameLabel: 'Full Name',
    customerNamePlaceholder: 'e.g. John Doe',
    phoneLabel: 'Phone Number',
    phonePlaceholder: 'e.g. 0612345678',
    cityLabel: 'City',
    cityPlaceholder: 'e.g. Casablanca, Rabat, Marrakech...',
    addressLabel: 'Delivery Address',
    addressPlaceholder: 'Neighborhood, street name, house/building number...',
    orderSummaryTitle: 'Order Summary',
    confirmOrderBtn: 'Confirm Order (Cash on Delivery)',
    submittingOrder: 'Processing your order...',
    orderSuccessTitle: 'Order Placed Successfully!',
    orderSuccessDesc: 'Thank you! We have received your order and will contact you shortly to confirm delivery.',
    orderSuccessTip: 'Our team will call you within 24 hours to arrange shipment.',
    continueShoppingBtn: 'Continue Shopping',
    requiredFieldsError: 'Please fill in all required fields.',
    invalidPhoneError: 'Please enter a valid phone number.',
    orderThrottleError: 'Please wait a moment before submitting another order.',
    cashOnDeliveryNotice: 'Payment upon delivery to your doorstep',

    notifyModalTitle: 'Notify Me When Available',
    notifyModalSubtitle: 'We will inform you as soon as this item is back in stock.',
    contactMethodWhatsApp: 'WhatsApp',
    contactMethodEmail: 'Email',
    whatsAppPlaceholder: 'e.g. 0612345678',
    emailPlaceholder: 'e.g. user@example.com',
    preferredSizeOptional: 'Preferred Size (optional)',
    notifySubmitBtn: 'Send Notification Request',
    notifySubmitting: 'Submitting...',
    directWhatsAppInquiry: 'Direct Inquiry via WhatsApp',
    notifySuccessTitle: 'Request Received!',
    notifySuccessDesc: 'We have saved your request and will notify you as soon as new stock arrives.',
    enterContactError: 'Please enter your contact information.',

    userProfile: 'User Profile',
    adminDashboard: 'Admin Dashboard',
    logout: 'Logout',
    login: 'Sign In',

    footerDescription: 'Premium fashion and footwear crafted with contemporary luxury and unmatched quality.',
    allRightsReserved: 'All rights reserved.',
    adminLoginLink: 'Admin Login',
  },

  ar: {
    brandName: 'Rachid Shop',
    brandTagline: 'جودة استثنائية',
    currency: 'درهم',

    announcementAuthentic: 'جميع المنتجات أصلية 100% ومضمونة',
    announcementFreeShipping: 'توصيل مجاني عند شراء قطعتين فما فوق',
    announcementInspectBeforePay: 'يمكنك تفحص المنتجات ومعاينتها عند التوصيل قبل الدفع',

    navHome: 'الرئيسية',
    navClothes: 'الملابس',
    navShoes: 'الأحذية',
    navAccessories: 'الإكسسوارات',

    searchPlaceholder: 'ابحث عن منتج، ملابس، أحذية...',
    searchButtonTitle: 'بحث عن منتج',
    searchCloseTitle: 'إغلاق البحث',
    searchClearTitle: 'مسح البحث',
    searchCloseAria: 'إغلاق البحث',
    searchSuggestions: 'اقتراحات البحث السريع',
    searchNoResults: 'لا توجد منتجات مطابقة لـ',
    searchViewAllResults: 'عرض كل النتائج المطابقة في الصفحة',
    searchResultsFor: 'نتائج البحث عن:',
    foundProductsCount: (count: number) => `تم العثور على ${count} ${count === 1 ? 'منتج' : 'منتجات'}`,
    clearSearch: 'مسح نتائج البحث',
    noMatchingProductsTitle: 'لا توجد منتجات مطابقة للبحث',
    noMatchingProductsDesc: (query: string) => `لم نتمكن من العثور على أي منتج يطابق "${query}". حاول استخدام كلمات بحث أخرى أو تصفح الأقسام مباشرة.`,
    showAllProducts: 'عرض جميع المنتجات',

    heroTitle: 'اكتشف أحدث صيحات الموضة',
    heroSubtitle: 'تشكيلة رائعة من الملابس والأحذية العصرية التي تناسب ذوقك وتمنحك إطلالة فريدة ومتميزة في كل مناسبة.',
    heroCta: 'تسوق الآن',

    newArrivalsTitle: 'وصل حديثاً',
    newArrivalsSubtitle: 'تسوق أحدث المنتجات والتشكيلات المضافة للمتجر',
    newBadge: 'جديد',
    discountsTitle: 'تخفيضات وعروض خاصة',
    discountsSubtitle: 'أفضل الخصومات الحصرية على تشكيلات مختارة',
    saleBadge: 'تخفيض',
    allProductsTitle: 'جميع المنتجات',
    allProductsSubtitle: 'تصفح كل التشكيلات والمجموعات المتوفرة في المتجر',
    emptyProductsNotice: 'لا توجد منتجات حالياً. سيتم إضافة المنتجات قريباً.',
    clothesTitle: 'تشكيلة الملابس',
    shoesTitle: 'تشكيلة الأحذية',
    accessoriesTitle: 'الإكسسوارات',

    outOfStock: 'نفدت الكمية',
    remainingStock: (count: number) => `باقي ${count} فقط`,
    viewDetailsAndSizes: 'عرض التفاصيل والمقاسات',
    requestStockAlert: 'طلب إشعار عند التوفر',
    selectSizeFirst: 'يرجى اختيار المقاس أولاً',
    selectSizePrompt: 'اختر المقاس المناسب:',
    availableSizes: 'المقاسات المتوفرة',
    addToCart: 'إضافة إلى السلة',
    productAddedToCart: 'تمت إضافة المنتج إلى السلة بنجاح!',
    instantCheckout: 'طلب فوري الآن',
    quantity: 'الكمية',
    descriptionTitle: 'وصف المنتج',
    guaranteedQuality: 'جودة أصلية ومضمونة',
    fastShipping: 'شحن وتوصيل سريع لكافة المدن',
    easyReturn: 'إمكانية الاستبدال والاسترجاع',
    close: 'إغلاق',
    backToShopping: 'العودة للتسوق',
    zoomImage: 'تكبير الصورة',
    inStock: 'متوفر',
    sizeLabel: 'المقاس:',
    priceLabel: 'السعر:',
    discountOff: (percent: number) => `خصم ${percent}%`,
    defaultProductDescription: 'قطعة مختارة بعناية تتميز بأعلى معايير الجودة والتصميم العصري المريح.',
    anySizeAvailable: 'أي مقاس عند توفره',
    sizeOption: (size: string) => `المقاس ${size}`,
    notifyModalOk: 'حسناً، شكراً لك',
    notifyModalNotice: (name: string) => `سنقوم بإشعارك فور إعادة توفير منتج "${name}" في المخزون.`,
    preferredNotificationMethod: 'طريقة الإشعار المفضلة:',
    enterWhatsAppError: 'يرجى إدخال رقم الواتساب',
    enterEmailError: 'يرجى إدخال البريد الإلكتروني',
    checkoutTotalLabel: 'المجموع:',
    completeOrderBtn: 'إتمام الطلب',

    foundResults: (count: number) => `تم العثور على ${count} ${count === 1 ? 'منتج' : 'منتجات'}`,
    noMatchingSearchProducts: 'لا توجد منتجات مطابقة للبحث',
    noMatchingSearchDescription: (query: string) => `لم نتمكن من العثور على أي منتج يطابق "${query}". حاول استخدام كلمات بحث أخرى أو تصفح الأقسام مباشرة.`,
    viewAllProducts: 'عرض جميع المنتجات',
    noProductsAvailable: 'لا توجد منتجات حالياً. سيتم إضافة المنتجات قريباً.',
    specialOffersBadge: 'تخفيض',
    noDiscountsMessage: 'لا توجد تخفيضات حالياً في هذا القسم.',
    curatedCollectionSubtitle: 'تشكيلة مختارة بعناية توفر لك أعلى مستويات الراحة والأناقة',
    noCategoryProducts: 'لا توجد منتجات في هذا التصنيف حالياً.',

    cartTitle: 'سلة المشتريات',
    cartEmptyTitle: 'سلة المشتريات فارغة',
    cartEmptyBrowse: 'تصفح المنتجات',
    cartSubtotal: 'المجموع الفرعي',
    cartTotal: 'المجموع الكلي',
    cartCheckoutBtn: 'إتمام الطلب الآن',
    cartRemoveItem: 'حذف العنصر',

    checkoutTitle: 'إتمام وتأكيد الطلب',
    checkoutSubtitle: 'الدفع عند الاستلام مع التوصيل لكافة المدن المغربية. يرجى إدخال معلومات دقيقة.',
    customerNameLabel: 'الاسم الكامل',
    customerNamePlaceholder: 'مثال: رشيد العلمي',
    phoneLabel: 'رقم الهاتف',
    phonePlaceholder: 'مثال: 0612345678',
    cityLabel: 'المدينة',
    cityPlaceholder: 'مثال: الدار البيضاء، الرباط، طنجة، فاس...',
    addressLabel: 'عنوان التوصيل بالتفصيل',
    addressPlaceholder: 'الحي، اسم الشارع، رقم المنزل أو العمارة...',
    orderSummaryTitle: 'ملخص الطلبية',
    confirmOrderBtn: 'تأكيد الطلب (الدفع عند الاستلام)',
    submittingOrder: 'جاري تسجيل طلبك...',
    orderSuccessTitle: 'تم تسجيل طلبك بنجاح!',
    orderSuccessDesc: 'شكراً لثقتك بنا! تم استلام طلبك وسنتواصل معك هاتفياً قريباً لتأكيد تفاصيل الإرسال.',
    orderSuccessTip: 'سيقوم فريق خدمة العملاء بالتواصل معك خلال 24 ساعة لترتيب الشحن.',
    continueShoppingBtn: 'متابعة التسوق',
    requiredFieldsError: 'يرجى ملء جميع الحقول المطلوبة.',
    invalidPhoneError: 'يرجى إدخال رقم هاتف صحيح.',
    orderThrottleError: 'يرجى الانتظار قليلاً قبل إرسال طلب جديد.',
    cashOnDeliveryNotice: 'الدفع نقداً عند استلام طلبيتك أمام باب منزلك',

    notifyModalTitle: 'طلب إشعار عند توفر المنتج',
    notifyModalSubtitle: 'سنقوم بالتواصل معك وإشعارك فور إعادة توفير هذا المنتج في المخزون.',
    contactMethodWhatsApp: 'عبر الواتساب',
    contactMethodEmail: 'عبر البريد الإلكتروني',
    whatsAppPlaceholder: 'مثال: 0612345678',
    emailPlaceholder: 'مثال: name@example.com',
    preferredSizeOptional: 'المقاس المفضل (اختياري)',
    notifySubmitBtn: 'إرسال طلب الإشعار',
    notifySubmitting: 'جاري الإرسال...',
    directWhatsAppInquiry: 'استفسار مباشر عبر واتساب',
    notifySuccessTitle: 'تم تسجيل طلبك بنجاح!',
    notifySuccessDesc: 'تم حفظ بياناتك، وسنقوم بإشعارك فور وصول دفعة جديدة من هذا المنتج.',
    enterContactError: 'يرجى إدخال وسيلة التواصل.',

    userProfile: 'الملف الشخصي',
    adminDashboard: 'لوحة الإدارة',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',

    footerDescription: 'أزياء وأحذية راقية صُممت بفخامة عصرية وجودة لا تضاهى.',
    allRightsReserved: 'جميع الحقوق محفوظة.',
    adminLoginLink: 'تسجيل دخول الإدارة',
  },

  fr: {
    brandName: 'Rachid Shop',
    brandTagline: 'Qualité Supérieure',
    currency: 'MAD',

    announcementAuthentic: 'Produits 100% Authentiques & Garantis',
    announcementFreeShipping: 'Livraison gratuite dès 2 articles achetés',
    announcementInspectBeforePay: 'Inspectez vos articles à la livraison avant le paiement',

    navHome: 'Accueil',
    navClothes: 'Vêtements',
    navShoes: 'Chaussures',
    navAccessories: 'Accessoires',

    searchPlaceholder: 'Rechercher des produits, vêtements, chaussures...',
    searchButtonTitle: 'Rechercher des produits',
    searchCloseTitle: 'Fermer la recherche',
    searchClearTitle: 'Effacer la recherche',
    searchCloseAria: 'Fermer la recherche',
    searchSuggestions: 'Suggestions rapides',
    searchNoResults: 'Aucun produit correspondant à',
    searchViewAllResults: 'Voir tous les résultats correspondants',
    searchResultsFor: 'Résultats de recherche pour :',
    foundProductsCount: (count: number) => `${count} ${count === 1 ? 'produit trouvé' : 'produits trouvés'}`,
    clearSearch: 'Effacer les résultats',
    noMatchingProductsTitle: 'Aucun produit trouvé',
    noMatchingProductsDesc: (query: string) => `Nous n'avons trouvé aucun produit correspondant à "${query}". Essayez d'autres mots-clés ou parcourez les catégories directement.`,
    showAllProducts: 'Voir tous les produits',

    heroTitle: 'Découvrez les Dernières Tendances',
    heroSubtitle: 'Une sélection raffinée de vêtements et chaussures modernes pour affirmer votre style en toute occasion.',
    heroCta: 'Acheter Maintenant',

    newArrivalsTitle: 'Nouveautés',
    newArrivalsSubtitle: 'Découvrez les dernières pièces et collections ajoutées à la boutique',
    newBadge: 'NOUVEAU',
    discountsTitle: 'Promotions Spéciales',
    discountsSubtitle: 'Des réductions exclusives sur une sélection d\'articles',
    saleBadge: 'PROMO',
    allProductsTitle: 'Tous les Produits',
    allProductsSubtitle: 'Parcourez l\'ensemble de notre catalogue de haute qualité',
    emptyProductsNotice: 'Aucun produit disponible pour le moment. Revenez bientôt !',
    clothesTitle: 'Collection Vêtements',
    shoesTitle: 'Collection Chaussures',
    accessoriesTitle: 'Collection Accessoires',

    outOfStock: 'Épuisé',
    remainingStock: (count: number) => `Plus que ${count} en stock`,
    viewDetailsAndSizes: 'Voir Détails et Tailles',
    requestStockAlert: 'M\'avertir de la Disponibilité',
    selectSizeFirst: 'Veuillez choisir une taille',
    selectSizePrompt: 'Sélectionnez votre taille :',
    availableSizes: 'Tailles Disponibles',
    addToCart: 'Ajouter au Panier',
    productAddedToCart: 'Produit ajouté au panier avec succès !',
    instantCheckout: 'Commander Directement',
    quantity: 'Quantité',
    descriptionTitle: 'Description du Produit',
    guaranteedQuality: 'Qualité Garantie',
    fastShipping: 'Livraison Rapide et Sécurisée',
    easyReturn: 'Échange et Retour Faciles',
    close: 'Fermer',
    backToShopping: 'Retour aux achats',
    zoomImage: 'Agrandir l\'image',
    inStock: 'En stock',
    sizeLabel: 'Taille :',
    priceLabel: 'Prix :',
    discountOff: (percent: number) => `-${percent}%`,
    defaultProductDescription: 'Une pièce soigneusement sélectionnée alliant qualité supérieure et confort moderne.',
    anySizeAvailable: 'Toute taille dès disponibilité',
    sizeOption: (size: string) => `Taille ${size}`,
    notifyModalOk: 'D\'accord, merci',
    notifyModalNotice: (name: string) => `Nous vous informerons dès que "${name}" sera de nouveau en stock.`,
    preferredNotificationMethod: 'Moyen de notification préféré :',
    enterWhatsAppError: 'Veuillez saisir votre numéro WhatsApp',
    enterEmailError: 'Veuillez saisir votre adresse e-mail',
    checkoutTotalLabel: 'Total :',
    completeOrderBtn: 'Finaliser la commande',

    foundResults: (count: number) => `${count} ${count === 1 ? 'produit trouvé' : 'produits trouvés'}`,
    noMatchingSearchProducts: 'Aucun produit trouvé',
    noMatchingSearchDescription: (query: string) => `Nous n'avons trouvé aucun produit correspondant à "${query}". Essayez d'autres mots-clés.`,
    viewAllProducts: 'Voir tous les produits',
    noProductsAvailable: 'Aucun produit disponible pour le moment. Revenez bientôt !',
    specialOffersBadge: 'PROMO',
    noDiscountsMessage: 'Aucun produit en promotion pour le moment.',
    curatedCollectionSubtitle: 'Une sélection soignée alliant élégance, modernité et confort',
    noCategoryProducts: 'Aucun produit trouvé dans cette catégorie.',

    cartTitle: 'Mon Panier',
    cartEmptyTitle: 'Votre panier est vide',
    cartEmptyBrowse: 'Découvrir les Produits',
    cartSubtotal: 'Sous-total',
    cartTotal: 'Total',
    cartCheckoutBtn: 'Passer la Commande',
    cartRemoveItem: 'Supprimer l\'article',

    checkoutTitle: 'Finaliser la Commande',
    checkoutSubtitle: 'Paiement à la livraison partout au Maroc. Veuillez renseigner vos coordonnées exactes.',
    customerNameLabel: 'Nom et Prénom',
    customerNamePlaceholder: 'ex: Karim Bennani',
    phoneLabel: 'Numéro de Téléphone',
    phonePlaceholder: 'ex: 0612345678',
    cityLabel: 'Ville',
    cityPlaceholder: 'ex: Casablanca, Rabat, Marrakech...',
    addressLabel: 'Adresse de Livraison Complète',
    addressPlaceholder: 'Quartier, rue, numéro d\'appartement ou de maison...',
    orderSummaryTitle: 'Récapitulatif de Commande',
    confirmOrderBtn: 'Confirmer la Commande (Paiement à la Livraison)',
    submittingOrder: 'Validation de votre commande...',
    orderSuccessTitle: 'Commande Enregistrée avec Succès !',
    orderSuccessDesc: 'Merci de votre confiance ! Votre commande a bien été reçue et nous vous contacterons sous peu pour confirmer l\'envoi.',
    orderSuccessTip: 'Notre équipe vous contactera dans les 24 heures pour coordonner la livraison.',
    continueShoppingBtn: 'Continuer mes Achats',
    requiredFieldsError: 'Veuillez remplir tous les champs obligatoires.',
    invalidPhoneError: 'Veuillez entrer un numéro de téléphone valide.',
    orderThrottleError: 'Veuillez patienter quelques instants avant de soumettre une nouvelle commande.',
    cashOnDeliveryNotice: 'Paiement en espèces à la réception de votre colis',

    notifyModalTitle: 'Alerte Disponibilité Produit',
    notifyModalSubtitle: 'Nous vous informerons dès que cet article sera de nouveau en stock.',
    contactMethodWhatsApp: 'Par WhatsApp',
    contactMethodEmail: 'Par Email',
    whatsAppPlaceholder: 'ex: 0612345678',
    emailPlaceholder: 'ex: contact@exemple.com',
    preferredSizeOptional: 'Taille souhaitée (optionnelle)',
    notifySubmitBtn: 'Envoyer la Demande',
    notifySubmitting: 'Envoi en cours...',
    directWhatsAppInquiry: 'Contact Direct via WhatsApp',
    notifySuccessTitle: 'Demande Enregistrée !',
    notifySuccessDesc: 'Vos informations sont enregistrées. Nous vous avertirons dès le réapprovisionnement.',
    enterContactError: 'Veuillez renseigner votre moyen de contact.',

    userProfile: 'Profil Utilisateur',
    adminDashboard: 'Panneau d\'Administration',
    logout: 'Déconnexion',
    login: 'Se Connecter',

    footerDescription: 'Mode et chaussures haut de gamme confectionnées avec un luxe contemporain et une qualité inégalée.',
    allRightsReserved: 'Tous droits réservés.',
    adminLoginLink: 'Connexion Admin',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Main/Default language is English ('en') as requested by user
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language') as Language;
    if (saved && (saved === 'en' || saved === 'ar' || saved === 'fr')) {
      return saved;
    }
    return 'en'; // Default primary language is English
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [language, isRTL]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
