

import type {
  Product,
  CartItem,
  User,
  Order,
  CommunityPost,
  CheckoutInput,
  NGOInterestInput,
  ProductInput,
  AdminOrder,
  AdminUser,
  NGOInterest,
  OrderStatus,
} from "@/types";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const ADMIN_API_PREFIX = API_BASE ? "/admin" : "/backend-admin";

function apiURL(path: string) {
  return API_BASE ? `${API_BASE}${path}` : path;
}


async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(apiURL(path), {
    credentials: "include", 
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


export async function getCSRFToken(): Promise<string> {
  const data = await apiFetch<{ csrf_token: string }>("/api/csrf-token");
  return data.csrf_token;
}



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

export const adminAPI = {
  login: (data: { email: string; password: string }) =>
    apiFetch<{ message: string; user: User }>(`${ADMIN_API_PREFIX}/login`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => apiFetch<User>(`${ADMIN_API_PREFIX}/me`),

  dashboard: () =>
    apiFetch<{
      total_products: number;
      total_stock: number;
      low_stock_products: number;
      active_sale_products: number;
    }>(`${ADMIN_API_PREFIX}/dashboard`),

  listProducts: () =>
    apiFetch<{ products: Product[]; total: number }>(`${ADMIN_API_PREFIX}/products`),

  getProduct: (id: number) => apiFetch<Product>(`${ADMIN_API_PREFIX}/products/${id}`),

  createProduct: async (data: ProductInput) => {
    const csrf = await getCSRFToken();
    return apiFetch<{ message: string; product_id: number }>(`${ADMIN_API_PREFIX}/products`, {
      method: "POST",
      headers: { "X-CSRF-Token": csrf },
      body: JSON.stringify(data),
    });
  },

  updateProduct: async (id: number, data: ProductInput) => {
    const csrf = await getCSRFToken();
    return apiFetch<{ message: string }>(`${ADMIN_API_PREFIX}/products/${id}`, {
      method: "PUT",
      headers: { "X-CSRF-Token": csrf },
      body: JSON.stringify(data),
    });
  },

  deleteProduct: async (id: number) => {
    const csrf = await getCSRFToken();
    return apiFetch<{ message: string }>(`${ADMIN_API_PREFIX}/products/${id}`, {
      method: "DELETE",
      headers: { "X-CSRF-Token": csrf },
    });
  },

  listUsers: () =>
    apiFetch<{ users: AdminUser[]; total: number }>(`${ADMIN_API_PREFIX}/users`),

  listNGOInterests: () =>
    apiFetch<{ interests: NGOInterest[]; total: number }>(`${ADMIN_API_PREFIX}/ngo-interests`),

  listOrders: () =>
    apiFetch<{ orders: AdminOrder[]; total: number }>(`${ADMIN_API_PREFIX}/orders`),

  getOrder: (id: number) => apiFetch<AdminOrder>(`${ADMIN_API_PREFIX}/orders/${id}`),

  updateOrderStatus: async (
    id: number,
    data: { status: OrderStatus; payment_reference?: string }
  ) => {
    const csrf = await getCSRFToken();
    return apiFetch<{ message: string }>(`${ADMIN_API_PREFIX}/orders/${id}/status`, {
      method: "PUT",
      headers: { "X-CSRF-Token": csrf },
      body: JSON.stringify(data),
    });
  },

  uploadProductImages: async (files: File[] | FileList) => {
    const csrf = await getCSRFToken();
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));

    const res = await fetch(apiURL(`${ADMIN_API_PREFIX}/uploads/images`), {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRF-Token": csrf },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }

    return res.json() as Promise<{ images: string[]; total: number }>;
  },
};



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



export const ordersAPI = {
  checkout: async (data: CheckoutInput) => {
    const csrf = await getCSRFToken();
    return apiFetch<{
      message: string;
      order_id: number;
      status: "payment_pending";
      total: number;
    }>(
      "/api/checkout",
      {
        method: "POST",
        headers: { "X-CSRF-Token": csrf },
        body: JSON.stringify(data),
      }
    );
  },

  list: () => apiFetch<{ orders: Order[] }>("/api/orders"),
};

export const ngoAPI = {
  submitInterest: (data: NGOInterestInput) =>
    apiFetch<{ message: string }>("/api/ngo/interest", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};



export const communityAPI = {
  listPosts: (category?: string) => {
    const params = category && category !== "ALL" ? `?category=${encodeURIComponent(category)}` : "";
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
