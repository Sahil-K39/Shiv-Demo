/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SHIV SHAKTI PROJECT — Zustand Cart Store
 * cart.ts — Persistent, lightweight cart & session state management
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, User } from "@/types";
import { cartAPI, authAPI } from "@/lib/api";

interface CartState {
  // ── State ─────────────────────────────────────────────────────
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  total: number;
  user: User | null;

  // ── Cart Actions ──────────────────────────────────────────────
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, size: string, color: string, qty?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;

  // ── Auth Actions ──────────────────────────────────────────────
  setUser: (user: User | null) => void;
  checkSession: () => Promise<void>;
  logout: () => void;

  // ── Computed ──────────────────────────────────────────────────
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // ── Initial State ───────────────────────────────────────────
      items: [],
      isOpen: false,
      isLoading: false,
      total: 0,
      user: null,

      // ── Cart Visibility ─────────────────────────────────────────
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      // ── Fetch Cart from Server ──────────────────────────────────
      fetchCart: async () => {
        if (!get().user) return;
        set({ isLoading: true });
        try {
          const data = await cartAPI.get();
          set({ items: data.items, total: data.total, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      // ── Add Item to Cart ────────────────────────────────────────
      addItem: async (productId, size, color, qty = 1) => {
        set({ isLoading: true });
        try {
          await cartAPI.addItem({
            product_id: productId,
            quantity: qty,
            size,
            color,
          });
          await get().fetchCart();
          set({ isOpen: true }); // Auto-open cart on add
        } catch {
          set({ isLoading: false });
        }
      },

      // ── Update Item Quantity ─────────────────────────────────────
      updateQuantity: async (itemId, quantity) => {
        // Optimistic update
        set((s) => ({
          items: s.items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        }));
        try {
          await cartAPI.updateItem(itemId, quantity);
          await get().fetchCart();
        } catch {
          await get().fetchCart(); // Revert on failure
        }
      },

      // ── Remove Item ─────────────────────────────────────────────
      removeItem: async (itemId) => {
        // Optimistic removal
        set((s) => ({
          items: s.items.filter((i) => i.id !== itemId),
        }));
        try {
          await cartAPI.removeItem(itemId);
          await get().fetchCart();
        } catch {
          await get().fetchCart();
        }
      },

      // ── Auth ────────────────────────────────────────────────────
      setUser: (user) => set({ user }),

      checkSession: async () => {
        try {
          const user = await authAPI.me();
          set({ user });
          await get().fetchCart();
        } catch {
          set({ user: null, items: [], total: 0 });
        }
      },

      logout: () => {
        authAPI.logout().catch(() => {});
        set({ user: null, items: [], total: 0, isOpen: false });
      },

      // ── Computed ────────────────────────────────────────────────
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "shiv-shakti-cart", // localStorage key
      partialize: (state) => ({
        // Only persist user session — cart syncs from server
        user: state.user,
      }),
    }
  )
);
