export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  category: 'clothes' | 'shoes' | 'accessories';
  subcategory?: string; // e.g. 'jeans', 'jackets', 'trackpants', 'sneakers', 'watch', 'perfume'
  brand?: string;
  tags?: string[];
  collections?: string[]; // e.g. ['denim-casual', 'sportswear-gym', 'summer-essentials', 'watches-fragrances']
  image: string;
  secondaryImage?: string | null;
  images?: string[];
  inventory?: { size: string; stock: number }[];
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
