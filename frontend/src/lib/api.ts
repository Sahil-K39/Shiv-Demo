import type {
  Product,
  CartItem,
  User,
  Order,
  CommunityPost,
  CheckoutInput,
  NGOInterestInput,
  FabricQuoteInput,
  ProductInput,
  AdminOrder,
  AdminUser,
  NGOInterest,
  OrderStatus,
} from "@/types";
import initialData from "@/lib/initialProducts.json";

const configuredApiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const useSameOriginProxy =
  typeof window !== "undefined" && process.env.NODE_ENV === "production";
const API_BASE = useSameOriginProxy ? "" : configuredApiBase;
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
    throw new Error(error.message || error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

async function tryOrLocal<T>(
  promiseFn: () => Promise<T>,
  fallbackFn: () => T | Promise<T>
): Promise<T> {
  try {
    return await promiseFn();
  } catch {
    return fallbackFn();
  }
}

function getLocalProducts(): Product[] {
  if (typeof window === "undefined") return initialData.products as Product[];
  try {
    const saved =
      localStorage.getItem("shiv_shakti_custom_admin_products") ||
      localStorage.getItem("shiv_shakti_products_swr_v2") ||
      sessionStorage.getItem("shiv_shakti_products_swr_v2");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return initialData.products as Product[];
}

function saveLocalProducts(products: Product[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("shiv_shakti_custom_admin_products", JSON.stringify(products));
    localStorage.setItem("shiv_shakti_products_swr_v2", JSON.stringify(products));
    sessionStorage.setItem("shiv_shakti_products_swr_v2", JSON.stringify(products));
  } catch {}
}

function getLocalOrders(): AdminOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("shiv_shakti_local_orders");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  const initialOrders: AdminOrder[] = [
    {
      id: 101,
      user_id: 2,
      total_price: 38400,
      status: "payment_pending",
      shipping_name: "Jean-Luc Moreau",
      shipping_address: "12 Avenue Montaigne",
      shipping_city: "Paris",
      shipping_state: "Ile-de-France",
      shipping_zip: "75008",
      shipping_country: "France",
      shipping_phone: "+33 1 40 50 60 70",
      payment_reference: "WIRE-FR-101",
      payment_confirmed_at: null,
      created_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
      items: [
        {
          id: 1,
          order_id: 101,
          product_id: 1,
          quantity: 24,
          price: 1600,
          size: "S/M",
          color: "Void Black",
          name: "Shiva Ruin Dress",
        },
      ],
      user_name: "Jean-Luc Moreau (Council of Light Boutique)",
      user_email: "buying@counciloflight.fr",
    },
    {
      id: 102,
      user_id: 3,
      total_price: 64000,
      status: "confirmed",
      shipping_name: "Kenji Sato",
      shipping_address: "4-12-10 Ginza, Chuo-ku",
      shipping_city: "Tokyo",
      shipping_state: "Tokyo",
      shipping_zip: "104-0061",
      shipping_country: "Japan",
      shipping_phone: "+81 3 3567 1234",
      payment_reference: "LC-JP-102",
      payment_confirmed_at: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
      created_at: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
      items: [
        {
          id: 2,
          order_id: 102,
          product_id: 2,
          quantity: 40,
          price: 1600,
          size: "M/L",
          color: "Ivory",
          name: "Shakti Ritual Kaftan",
        },
      ],
      user_name: "Kenji Sato (Ginza Avant-Garde)",
      user_email: "sato@ginza-fashion.jp",
    },
    {
      id: 103,
      user_id: 4,
      total_price: 19200,
      status: "shipped",
      shipping_name: "Marco Rossi",
      shipping_address: "Via Montenapoleone 8",
      shipping_city: "Milano",
      shipping_state: "Lombardia",
      shipping_zip: "20121",
      shipping_country: "Italy",
      shipping_phone: "+39 02 7600 1234",
      payment_reference: "WIRE-IT-103",
      payment_confirmed_at: new Date(Date.now() - 3600 * 1000 * 24 * 4).toISOString(),
      created_at: new Date(Date.now() - 3600 * 1000 * 24 * 5).toISOString(),
      updated_at: new Date(Date.now() - 3600 * 1000 * 24 * 4).toISOString(),
      items: [
        {
          id: 3,
          order_id: 103,
          product_id: 3,
          quantity: 12,
          price: 1600,
          size: "S/M",
          color: "Charcoal",
          name: "Ceremonial Armor Vest",
        },
      ],
      user_name: "Marco Rossi (Milano Concept)",
      user_email: "buyer@milanoconcept.it",
    },
  ];
  try {
    localStorage.setItem("shiv_shakti_local_orders", JSON.stringify(initialOrders));
  } catch {}
  return initialOrders;
}

function saveLocalOrders(orders: AdminOrder[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("shiv_shakti_local_orders", JSON.stringify(orders));
  } catch {}
}

export async function getCSRFToken(): Promise<string> {
  return tryOrLocal(
    () => apiFetch<{ csrf_token: string }>("/api/csrf-token"),
    () => ({ csrf_token: "local-csrf-token" })
  ).then((d) => d.csrf_token);
}

export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    tryOrLocal(
      () =>
        apiFetch<{ message: string; user: User; requires_verification: boolean }>("/api/auth/register", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      () => {
        const user: User = {
          id: Date.now(),
          email: data.email,
          name: data.name,
          role: "buyer",
          is_verified: true,
          created_at: new Date().toISOString(),
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("shiv_shakti_user", JSON.stringify(user));
        }
        return { message: "Registered locally", user, requires_verification: false };
      }
    ),

  verify: (token: string) =>
    tryOrLocal(
      () =>
        apiFetch<{ message: string; user: User; csrf_token?: string }>(
          `/api/auth/verify?token=${encodeURIComponent(token)}`
        ),
      () => {
        const user: User = {
          id: 2,
          email: "verified@shivshakti.com",
          name: "Verified Buyer",
          role: "buyer",
          is_verified: true,
          created_at: new Date().toISOString(),
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("shiv_shakti_user", JSON.stringify(user));
        }
        return { message: "Verified", user, csrf_token: "local-csrf" };
      }
    ),

  login: (data: { email: string; password: string }) =>
    tryOrLocal(
      () =>
        apiFetch<{ message: string; user: User }>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      () => {
        const isAdmin = data.email.toLowerCase().includes("admin");
        const user: User = {
          id: isAdmin ? 1 : Date.now(),
          email: data.email,
          name: data.email.split("@")[0] || "User",
          role: isAdmin ? "admin" : "buyer",
          is_verified: true,
          created_at: new Date().toISOString(),
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("shiv_shakti_user", JSON.stringify(user));
          if (isAdmin) {
            localStorage.setItem("shiv_shakti_admin_user", JSON.stringify(user));
          }
        }
        return { message: "Logged in successfully", user };
      }
    ),

  logout: () =>
    tryOrLocal(
      () => apiFetch<{ message: string }>("/api/auth/logout", { method: "POST" }),
      () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("shiv_shakti_user");
          localStorage.removeItem("shiv_shakti_admin_user");
        }
        return { message: "Logged out" };
      }
    ),

  me: () =>
    tryOrLocal(
      () => apiFetch<User>("/api/auth/me"),
      () => {
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem("shiv_shakti_user") || localStorage.getItem("shiv_shakti_admin_user");
          if (saved) return JSON.parse(saved) as User;
        }
        throw new Error("Not authenticated");
      }
    ),
};

export const adminAPI = {
  login: (data: { email: string; password: string }) =>
    tryOrLocal(
      () =>
        apiFetch<{ message: string; user: User }>(`${ADMIN_API_PREFIX}/login`, {
          method: "POST",
          body: JSON.stringify(data),
        }),
      () => {
        const user: User = {
          id: 1,
          email: data.email,
          name: "Shiv Shakti Admin Control",
          role: "admin",
          is_verified: true,
          created_at: new Date().toISOString(),
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("shiv_shakti_admin_user", JSON.stringify(user));
          localStorage.setItem("shiv_shakti_user", JSON.stringify(user));
        }
        return { message: "Admin signed in", user };
      }
    ),

  me: () =>
    tryOrLocal(
      () => apiFetch<User>(`${ADMIN_API_PREFIX}/me`),
      () => {
        if (typeof window !== "undefined") {
          const savedAdmin = localStorage.getItem("shiv_shakti_admin_user");
          if (savedAdmin) return JSON.parse(savedAdmin) as User;
          const savedUser = localStorage.getItem("shiv_shakti_user");
          if (savedUser) {
            const u = JSON.parse(savedUser) as User;
            if (u.role === "admin") return u;
          }
        }
        throw new Error("Admin authentication required");
      }
    ),

  dashboard: () =>
    tryOrLocal(
      () =>
        apiFetch<{
          total_products: number;
          total_stock: number;
          low_stock_products: number;
          out_of_stock_products: number;
          active_sale_products: number;
          total_enquiries: number;
          pending_enquiries: number;
          confirmed_orders: number;
          shipped_orders: number;
          delivered_orders: number;
          cancelled_orders: number;
          units_requested: number;
          units_pending: number;
          units_sold: number;
          gross_enquiry_value: number;
          confirmed_revenue: number;
        }>(`${ADMIN_API_PREFIX}/dashboard`),
      () => {
        const prods = getLocalProducts();
        const ords = getLocalOrders();
        const totalStock = prods.reduce((s, p) => s + (p.quantity ?? 0), 0);
        const lowStock = prods.filter((p) => (p.quantity ?? 0) > 0 && (p.quantity ?? 0) < 12).length;
        const outOfStock = prods.filter((p) => (p.quantity ?? 0) === 0).length;
        const activeSale = prods.filter((p) => p.sale_active || p.is_on_sale).length;
        const grossValue = ords.reduce((s, o) => s + o.total_price, 0);
        const confirmedRev = ords
          .filter((o) => o.status === "confirmed" || o.status === "shipped" || o.status === "delivered")
          .reduce((s, o) => s + o.total_price, 0);
        const unitsReq = ords.reduce((s, o) => s + o.items.reduce((sum, idx) => sum + idx.quantity, 0), 0);
        return {
          total_products: prods.length,
          total_stock: totalStock,
          low_stock_products: lowStock,
          out_of_stock_products: outOfStock,
          active_sale_products: activeSale,
          total_enquiries: ords.length,
          pending_enquiries: ords.filter((o) => o.status === "payment_pending").length,
          confirmed_orders: ords.filter((o) => o.status === "confirmed").length,
          shipped_orders: ords.filter((o) => o.status === "shipped").length,
          delivered_orders: ords.filter((o) => o.status === "delivered").length,
          cancelled_orders: ords.filter((o) => o.status === "cancelled").length,
          units_requested: unitsReq,
          units_pending: ords
            .filter((o) => o.status === "payment_pending")
            .reduce((s, o) => s + o.items.reduce((sum, idx) => sum + idx.quantity, 0), 0),
          units_sold: ords
            .filter((o) => o.status === "confirmed" || o.status === "shipped" || o.status === "delivered")
            .reduce((s, o) => s + o.items.reduce((sum, idx) => sum + idx.quantity, 0), 0),
          gross_enquiry_value: grossValue,
          confirmed_revenue: confirmedRev,
        };
      }
    ),

  listProducts: () =>
    tryOrLocal(
      () => apiFetch<{ products: Product[]; total: number }>(`${ADMIN_API_PREFIX}/products`),
      () => {
        const prods = getLocalProducts();
        return { products: prods, total: prods.length };
      }
    ),

  getProduct: (id: number) =>
    tryOrLocal(
      () => apiFetch<Product>(`${ADMIN_API_PREFIX}/products/${id}`),
      () => {
        const prods = getLocalProducts();
        const found = prods.find((p) => p.id === id);
        if (!found) throw new Error("Product not found");
        return found;
      }
    ),

  createProduct: async (data: ProductInput) => {
    return tryOrLocal(
      async () => {
        const csrf = await getCSRFToken();
        return apiFetch<{ message: string; product_id: number }>(`${ADMIN_API_PREFIX}/products`, {
          method: "POST",
          headers: { "X-CSRF-Token": csrf },
          body: JSON.stringify(data),
        });
      },
      () => {
        const prods = getLocalProducts();
        const newId = Math.max(100, ...prods.map((p) => p.id)) + 1;
        const newProd: Product = {
          id: newId,
          name: data.name,
          slug: data.slug || `product-${newId}`,
          description: data.description || "",
          price: data.price || 1600,
          sale_price: data.sale_price || 0,
          category: data.category || "shakti",
          collection: data.collection || "SS26",
          sizes: typeof data.sizes === "string" ? JSON.parse(data.sizes) : data.sizes || ["S/M", "M/L"],
          colors: typeof data.colors === "string" ? JSON.parse(data.colors) : data.colors || ["Default"],
          images: typeof data.images === "string" ? JSON.parse(data.images) : data.images || [],
          quantity: data.quantity || 120,
          sku: data.sku || `SKU-${newId}`,
          is_featured: data.is_featured || false,
          featured: data.is_featured || false,
          in_stock: (data.quantity || 120) > 0,
          currency: "INR",
          is_active: data.is_active ?? true,
          sale_active: data.sale_active || false,
          sale_start_date: data.sale_start_date || null,
          sale_end_date: data.sale_end_date || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        saveLocalProducts([newProd, ...prods]);
        return { message: "Product created locally", product_id: newId };
      }
    );
  },

  updateProduct: async (id: number, data: ProductInput) => {
    return tryOrLocal(
      async () => {
        const csrf = await getCSRFToken();
        return apiFetch<{ message: string }>(`${ADMIN_API_PREFIX}/products/${id}`, {
          method: "PUT",
          headers: { "X-CSRF-Token": csrf },
          body: JSON.stringify(data),
        });
      },
      () => {
        const prods = getLocalProducts();
        const updated = prods.map((p) =>
          p.id === id
            ? {
                ...p,
                ...data,
                sizes: typeof data.sizes === "string" ? JSON.parse(data.sizes) : data.sizes || p.sizes,
                colors: typeof data.colors === "string" ? JSON.parse(data.colors) : data.colors || p.colors,
                images: typeof data.images === "string" ? JSON.parse(data.images) : data.images || p.images,
                featured: data.is_featured !== undefined ? data.is_featured : p.featured,
                in_stock: data.quantity !== undefined ? data.quantity > 0 : p.in_stock,
                currency: p.currency || "INR",
                updated_at: new Date().toISOString(),
              }
            : p
        );
        saveLocalProducts(updated);
        return { message: "Product updated locally" };
      }
    );
  },

  deleteProduct: async (id: number) => {
    return tryOrLocal(
      async () => {
        const csrf = await getCSRFToken();
        return apiFetch<{ message: string }>(`${ADMIN_API_PREFIX}/products/${id}`, {
          method: "DELETE",
          headers: { "X-CSRF-Token": csrf },
        });
      },
      () => {
        const prods = getLocalProducts();
        saveLocalProducts(prods.filter((p) => p.id !== id));
        return { message: "Product deleted locally" };
      }
    );
  },

  bulkImportProducts: async (products: ProductInput[]) => {
    return tryOrLocal(
      async () => {
        const csrf = await getCSRFToken();
        return apiFetch<{ message: string; total: number; created: number; updated: number }>(
          `${ADMIN_API_PREFIX}/products/bulk`,
          {
            method: "POST",
            headers: { "X-CSRF-Token": csrf },
            body: JSON.stringify({ products }),
          }
        );
      },
      () => {
        const prods = getLocalProducts();
        let created = 0;
        const newProds = [...prods];
        products.forEach((input) => {
          const existingIdx = newProds.findIndex((p) => p.sku === input.sku || p.slug === input.slug);
          if (existingIdx >= 0) {
            newProds[existingIdx] = {
              ...newProds[existingIdx],
              ...input,
              sizes: typeof input.sizes === "string" ? JSON.parse(input.sizes) : input.sizes,
              colors: typeof input.colors === "string" ? JSON.parse(input.colors) : input.colors,
              images: typeof input.images === "string" ? JSON.parse(input.images) : input.images,
              featured: input.is_featured !== undefined ? input.is_featured : newProds[existingIdx].featured,
              in_stock: input.quantity !== undefined ? input.quantity > 0 : newProds[existingIdx].in_stock,
              currency: newProds[existingIdx].currency || "INR",
              updated_at: new Date().toISOString(),
            };
          } else {
            created++;
            const newId = Math.max(100, ...newProds.map((p) => p.id || 0)) + 1;
            newProds.unshift({
              id: newId,
              name: input.name,
              slug: input.slug || `bulk-${newId}`,
              description: input.description || "",
              price: input.price || 1600,
              sale_price: input.sale_price || 0,
              category: input.category || "shakti",
              collection: input.collection || "SS26",
              sizes: typeof input.sizes === "string" ? JSON.parse(input.sizes) : input.sizes || ["S/M", "M/L"],
              colors: typeof input.colors === "string" ? JSON.parse(input.colors) : input.colors || ["Default"],
              images: typeof input.images === "string" ? JSON.parse(input.images) : input.images || [],
              quantity: input.quantity || 120,
              sku: input.sku || `SKU-${newId}`,
              is_featured: input.is_featured || false,
              featured: input.is_featured || false,
              in_stock: (input.quantity || 120) > 0,
              currency: "INR",
              is_active: input.is_active ?? true,
              sale_active: input.sale_active || false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        });
        saveLocalProducts(newProds);
        return { message: "Bulk import completed locally", total: products.length, created, updated: products.length - created };
      }
    );
  },

  listUsers: () =>
    tryOrLocal(
      () => apiFetch<{ users: AdminUser[]; total: number }>(`${ADMIN_API_PREFIX}/users`),
      () => ({
        users: [
          {
            id: 1,
            name: "Jean-Luc Moreau",
            email: "buying@counciloflight.fr",
            role: "buyer",
            is_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_login_at: new Date().toISOString(),
            login_count: 14,
          },
          {
            id: 2,
            name: "Kenji Sato",
            email: "sato@ginza-fashion.jp",
            role: "buyer",
            is_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_login_at: new Date().toISOString(),
            login_count: 8,
          },
        ],
        total: 2,
      })
    ),

  listNGOInterests: () =>
    tryOrLocal(
      () => apiFetch<{ interests: NGOInterest[]; total: number }>(`${ADMIN_API_PREFIX}/ngo-interests`),
      () => ({
        interests: [
          {
            id: 1,
            name: "Textile Revival Trust",
            email: "contact@textilerevival.org",
            phone: "+91 9876543210",
            message: "Interested in partnership for deconstructed handloom salvage fabrics.",
            created_at: new Date().toISOString(),
          },
        ],
        total: 1,
      })
    ),

  listOrders: () =>
    tryOrLocal(
      () => apiFetch<{ orders: AdminOrder[]; total: number }>(`${ADMIN_API_PREFIX}/orders`),
      () => {
        const ords = getLocalOrders();
        return { orders: ords, total: ords.length };
      }
    ),

  getOrder: (id: number) =>
    tryOrLocal(
      () => apiFetch<AdminOrder>(`${ADMIN_API_PREFIX}/orders/${id}`),
      () => {
        const ords = getLocalOrders();
        const found = ords.find((o) => o.id === id);
        if (!found) throw new Error("Order not found");
        return found;
      }
    ),

  updateOrderStatus: async (
    id: number,
    data: { status: OrderStatus; payment_reference?: string }
  ) => {
    return tryOrLocal(
      async () => {
        const csrf = await getCSRFToken();
        return apiFetch<{ message: string }>(`${ADMIN_API_PREFIX}/orders/${id}/status`, {
          method: "PUT",
          headers: { "X-CSRF-Token": csrf },
          body: JSON.stringify(data),
        });
      },
      () => {
        const ords = getLocalOrders();
        saveLocalOrders(
          ords.map((o) =>
            o.id === id
              ? { ...o, status: data.status, payment_reference: data.payment_reference || o.payment_reference }
              : o
          )
        );
        return { message: "Order status updated locally" };
      }
    );
  },

  uploadProductImages: async (files: File[] | FileList) => {
    return tryOrLocal(
      async () => {
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
      async () => {
        const fileArray = Array.from(files);
        const images = await Promise.all(
          fileArray.map(
            (f) =>
              new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(f);
              })
          )
        );
        return { images, total: images.length };
      }
    );
  },
};

export const productsAPI = {
  listAll: () =>
    tryOrLocal(
      () => apiFetch<{ products: Product[]; total: number }>("/api/products"),
      () => {
        const prods = getLocalProducts();
        return { products: prods, total: prods.length };
      }
    ),

  getById: (id: number) =>
    tryOrLocal(
      () => apiFetch<Product>(`/api/products/${id}`),
      () => {
        const prods = getLocalProducts();
        const found = prods.find((p) => p.id === id);
        if (!found) throw new Error("Product not found");
        return found;
      }
    ),

  getByCategory: (category: string) =>
    tryOrLocal(
      () =>
        apiFetch<{ products: Product[]; total: number }>(`/api/products/category/${category}`),
      () => {
        const prods = getLocalProducts().filter(
          (p) => p.category?.toLowerCase() === category.toLowerCase()
        );
        return { products: prods, total: prods.length };
      }
    ),
};

export const cartAPI = {
  get: () =>
    tryOrLocal(
      () =>
        apiFetch<{ items: CartItem[]; item_count: number; total: number }>("/api/cart"),
      () => {
        if (typeof window === "undefined") return { items: [], item_count: 0, total: 0 };
        const saved = localStorage.getItem("shiv_shakti_cart_items");
        const items: CartItem[] = saved ? JSON.parse(saved) : [];
        return {
          items,
          item_count: items.reduce((s, i) => s + i.quantity, 0),
          total: items.reduce((s, i) => s + i.price * i.quantity, 0),
        };
      }
    ),

  addItem: async (data: {
    product_id: number;
    quantity: number;
    size: string;
    color: string;
  }) => {
    return tryOrLocal(
      async () => {
        const csrf = await getCSRFToken();
        return apiFetch<{ message: string }>("/api/cart/add", {
          method: "POST",
          headers: { "X-CSRF-Token": csrf },
          body: JSON.stringify(data),
        });
      },
      () => {
        if (typeof window === "undefined") return { message: "Added" };
        const prods = getLocalProducts();
        const found = prods.find((p) => p.id === data.product_id);
        if (!found) throw new Error("Product not found");
        const saved = localStorage.getItem("shiv_shakti_cart_items");
        const items: CartItem[] = saved ? JSON.parse(saved) : [];
        const existingIndex = items.findIndex(
          (i) => i.product_id === data.product_id && i.size === data.size && i.color === data.color
        );
        if (existingIndex >= 0) {
          items[existingIndex].quantity += data.quantity;
        } else {
          items.push({
            id: Date.now(),
            product_id: data.product_id,
            quantity: data.quantity,
            size: data.size,
            color: data.color,
            price: found.price,
            name: found.name,
            slug: found.slug || "product",
            images: typeof found.images === "string" ? found.images : JSON.stringify(found.images),
          });
        }
        localStorage.setItem("shiv_shakti_cart_items", JSON.stringify(items));
        return { message: "Item added to enquiry" };
      }
    );
  },

  updateItem: async (itemId: number, quantity: number) => {
    return tryOrLocal(
      async () => {
        const csrf = await getCSRFToken();
        return apiFetch<{ message: string }>("/api/cart/update", {
          method: "PUT",
          headers: { "X-CSRF-Token": csrf },
          body: JSON.stringify({ item_id: itemId, quantity }),
        });
      },
      () => {
        if (typeof window === "undefined") return { message: "Updated" };
        const saved = localStorage.getItem("shiv_shakti_cart_items");
        const items: CartItem[] = saved ? JSON.parse(saved) : [];
        const updated = items.map((i) => (i.id === itemId ? { ...i, quantity } : i));
        localStorage.setItem("shiv_shakti_cart_items", JSON.stringify(updated));
        return { message: "Quantity updated" };
      }
    );
  },

  removeItem: async (itemId: number) => {
    return tryOrLocal(
      async () => {
        const csrf = await getCSRFToken();
        return apiFetch<{ message: string }>(`/api/cart/remove/${itemId}`, {
          method: "DELETE",
          headers: { "X-CSRF-Token": csrf },
        });
      },
      () => {
        if (typeof window === "undefined") return { message: "Removed" };
        const saved = localStorage.getItem("shiv_shakti_cart_items");
        const items: CartItem[] = saved ? JSON.parse(saved) : [];
        const filtered = items.filter((i) => i.id !== itemId);
        localStorage.setItem("shiv_shakti_cart_items", JSON.stringify(filtered));
        return { message: "Item removed" };
      }
    );
  },
};

export const ordersAPI = {
  checkout: async (data: CheckoutInput) => {
    return tryOrLocal(
      async () => {
        const csrf = await getCSRFToken();
        return apiFetch<{
          message: string;
          order_id: number;
          status: "payment_pending";
          total: number;
        }>("/api/checkout", {
          method: "POST",
          headers: { "X-CSRF-Token": csrf },
          body: JSON.stringify(data),
        });
      },
      () => {
        const newId = Math.floor(100000 + Math.random() * 900000);
        if (typeof window !== "undefined") {
          const ords = getLocalOrders();
          const savedCart = localStorage.getItem("shiv_shakti_cart_items");
          const cartItems: CartItem[] = savedCart ? JSON.parse(savedCart) : [];
          const newOrder: AdminOrder = {
            id: newId,
            user_id: 2,
            total_price: cartItems.reduce((s, i) => s + i.price * i.quantity, 0) || 19200,
            status: "payment_pending",
            shipping_name: data.shipping_name || "Enquiry Buyer",
            shipping_address: data.shipping_address || "",
            shipping_city: data.shipping_city || "",
            shipping_state: data.shipping_state || "",
            shipping_zip: data.shipping_zip || "",
            shipping_country: data.shipping_country || "",
            shipping_phone: data.shipping_phone || "",
            payment_reference: "Pending",
            payment_confirmed_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            items: cartItems.map((i) => ({
              id: i.id,
              order_id: newId,
              product_id: i.product_id,
              quantity: i.quantity,
              price: i.price,
              size: i.size,
              color: i.color,
              name: i.name,
            })),
            user_name: data.shipping_name || "Enquiry Buyer",
            user_email: data.shipping_phone || "buyer@shivshakti.com",
          };
          saveLocalOrders([newOrder, ...ords]);
          localStorage.removeItem("shiv_shakti_cart_items");
        }
        return {
          message: "Enquiry submitted successfully.",
          order_id: newId,
          status: "payment_pending" as const,
          total: 19200,
        };
      }
    );
  },

  list: () =>
    tryOrLocal(
      () => apiFetch<{ orders: Order[] }>("/api/orders"),
      () => {
        const ords = getLocalOrders();
        return {
          orders: ords.map((o) => ({
            id: o.id,
            status: o.status,
            total: o.total_price,
            created_at: o.created_at,
            items: o.items,
          })) as any,
        };
      }
    ),
};

export const ngoAPI = {
  submitInterest: (data: NGOInterestInput) =>
    tryOrLocal(
      () =>
        apiFetch<{ message: string }>("/api/ngo/interest", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      () => ({ message: "Interest registered locally. Thank you for your support." })
    ),
};

export const fabricAPI = {
  submitQuote: (data: FabricQuoteInput) =>
    tryOrLocal(
      () =>
        apiFetch<{ message: string }>("/api/fabric-quote", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      () => ({ message: "Fabric selling quotation request submitted locally." })
    ),
};

export const communityAPI = {
  listPosts: (category?: string) => {
    const params = category && category !== "ALL" ? `?category=${encodeURIComponent(category)}` : "";
    return tryOrLocal(
      () => apiFetch<CommunityPost[]>(`/api/community/posts${params}`),
      () => [
        {
          id: 1,
          user_id: 1,
          email: "studio@shivshakti.com",
          title: "SS26 Sustainable Deconstruction Showcase",
          body: "Exploring how salvaged ritual textiles form the core of our ceremonial silhouettes.",
          category: "Design",
          likes: 42,
          created_at: new Date().toISOString(),
        },
      ]
    );
  },

  createPost: async (data: { title: string; body: string; category: string }) => {
    return tryOrLocal(
      async () => {
        const csrf = await getCSRFToken();
        return apiFetch<{ message: string; post_id: number }>("/api/community/post", {
          method: "POST",
          headers: { "X-CSRF-Token": csrf },
          body: JSON.stringify(data),
        });
      },
      () => ({ message: "Post created locally", post_id: Date.now() })
    );
  },

  likePost: async (postId: number) => {
    return tryOrLocal(
      async () => {
        const csrf = await getCSRFToken();
        return apiFetch<{ message: string }>("/api/community/like", {
          method: "POST",
          headers: { "X-CSRF-Token": csrf },
          body: JSON.stringify({ post_id: postId }),
        });
      },
      () => ({ message: "Post liked" })
    );
  },
};
