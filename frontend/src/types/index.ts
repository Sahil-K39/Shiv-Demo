

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price?: number;
  is_on_sale?: boolean;
  currency: string;
  category: "shakti" | "shiva" | string;
  collection: string;
  sizes: string[] | string;
  colors: string[] | string;
  images: string[] | string;
  in_stock: boolean;
  featured: boolean;
  quantity?: number;
  sku?: string;
  is_featured?: boolean;
  is_active?: boolean;
  sale_active?: boolean;
  sale_start_date?: string | null;
  sale_end_date?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ProductInput {
  name: string;
  slug?: string;
  description: string;
  price: number;
  sale_price: number;
  category: string;
  collection?: string;
  sizes?: string;
  colors?: string;
  images: string;
  quantity: number;
  sku: string;
  is_featured: boolean;
  is_active: boolean;
  sale_active: boolean;
  sale_start_date: string | null;
  sale_end_date: string | null;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  size: string;
  color: string;
  name: string;
  price: number;
  images: string;
  slug: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
  created_at: string;
  updated_at?: string;
  is_verified?: boolean;
  last_login_at?: string | null;
  login_count?: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

export type OrderStatus =
  | "pending"
  | "payment_pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface Order {
  id: number;
  total_price: number;
  status: OrderStatus;
  created_at: string;
}

export interface AdminUser extends User {
  role: string;
  updated_at: string;
  is_verified: boolean;
  last_login_at: string | null;
  login_count: number;
}

export interface AdminOrder {
  id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  items: OrderItem[];
  total_price: number;
  status: OrderStatus;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  shipping_phone: string;
  payment_reference: string;
  payment_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CheckoutInput {
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  shipping_phone: string;
}

export interface CommunityPost {
  id: number;
  user_id: number;
  email: string;
  title: string;
  body: string;
  category: string;
  likes: number;
  created_at: string;
}

export interface NGOInterestInput {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface NGOInterest extends NGOInterestInput {
  id: number;
  created_at: string;
}

export interface FabricQuoteInput {
  name: string;
  email: string;
  phone: string;
  fabric_type: string;
  quantity: number;
  preferred_color: string;
  delivery_city: string;
  timeline: string;
  message: string;
}
