/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SHIV SHAKTI PROJECT — Collection Page
 * page.tsx — Renders garments for a specific collection
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { productsAPI } from "@/lib/api";
import type { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";

export default function ShopCollection() {
  const params = useParams();
  const collection = params.collection as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productsAPI
      .listAll()
      .then((data) => {
        // Simple client-side filtering for the stub
        const filtered = data.products.filter(
          (p) => p.collection.toLowerCase() === collection.toLowerCase()
        );
        // If empty, just show all for demo purposes
        setProducts(filtered.length > 0 ? filtered : data.products);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [collection]);

  return (
    <div className="w-full bg-white min-h-[80vh] flex flex-col items-center">
      <div className="w-full border-b border-black py-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-[40px] font-light uppercase tracking-[0.16em] text-black md:text-[60px]"
        >
          {collection}
        </motion.h1>
      </div>

      <div className="grid w-full grid-cols-1 gap-8 bg-white px-6 py-12 sm:grid-cols-2 md:px-10 lg:grid-cols-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-32 bg-white">
            <div className="w-6 h-6 border border-black/30 border-t-black animate-spin" />
          </div>
        ) : (
          products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))
        )}
      </div>
    </div>
  );
}
