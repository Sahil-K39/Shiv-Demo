

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import type { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";
import { getAllProducts } from "@/lib/productData";
import { MIN_WHOLESALE_QUANTITY } from "@/lib/wholesale";
import Link from "next/link";

export default function ShopCollection() {
  const params = useParams();
  const collection = params.collection as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileGridCols, setMobileGridCols] = useState<1 | 2>(2);

  useEffect(() => {
    getAllProducts()
      .then((data) => {
        const filtered = data.filter(
          (p) => p.category.toLowerCase() === collection.toLowerCase()
        );
        setProducts(filtered.length > 0 ? filtered : data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [collection]);

  return (
    <div className="w-full bg-white text-black min-h-[80vh] flex flex-col items-center">
      <div className="w-full border-b border-black/10 py-16 sm:py-20 text-center">
        <p className="mb-4 px-5 text-[12px] sm:text-[14px] font-medium uppercase leading-relaxed tracking-[0.2em] text-gray-600 lg:text-[12px] lg:tracking-[0.28em] lg:text-gray-500">
          Wholesale catalogue / MOQ {MIN_WHOLESALE_QUANTITY} units per style
        </p>
        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-[38px] sm:text-[44px] font-light uppercase tracking-[0.14em] text-black min-[600px]:text-[56px] md:text-[60px] md:tracking-[0.16em]"
        >
          {collection === "shiva" ? "SHIVA / MEN" : collection === "shakti" ? "SHAKTI / WOMEN" : collection}
        </motion.h1>
        <p className="mx-auto mt-4 sm:mt-6 max-w-2xl px-6 text-[14px] sm:text-[18px] uppercase leading-relaxed tracking-[0.1em] text-gray-600 lg:text-[16px] lg:tracking-[0.14em] lg:text-gray-500">
          Select sizes, colorways, and bulk quantities for boutique, studio, and partner enquiries.
        </p>
      </div>

      {/* Mobile 1-col / 2-col view toggle toolbar */}
      <div className="flex w-full items-center justify-between border-b border-black/10 bg-white px-4 py-3 sm:px-6 md:hidden">
        <span className="text-[10px] uppercase tracking-[0.2em] text-black font-medium">
          {products.length} Styles
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-[0.15em] text-gray-500">Grid:</span>
          <button
            type="button"
            onClick={() => setMobileGridCols(1)}
            aria-label="1 Column Editorial View"
            className={`border px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] transition-colors ${
              mobileGridCols === 1
                ? "border-black bg-black text-white font-semibold"
                : "border-black/20 bg-transparent text-gray-600"
            }`}
          >
            1 Col
          </button>
          <button
            type="button"
            onClick={() => setMobileGridCols(2)}
            aria-label="2 Column Fast View"
            className={`border px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] transition-colors ${
              mobileGridCols === 2
                ? "border-black bg-black text-white font-semibold"
                : "border-black/20 bg-transparent text-gray-600"
            }`}
          >
            2 Col
          </button>
        </div>
      </div>

      {/* Demobaza video style: Category Sidebar + Product Grid */}
      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-8 py-10 flex flex-col lg:flex-row gap-10 items-start">
        {/* Left Category Sidebar (Desktop) / Horizontal Scroll (Mobile) */}
        <div className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-black/10 pb-6 lg:pb-0 lg:pr-8 lg:sticky lg:top-28">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black mb-4">
            CATEGORIES
          </p>
          <div className="flex lg:flex-col gap-4 overflow-x-auto pb-2 lg:pb-0 text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.18em] text-gray-700 whitespace-nowrap">
            <Link href="/shop/shakti" className="hover:text-black transition-colors">
              *NEW STUFF
            </Link>
            <Link href="/shop/shakti" className="hover:text-black transition-colors">
              WHOLESALE
            </Link>
            <Link href="/shop/shiva" className={`hover:text-black transition-colors ${collection.toLowerCase() === 'shiva' ? 'text-black font-bold underline underline-offset-4' : ''}`}>
              SHIVA / MEN
            </Link>
            <Link href="/shop/shakti" className={`hover:text-black transition-colors ${collection.toLowerCase() === 'shakti' ? 'text-black font-bold underline underline-offset-4' : ''}`}>
              SHAKTI / WOMEN
            </Link>
            <Link href="/shop/shakti" className="hover:text-black transition-colors text-gray-400">
              ARMOR / CEREMONIAL
            </Link>
            <Link href="/shop/shiva" className="hover:text-black transition-colors text-gray-400">
              DECONSTRUCTED
            </Link>
            <Link href="/shop/shakti" className="hover:text-black transition-colors text-gray-400">
              KNITS / HEAVY
            </Link>
            <Link href="/shop/shiva" className="hover:text-black transition-colors text-gray-400">
              KNITS / LIGHT
            </Link>
            <Link href="/shop/shakti" className="hover:text-black transition-colors text-gray-400">
              ROBES & COATS
            </Link>
          </div>
        </div>

        {/* Right Product Grid */}
        <div className="flex-1 w-full">
          <div
            className={`product-catalogue-grid grid w-full bg-white min-[600px]:grid-cols-2 lg:grid-cols-3 ${
              mobileGridCols === 2 ? "grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-8 sm:gap-y-16 lg:gap-x-10 lg:gap-y-20" : "grid-cols-1 gap-y-12 sm:gap-y-16"
            }`}
          >
            {isLoading ? (
              <div className="col-span-full flex justify-center py-32 bg-white">
                <div className="w-6 h-6 border border-black/30 border-t-black animate-spin" />
              </div>
            ) : (
              products.map((product, index) => (
                <ProductCard key={product.slug} product={product} index={index} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
