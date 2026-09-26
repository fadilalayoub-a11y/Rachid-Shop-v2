export type ProductStyle = 'streetwear' | 'classic' | 'sportswear' | 'casual';

export type ProductBadge = 'none' | 'new' | 'sale' | 'best_seller' | 'trendy' | 'free_shipping';

export interface ProductVariant {
  id?: string;
  color: string;
  colorHex?: string;
  size: string;
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  title?: string; // Product Title
  description: string;
  price: number;
  originalPrice?: number | null;
  compare_at_price?: number | null;
  cost_price?: number | null;
  sku?: string;

  category: 'clothes' | 'shoes' | 'accessories';
  category_id?: 'clothes' | 'shoes' | 'accessories';
  subcategory?: string;
  subcategory_id?: string;

  brand?: string;
  brand_id?: string;
  style?: ProductStyle;

  badge?: ProductBadge;
  tags?: string[];
  collections?: string[];

  colors?: string[];
  sizes?: string[];
  variants?: ProductVariant[];

  image: string;
  secondaryImage?: string | null;
  images?: string[];
  inventory?: { size: string; stock: number }[];

  // SEO fields
  meta_title?: string;
  meta_description?: string;
  slug?: string;

  isTrending?: boolean;
  salesCount?: number;
  createdAt?: any;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  cartItemId: string; // To uniquely identify item with specific size
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  selectedSize?: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'delivered' | 'cancelled';
  createdAt?: any;
}

export interface HeroSlide {
  image: string;
  badge?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  // Multilingual overrides (optional)
  title_ar?: string;
  title_fr?: string;
  title_en?: string;
  subtitle_ar?: string;
  subtitle_fr?: string;
  subtitle_en?: string;
  badge_ar?: string;
  badge_fr?: string;
  badge_en?: string;
  ctaText_ar?: string;
  ctaText_fr?: string;
  ctaText_en?: string;
}
