/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SHIV SHAKTI PROJECT — TypeScript Types
 * types.ts — Shared type definitions for the commerce platform
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  category: "shakti" | "shiva";
  collection: string;
  sizes: string[];      // Parsed from JSON string
  colors: string[];     // Parsed from JSON string
  images: string[];     // Parsed from JSON string
  in_stock: boolean;
  featured: boolean;
  created_at: string;
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
  created_at: string;
}

export interface Order {
  id: number;
  total_price: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  created_at: string;
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
