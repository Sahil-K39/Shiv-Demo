

"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { CloseIcon, MinusIcon, PlusIcon } from "@/components/ui/Icons";
import { ordersAPI } from "@/lib/api";
import { getCartItemImage } from "@/lib/productMedia";
import { formatPriceINR } from "@/lib/pricing";
import { MIN_WHOLESALE_QUANTITY } from "@/lib/wholesale";

const emptyEnquiryForm = {
  shipping_name: "",
  shipping_address: "",
  shipping_city: "",
  shipping_state: "",
  shipping_zip: "",
  shipping_country: "India",
  shipping_phone: "+91 ",
};

export default function CartDrawer() {
  const { items, isOpen, closeCart, total, removeItem, updateQuantity, fetchCart, isLoading, user } =
    useCartStore();
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [form, setForm] = useState(emptyEnquiryForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const canSendEnquiry = Boolean(user) && totalUnits >= MIN_WHOLESALE_QUANTITY;
  const enquiryBlockedReason = !user
    ? "Log in to send this wholesale enquiry."
    : totalUnits < MIN_WHOLESALE_QUANTITY
      ? `Add at least ${MIN_WHOLESALE_QUANTITY} units to send an enquiry.`
      : "";

  function setField(field: keyof typeof emptyEnquiryForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleEnquirySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await ordersAPI.checkout(form);
      setMessage(
        `Enquiry #${response.order_id} sent. We will review quantities, payment method, and delivery plan before confirming.`
      );
      setForm(emptyEnquiryForm);
      setIsEnquiryOpen(false);
      await fetchCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send enquiry.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
                  WHOLESALE ENQUIRY
                </h2>
                <p className="text-[10px] tracking-[0.2em] uppercase text-gray-500 mt-1">
                  {items.length} wholesale {items.length === 1 ? "line" : "lines"}
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
                    YOUR WHOLESALE ENQUIRY IS EMPTY
                  </p>
                  <p className="text-[11px] text-gray-400 mt-2">
                    Add at least {MIN_WHOLESALE_QUANTITY} units to begin a buyer enquiry.
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
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                Math.max(MIN_WHOLESALE_QUANTITY, item.quantity - 1)
                              )
                            }
                            aria-label={`Decrease quantity for ${item.name}`}
                            className="flex h-7 w-7 items-center justify-center text-gray-500 transition-colors hover:text-black"
                          >
                            <MinusIcon className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-[11px] tracking-[0.1em] text-black">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, Math.min(500, item.quantity + 1))}
                            aria-label={`Increase quantity for ${item.name}`}
                            className="flex h-7 w-7 items-center justify-center text-gray-500 transition-colors hover:text-black"
                          >
                            <PlusIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span className="text-[12px] tracking-[0.1em] text-black/70">
                          {formatPriceINR(item.price * item.quantity)}
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
                    ENQUIRY SUBTOTAL
                  </span>
                  <span className="text-[18px] tracking-[0.05em] text-black font-light">
                    {formatPriceINR(total)}
                  </span>
                </div>

                {enquiryBlockedReason && (
                  <p className="border border-amber-200 bg-amber-50 p-3 text-[10px] uppercase leading-relaxed tracking-[0.12em] text-amber-700">
                    {enquiryBlockedReason}
                  </p>
                )}

                <div className="flex justify-between text-[10px] uppercase tracking-[0.16em] text-gray-500">
                  <span>Total Units</span>
                  <span>{totalUnits}</span>
                </div>

                {message && (
                  <p className="border border-green-200 bg-green-50 p-3 text-[10px] uppercase leading-relaxed tracking-[0.12em] text-green-700">
                    {message}
                  </p>
                )}

                {error && (
                  <p className="border border-red-200 bg-red-50 p-3 text-[10px] uppercase leading-relaxed tracking-[0.12em] text-red-700">
                    {error}
                  </p>
                )}

                {isEnquiryOpen && (
                  <form onSubmit={handleEnquirySubmit} className="space-y-3 border border-black/10 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                      Buyer and delivery details
                    </p>
                    {[
                      ["shipping_name", "Full name"],
                      ["shipping_phone", "Phone"],
                      ["shipping_address", "Address"],
                      ["shipping_city", "City"],
                      ["shipping_state", "State"],
                      ["shipping_zip", "PIN / ZIP"],
                      ["shipping_country", "Country"],
                    ].map(([field, label]) => (
                      <input
                        key={field}
                        required
                        value={form[field as keyof typeof form]}
                        onChange={(event) =>
                          setField(field as keyof typeof emptyEnquiryForm, event.target.value)
                        }
                        placeholder={label}
                        className="min-h-11 w-full border border-black/10 px-3 text-[12px] outline-none focus:border-black"
                      />
                    ))}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full border border-black bg-black py-3 text-[10px] uppercase tracking-[0.18em] text-white disabled:opacity-50"
                    >
                      {isSubmitting ? "Sending..." : "Submit Enquiry"}
                    </button>
                  </form>
                )}

                <motion.button
                  type="button"
                  onClick={() => {
                    setError("");
                    setMessage("");
                    if (!canSendEnquiry) return;
                    setIsEnquiryOpen((value) => !value);
                  }}
                  disabled={!canSendEnquiry}
                  className="relative w-full overflow-hidden group border border-black text-black py-4 text-[11px] tracking-[0.2em] uppercase bg-transparent"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="relative z-10 group-hover:text-white transition-colors duration-500">
                    {user ? "SEND WHOLESALE ENQUIRY" : "LOG IN TO SEND ENQUIRY"}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-black"
                    initial={{ y: "100%" }}
                    whileHover={{ y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </motion.button>

                <p className="text-[9px] tracking-[0.1em] text-center text-gray-400 uppercase">
                  MOQ {MIN_WHOLESALE_QUANTITY} units. We review the enquiry, then share payment and delivery instructions.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
