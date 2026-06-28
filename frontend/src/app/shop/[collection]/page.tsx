

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import type { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";
import { getAllProducts } from "@/lib/productData";
import { MIN_WHOLESALE_QUANTITY } from "@/lib/wholesale";

export default function ShopCollection() {
  const params = useParams();
  const collection = params.collection as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="w-full bg-white min-h-[80vh] flex flex-col items-center">
      <div className="w-full border-b border-black py-20 text-center">
        <p className="mb-5 px-5 text-[14px] font-medium uppercase leading-relaxed tracking-[0.2em] text-black/55 lg:text-[12px] lg:tracking-[0.28em] lg:text-black/45">
          Wholesale catalogue / MOQ {MIN_WHOLESALE_QUANTITY} units per style
        </p>
        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-[44px] font-light uppercase tracking-[0.14em] text-black min-[600px]:text-[56px] md:text-[60px] md:tracking-[0.16em]"
        >
          {collection === "shiva" ? "SHIVA" : collection === "shakti" ? "SHAKTI" : collection}
        </motion.h1>
        <p className="mx-auto mt-6 max-w-2xl px-6 text-[18px] uppercase leading-relaxed tracking-[0.1em] text-black/55 lg:text-[16px] lg:tracking-[0.14em] lg:text-black/50">
          Select sizes, colorways, and bulk quantities for boutique, studio, and partner enquiries.
        </p>
      </div>

      <div className="product-catalogue-grid grid w-full grid-cols-1 gap-10 bg-white px-6 py-12 min-[600px]:grid-cols-2 md:px-10 lg:grid-cols-4">
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
  );
}
