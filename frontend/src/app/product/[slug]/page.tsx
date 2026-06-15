

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";
import { CheckIcon } from "@/components/ui/Icons";
import {
  getCategoryFallbackImage,
  getColorSwatch,
  getProductImages,
  parseList,
} from "@/lib/productMedia";
import { getAllProducts } from "@/lib/productData";
import { formatPriceINR } from "@/lib/pricing";
import { MIN_WHOLESALE_QUANTITY, WHOLESALE_PACK_SIZES } from "@/lib/wholesale";

export default function ProductDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem, openCart, user } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(MIN_WHOLESALE_QUANTITY);
  const [addNotice, setAddNotice] = useState("");

  useEffect(() => {
    
    getAllProducts().then((data) => {
      const found = data.find((p) => p.slug === slug);
      if (found) {
        setProduct(found);
        
        
        const sizes = parseList(found.sizes);
        const colors = parseList(found.colors);
        
        if (sizes.length > 0) setSelectedSize(sizes[0]);
        if (colors.length > 0) setSelectedColor(colors[0]);
      }
      setIsLoading(false);
    });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-6 h-6 border border-black/30 border-t-black animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <h1 className="text-[24px] tracking-[0.2em] font-light uppercase text-stone">
          GARMENT NOT FOUND
        </h1>
      </div>
    );
  }

  const images = getProductImages(product);
  const sizes = parseList(product.sizes);
  const colors = parseList(product.colors);
  const fallbackImage = getCategoryFallbackImage(product.category);

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) return;

    if (!user) {
      setAddNotice("Log in or create an identity before adding wholesale enquiry items.");
      openCart();
      return;
    }

    setAddNotice("");
    setIsAdding(true);
    await addItem(product.id, selectedSize, selectedColor, quantity);
    setIsAdding(false);
  };

  const wholesaleSubtotal = product.price * quantity;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-12 px-6 pb-12 pt-28 md:px-10 md:pt-32 lg:flex-row lg:gap-24 lg:pb-20">
      <div className="flex w-full min-w-0 flex-col gap-4 lg:w-1/2">
        <motion.div 
          className="relative flex h-[min(72vh,760px)] min-h-[420px] items-center justify-center overflow-hidden border border-black/10 bg-[#f4f1ec] lg:sticky lg:top-28 lg:h-[calc(100vh-9rem)] lg:max-h-[860px]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIdx}
              src={images[currentImageIdx] || images[0]}
              alt={product.name}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="h-full w-full object-contain p-2 md:p-4"
              onError={(event) => {
                event.currentTarget.src = fallbackImage;
              }}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>
          
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
               style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 3px)" }} />
        </motion.div>

        {images.length > 1 && (
          <div className="scrollbar-hide flex w-full min-w-0 gap-4 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIdx(idx)}
                className={`relative aspect-[3/4] w-20 flex-shrink-0 overflow-hidden border bg-[#f4f1ec] transition-colors ${
                  idx === currentImageIdx ? "border-bone" : "border-black/10 hover:border-black/30"
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex w-full min-w-0 flex-col pt-8 lg:w-1/2 lg:pt-16">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-stone mb-4">
              {product.category} / {product.collection} / wholesale
            </p>
            <h1 className="text-[32px] lg:text-[48px] font-light tracking-[0.05em] uppercase text-bone leading-none">
              {product.name}
            </h1>
            <p className="text-[18px] tracking-[0.1em] text-bone/70 mt-6">
              {formatPriceINR(product.price)} wholesale unit
            </p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-stone">
              MOQ {MIN_WHOLESALE_QUANTITY} units per style. Pack quantities can be adjusted before enquiry review.
            </p>
          </div>

          <div className="glow-line w-full" />

          <p className="text-[14px] leading-[1.8] text-stone tracking-wide">
            {product.description}
          </p>

          <div className="space-y-6 pt-4">
            {colors.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] tracking-[0.2em] uppercase text-stone">
                  COLOR: <span className="text-bone">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`flex h-9 w-9 items-center justify-center border transition-all ${
                        selectedColor === color ? "border-bone p-1" : "border-black/10"
                      }`}
                      aria-label={`Select ${color}`}
                    >
                      <span 
                        className="h-full w-full border border-black/10"
                        style={{ backgroundColor: getColorSwatch(color) }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] tracking-[0.2em] uppercase text-stone flex justify-between">
                  <span>SIZE</span>
                  <button className="underline opacity-50 hover:opacity-100 transition-opacity">SIZE GUIDE</button>
                </p>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] h-[48px] px-4 flex items-center justify-center text-[12px] tracking-[0.1em] border transition-colors ${
                        selectedSize === size
                          ? "border-bone bg-black text-white"
                          : "border-black/15 text-stone hover:border-black/40 hover:text-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 border border-black/10 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone">
                  Wholesale quantity
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-bone/55">
                  Minimum order: {MIN_WHOLESALE_QUANTITY} units
                </p>
              </div>
              <div className="flex items-center border border-black/15">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(MIN_WHOLESALE_QUANTITY, value - 1))}
                  className="h-11 w-11 text-[18px] text-stone transition-colors hover:text-black"
                  aria-label="Decrease wholesale quantity"
                >
                  -
                </button>
                <span className="w-14 text-center text-[13px] tracking-[0.12em] text-black">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.min(500, value + 1))}
                  className="h-11 w-11 text-[18px] text-stone transition-colors hover:text-black"
                  aria-label="Increase wholesale quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {WHOLESALE_PACK_SIZES.map((packSize) => (
                <button
                  key={packSize}
                  type="button"
                  onClick={() => setQuantity(packSize)}
                  className={`h-10 border text-[10px] uppercase tracking-[0.16em] transition-colors ${
                    quantity === packSize
                      ? "border-black bg-black text-white"
                      : "border-black/15 text-stone hover:border-black/40 hover:text-black"
                  }`}
                >
                  {packSize}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-black/10 pt-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-stone">
                Estimated line total
              </span>
              <span className="text-[16px] tracking-[0.08em] text-bone">
                {formatPriceINR(wholesaleSubtotal)}
              </span>
            </div>
          </div>

          <motion.button
            onClick={handleAddToCart}
            disabled={!product.in_stock || isAdding}
            whileHover={{ scale: product.in_stock ? 1.02 : 1 }}
            whileTap={{ scale: product.in_stock ? 0.98 : 1 }}
            className={`relative w-full overflow-hidden group border py-5 text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-3 mt-8 ${
              product.in_stock ? "border-bone text-bone" : "border-stone/30 text-stone/50 cursor-not-allowed"
            }`}
          >
            {isAdding ? (
              <span className="w-4 h-4 border border-black/30 border-t-black animate-spin" />
            ) : product.in_stock ? (
              <>
                <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
                  ADD TO WHOLESALE ENQUIRY
                </span>
                <div className="absolute inset-0 translate-y-[100%] bg-black transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
              </>
            ) : (
                <span>OUT OF STOCK</span>
            )}
          </motion.button>

          {addNotice && (
            <p className="text-[10px] uppercase leading-relaxed tracking-[0.14em] text-stone">
              {addNotice}{" "}
              <Link href="/login" className="underline underline-offset-4 transition-colors hover:text-black">
                Log in
              </Link>
            </p>
          )}
          
          <ul className="space-y-2 pt-6 text-[10px] uppercase tracking-[0.15em] text-stone">
            {["WHOLESALE ENQUIRY REVIEW", "PAYMENT METHOD SHARED AFTER APPROVAL", "BULK SHIPPING QUOTED AFTER REVIEW"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckIcon className="h-3.5 w-3.5 text-black" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
