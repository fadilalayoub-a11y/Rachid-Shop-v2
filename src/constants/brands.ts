export interface BrandOption {
  id: string;
  name: string;
  nameAr?: string;
  isPopular?: boolean;
}

export const STORE_BRANDS: BrandOption[] = [
  { id: 'nike', name: 'Nike', nameAr: 'نايكي', isPopular: true },
  { id: 'adidas', name: 'Adidas', nameAr: 'أديداس', isPopular: true },
  { id: 'zara', name: 'Zara', nameAr: 'زارا', isPopular: true },
  { id: 'puma', name: 'Puma', nameAr: 'بوما', isPopular: true },
  { id: 'new-balance', name: 'New Balance', nameAr: 'نيو بالانس', isPopular: true },
  { id: 'jordan', name: 'Jordan', nameAr: 'جوردن', isPopular: true },
  { id: 'lacoste', name: 'Lacoste', nameAr: 'لاكوست', isPopular: true },
  { id: 'tommy-hilfiger', name: 'Tommy Hilfiger', nameAr: 'تومي هيلفيغر', isPopular: true },
  { id: 'under-armour', name: 'Under Armour', nameAr: 'أندر آرمور', isPopular: false },
  { id: 'pull-and-bear', name: 'Pull & Bear', nameAr: 'بول آند بير', isPopular: false },
  { id: 'bershka', name: 'Bershka', nameAr: 'بيرشكا', isPopular: false },
  { id: 'massimo-dutti', name: 'Massimo Dutti', nameAr: 'ماسيمو دوتي', isPopular: false },
  { id: 'rachid-shop', name: 'Rachid Shop (العلامة الخاصة)', nameAr: 'متجر رشيد', isPopular: true },
  { id: 'custom', name: 'Custom Brand (علامة أخرى / غير محدد)', nameAr: 'علامة مخصصة', isPopular: false },
];
