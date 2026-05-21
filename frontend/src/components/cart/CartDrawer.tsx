

"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { CloseIcon, MinusIcon, PlusIcon } from "@/components/ui/Icons";
import { getCartItemImage } from "@/lib/productMedia";

export default function CartDrawer() {
  const { items, isOpen, closeCart, total, removeItem, updateQuantity, isLoading } =
    useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-white border-l border-black/5 z-[201] flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between p-8 border-b border-black/5">
              <div>
                <h2 className="text-[18px] tracking-[0.15em] uppercase font-light text-black">
                  YOUR CART
                </h2>
                <p className="text-[10px] tracking-[0.2em] uppercase text-gray-500 mt-1">
                  {items.length} {items.length === 1 ? "ITEM" : "ITEMS"}
                </p>
              </div>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="icon-button"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {isLoading && (
                <div className="flex justify-center py-16">
                  <div className="w-5 h-5 border border-black/30 border-t-black animate-spin" />
                </div>
              )}

              {!isLoading && items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-[13px] tracking-[0.1em] text-gray-500 uppercase">
                    YOUR BAG IS EMPTY
                  </p>
                  <p className="text-[11px] text-gray-400 mt-2">
                    Add garments to begin the order.
                  </p>
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="flex gap-4 pb-6 border-b border-black/5"
                  >
                    <div className="w-20 h-28 bg-ash flex-shrink-0 overflow-hidden">
                      <Image
                        src={getCartItemImage(item.images)}
                        alt={item.name}
                        width={80}
                        height={112}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="text-[12px] tracking-[0.1em] uppercase text-black font-light truncate">
                          {item.name}
                        </h4>
                        <p className="text-[10px] tracking-[0.15em] uppercase text-gray-500 mt-1">
                          SIZE: {item.size} {item.color && `/ ${item.color}`}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-black/10">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            aria-label={`Decrease quantity for ${item.name}`}
                            className="flex h-7 w-7 items-center justify-center text-gray-500 transition-colors hover:text-black"
                          >
                            <MinusIcon className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-[11px] tracking-[0.1em] text-black">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, Math.min(10, item.quantity + 1))}
                            aria-label={`Increase quantity for ${item.name}`}
                            className="flex h-7 w-7 items-center justify-center text-gray-500 transition-colors hover:text-black"
                          >
                            <PlusIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span className="text-[12px] tracking-[0.1em] text-black/70">
                          ${(item.price * item.quantity).toLocaleString()}
                        </span>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[10px] tracking-[0.15em] uppercase text-gray-500 hover:text-red-600 transition-colors"
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {items.length > 0 && (
              <div className="p-8 border-t border-black/5 space-y-4 bg-white">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] tracking-[0.2em] uppercase text-gray-500">
                    SUBTOTAL
                  </span>
                  <span className="text-[18px] tracking-[0.05em] text-black font-light">
                    ${total.toLocaleString()}
                  </span>
                </div>

                <motion.button
                  className="relative w-full overflow-hidden group border border-black text-black py-4 text-[11px] tracking-[0.2em] uppercase bg-transparent"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="relative z-10 group-hover:text-white transition-colors duration-500">
                    PROCEED TO CHECKOUT
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-black"
                    initial={{ y: "100%" }}
                    whileHover={{ y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </motion.button>

                <p className="text-[9px] tracking-[0.1em] text-center text-gray-400 uppercase">
                  Shipping calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
