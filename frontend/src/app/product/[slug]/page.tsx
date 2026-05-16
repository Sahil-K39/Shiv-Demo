/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SHIV SHAKTI PROJECT — Product Detail Page
 * page.tsx — Dynamic product route with gallery and add-to-cart
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { productsAPI } from "@/lib/api";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";
import { CheckIcon } from "@/components/ui/Icons";
import { getColorSwatch, getProductImages, parseList } from "@/lib/productMedia";

export default function ProductDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    // We fetch all products and find the slug. In production, we'd add a GET /api/products/slug/:slug endpoint.
    productsAPI.listAll().then((data) => {
      const found = data.products.find((p) => p.slug === slug);
      if (found) {
        setProduct(found);
        
        // Auto-select first size and color
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

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) return;
    setIsAdding(true);
    await addItem(product.id, selectedSize, selectedColor, 1);
    setIsAdding(false);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-12 lg:py-20 flex flex-col lg:flex-row gap-12 lg:gap-24">
      {/* ── Left: Image Gallery ──────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col gap-4">
        {/* Main Image */}
        <motion.div 
          className="relative aspect-[3/4] bg-obsidian overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIdx}
              src={images[currentImageIdx] || images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>
          
          {/* Scan lines */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
               style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 3px)" }} />
        </motion.div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIdx(idx)}
                className={`relative w-20 aspect-[3/4] flex-shrink-0 border transition-colors ${
                  idx === currentImageIdx ? "border-bone" : "border-black/10 hover:border-black/30"
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Right: Product Info ──────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col pt-8 lg:pt-16">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-stone mb-4">
              {product.category} / {product.collection}
            </p>
            <h1 className="text-[32px] lg:text-[48px] font-light tracking-[0.05em] uppercase text-bone leading-none">
              {product.name}
            </h1>
            <p className="text-[18px] tracking-[0.1em] text-bone/70 mt-6">
              ${product.price.toLocaleString()}
            </p>
          </div>

          <div className="glow-line w-full" />

          {/* Description */}
          <p className="text-[14px] leading-[1.8] text-stone tracking-wide">
            {product.description}
          </p>

          <div className="space-y-6 pt-4">
            {/* Color Selection */}
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

            {/* Size Selection */}
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

          {/* Add to Cart Button */}
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
                  ADD TO BAG
                </span>
                <div className="absolute inset-0 translate-y-[100%] bg-black transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
              </>
            ) : (
              <span>OUT OF STOCK</span>
            )}
          </motion.button>
          
          {/* Metadata */}
          <ul className="space-y-2 pt-6 text-[10px] uppercase tracking-[0.15em] text-stone">
            {["WORLDWIDE SECURE SHIPPING", "LIFETIME REPAIR GUARANTEE", "MADE IN LIMITED RUNS"].map((item) => (
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
