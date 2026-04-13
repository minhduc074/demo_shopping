export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  _count?: { products: number };
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  position: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sold: number;
  imageUrl?: string;
  isFeatured: boolean;
  isFlashSale: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  categoryId: string;
  category?: Category;
  images?: ProductImage[];
  createdAt: string;
  discountPercent?: number;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'COD' | 'STRIPE';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string | null;
  unitPrice: number;
  totalPrice: number;
  quantity: number;
  product?: Product;
}

export interface Payment {
  id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  stripeSessionId?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  city: string;
  note?: string;
  items: OrderItem[];
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface ProductListResponse {
  products: Product[];
  pagination: Pagination;
}

export interface CheckoutInput {
  paymentMethod: PaymentMethod;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  city: string;
  note?: string;
}

export interface CheckoutResult {
  type: 'cod' | 'stripe';
  orderId: string;
  orderNumber?: string;
  sessionUrl?: string;
}
