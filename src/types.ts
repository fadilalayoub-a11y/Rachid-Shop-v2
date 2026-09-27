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

  // Visual layout & typography customization
  contentPosition?: 'start' | 'center' | 'end'; // Horizontal position (fallback)
  verticalAlign?: 'top' | 'center' | 'bottom'; // Vertical alignment (fallback)
  textAlign?: 'start' | 'center' | 'end'; // Text alignment
  maxWidthPercent?: number; // Maximum width percentage for text container (e.g. 40, 50, 60, 100)
  textColorTheme?: 'light' | 'dark'; // Light text (for dark images) or dark text (for light/white backgrounds)
  fontFamily?: 'sans' | 'serif' | 'mono'; // Font style
  titleSize?: 'normal' | 'large' | 'xlarge'; // Title size
  overlayStyle?: 'charcoal-gradient' | 'light-gradient' | 'solid-tint' | 'none'; // Background tint behind text
  ctaLink?: string; // Where the CTA button goes ('#products', 'clothes', 'shoes', 'accessories', etc.)
  ctaStyle?: 'white-solid' | 'dark-solid' | 'outline' | 'accent'; // Style of CTA button

  // Free Visual Pinning (X% and Y% from 0 to 100 on the image)
  // Specific for Arabic (RTL) and Latin/English/French (LTR)
  posX_ar?: number; // 0% to 100% (from right or left)
  posY_ar?: number; // 0% to 100% (from top)
  posX_en?: number; // 0% to 100%
  posY_en?: number; // 0% to 100%
}
