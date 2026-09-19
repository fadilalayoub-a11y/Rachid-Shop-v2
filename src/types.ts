export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  category: 'clothes' | 'shoes' | 'accessories';
  image: string;
  inventory?: { size: string; stock: number }[];
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
