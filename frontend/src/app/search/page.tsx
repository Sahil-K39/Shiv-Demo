

"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import ProductCard from "@/components/product/ProductCard";
import { getAllProducts } from "@/lib/productData";
import type { Product } from "@/types";

export default function Search() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .finally(() => setIsLoading(false));
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalizedQuery) return [];

    return products.filter((product) =>
      [
        product.name,
        product.category,
        product.collection,
        product.description,
        product.sku,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    );
  }, [normalizedQuery, products]);

  return (
    <div className="flex min-h-[80vh] w-full flex-col items-center bg-white">
      <motion.div
        className="w-full max-w-3xl px-6 pb-14 pt-10 md:px-10 md:pb-20 md:pt-14"
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-[12px] uppercase tracking-[0.24em] text-gray-500 mb-4">
          SEARCH ARCHIVE
        </h1>
        <div className="relative border-b border-black">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-[40px] md:text-[60px] font-light text-black uppercase outline-none placeholder:text-gray-200 py-4"
            placeholder="ENTER KEYWORD"
            autoFocus
          />
        </div>
        <AnimatePresence>
          {query && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-center text-[11px] uppercase tracking-[0.2em] text-gray-400">
                {isLoading
                  ? "Searching archive..."
                  : `${results.length} ${results.length === 1 ? "record" : "records"} found`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {normalizedQuery && !isLoading ? (
        results.length > 0 ? (
          <div className="product-catalogue-grid grid w-full grid-cols-1 gap-10 border-t border-black bg-white px-6 py-12 min-[600px]:grid-cols-2 md:px-10 lg:grid-cols-4">
            {results.map((product, index) => (
              <ProductCard key={product.slug} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="flex w-full flex-1 items-center justify-center border-t border-black px-6 py-24">
            <p className="text-center text-[12px] uppercase tracking-[0.2em] text-gray-500">
              No matching products found.
            </p>
          </div>
        )
      ) : null}
    </div>
  );
}
