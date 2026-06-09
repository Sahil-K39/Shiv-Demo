

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, User } from "@/types";
import { cartAPI, authAPI } from "@/lib/api";
import { MIN_WHOLESALE_QUANTITY } from "@/lib/wholesale";

interface CartState {
  
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  total: number;
  user: User | null;

  
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, size: string, color: string, qty?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;

  
  setUser: (user: User | null) => void;
  checkSession: () => Promise<void>;
  logout: () => void;

  
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      
      items: [],
      isOpen: false,
      isLoading: false,
      total: 0,
      user: null,

      
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      
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

      
      addItem: async (productId, size, color, qty = MIN_WHOLESALE_QUANTITY) => {
        set({ isLoading: true });
        try {
          await cartAPI.addItem({
            product_id: productId,
            quantity: qty,
            size,
            color,
          });
          await get().fetchCart();
          set({ isOpen: true }); 
        } catch {
          set({ isLoading: false });
        }
      },

      
      updateQuantity: async (itemId, quantity) => {
        
        set((s) => ({
          items: s.items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        }));
        try {
          await cartAPI.updateItem(itemId, quantity);
          await get().fetchCart();
        } catch {
          await get().fetchCart(); 
        }
      },

      
      removeItem: async (itemId) => {
        
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

      
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "shiv-shakti-cart", 
      partialize: (state) => ({
        
        user: state.user,
      }),
    }
  )
);
