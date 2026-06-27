

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
        <p className="mb-5 text-[12px] font-medium uppercase tracking-[0.22em] text-black/70">
          Wholesale catalogue / MOQ {MIN_WHOLESALE_QUANTITY} units per style
        </p>
        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-[40px] font-light uppercase tracking-[0.16em] text-black md:text-[60px]"
        >
          {collection === "shiva" ? "SHIVA" : collection === "shakti" ? "SHAKTI" : collection}
        </motion.h1>
        <p className="mx-auto mt-6 max-w-2xl px-6 text-[15px] font-medium uppercase leading-[1.8] tracking-[0.08em] text-black/80 md:text-[16px]">
          Select sizes, colorways, and bulk quantities for boutique, studio, and partner enquiries.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-8 bg-white px-6 py-12 sm:grid-cols-2 md:px-10 lg:grid-cols-4">
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
