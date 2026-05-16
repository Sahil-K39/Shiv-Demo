/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SHIV SHAKTI PROJECT — API Client
 * api.ts — Type-safe HTTP client for the Go commerce engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import type { Product, CartItem, User, Order, CommunityPost } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Base fetch wrapper with credentials and error handling.
 * Automatically sends HttpOnly cookies for authentication.
 */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // Send HttpOnly cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * Fetches a fresh CSRF token from the server.
 * Must be called before any state-changing request.
 */
export async function getCSRFToken(): Promise<string> {
  const data = await apiFetch<{ csrf_token: string }>("/api/csrf-token");
  return data.csrf_token;
}

// ── Auth API ────────────────────────────────────────────────────

export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    apiFetch<{ message: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiFetch<{ message: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch<{ message: string }>("/api/auth/logout", { method: "POST" }),

  me: () => apiFetch<User>("/api/auth/me"),
};

// ── Products API ────────────────────────────────────────────────

export const productsAPI = {
  listAll: () =>
    apiFetch<{ products: Product[]; total: number }>("/api/products"),

  getById: (id: number) =>
    apiFetch<Product>(`/api/products/${id}`),

  getByCategory: (category: string) =>
    apiFetch<{ products: Product[]; total: number }>(
      `/api/products/category/${category}`
    ),
};

// ── Cart API ────────────────────────────────────────────────────

export const cartAPI = {
  get: () =>
    apiFetch<{ items: CartItem[]; item_count: number; total: number }>(
      "/api/cart"
    ),

  addItem: async (data: {
    product_id: number;
    quantity: number;
    size: string;
    color: string;
  }) => {
    const csrf = await getCSRFToken();
    return apiFetch<{ message: string }>("/api/cart/add", {
      method: "POST",
      headers: { "X-CSRF-Token": csrf },
      body: JSON.stringify(data),
    });
  },

  updateItem: async (itemId: number, quantity: number) => {
    const csrf = await getCSRFToken();
    return apiFetch<{ message: string }>("/api/cart/update", {
      method: "PUT",
      headers: { "X-CSRF-Token": csrf },
      body: JSON.stringify({ item_id: itemId, quantity }),
    });
  },

  removeItem: async (itemId: number) => {
    const csrf = await getCSRFToken();
    return apiFetch<{ message: string }>(`/api/cart/remove/${itemId}`, {
      method: "DELETE",
      headers: { "X-CSRF-Token": csrf },
    });
  },
};

// ── Orders API ──────────────────────────────────────────────────

export const ordersAPI = {
  checkout: async () => {
    const csrf = await getCSRFToken();
    return apiFetch<{ message: string; order_id: number; total: number }>(
      "/api/checkout",
      {
        method: "POST",
        headers: { "X-CSRF-Token": csrf },
      }
    );
  },

  list: () => apiFetch<{ orders: Order[] }>("/api/orders"),
};

// ── Community API ───────────────────────────────────────────────

export const communityAPI = {
  listPosts: (category?: string) => {
    const params = category && category !== "ALL" ? `?category=${category}` : "";
    return apiFetch<CommunityPost[]>(`/api/community/posts${params}`);
  },

  createPost: async (data: { title: string; body: string; category: string }) => {
    const csrf = await getCSRFToken();
    return apiFetch<{ message: string; post_id: number }>(
      "/api/community/post",
      {
        method: "POST",
        headers: { "X-CSRF-Token": csrf },
        body: JSON.stringify(data),
      }
    );
  },

  likePost: async (postId: number) => {
    const csrf = await getCSRFToken();
    return apiFetch<{ message: string }>("/api/community/like", {
      method: "POST",
      headers: { "X-CSRF-Token": csrf },
      body: JSON.stringify({ post_id: postId }),
    });
  },
};
