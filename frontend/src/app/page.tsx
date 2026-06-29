"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
// Fixed hero/section images to avoid hydration mismatch from Math.random()
import type { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";
import { getAllProducts } from "@/lib/productData";
import { MIN_WHOLESALE_QUANTITY } from "@/lib/wholesale";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllProducts()
      .then((data) => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 300]);

  return (
    <>
      <section className="relative flex h-[calc(100svh-80px)] min-h-[620px] w-full items-end overflow-hidden border-b border-black p-6 md:p-10">
        <motion.div 
          className="absolute inset-0 w-full h-[120%] -top-[10%] bg-[radial-gradient(circle_at_60%_35%,rgba(255,255,255,0.18),transparent_38%),linear-gradient(135deg,#090909,#2f2a28_48%,#050505)]"
          style={{ y: heroY }}
        >
          <Image
            src="/final-products/go22/go22-01.png"
            alt="Shiv Shakti SS26 editorial look" 
            fill
            priority
            sizes="100vw"
            className="object-cover object-top opacity-95"
          />
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-start gap-10 pb-16">
          <motion.h1
            initial={{ opacity: 0, filter: "blur(10px)", y: 28 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl break-words text-[44px] font-light uppercase leading-[0.92] text-white mix-blend-difference sm:text-[64px] md:text-[96px] xl:text-[112px]"
          >
            SS26 / WHOLESALE BUYING ROOM
          </motion.h1>

          <Link href="/shop/shakti">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="group relative inline-block overflow-hidden border border-white bg-transparent px-10 py-5 text-[13px] uppercase tracking-[0.16em] text-white backdrop-blur-sm transition-colors duration-500 lg:text-[11px] lg:tracking-[0.2em]"
            >
              <span className="relative z-10 group-hover:text-black transition-colors duration-500">
                Start Wholesale Order
              </span>
              <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
            </motion.div>
          </Link>
        </div>
      </section>

      <div className="w-full h-[120px] bg-black flex items-center overflow-hidden border-b border-black select-none">
        <div className="whitespace-nowrap px-4 text-[54px] uppercase animate-marquee md:text-[80px]" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.5)", color: "transparent" }}>
          WHOLESALE MOQ {MIN_WHOLESALE_QUANTITY} UNITS PER STYLE. / SEND ENQUIRY FOR REVIEW, PAYMENT TERMS, AND DELIVERY PLAN. / SS26 BUYING WINDOW OPEN. / WHOLESALE MOQ {MIN_WHOLESALE_QUANTITY} UNITS PER STYLE.
        </div>
      </div>

      <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-black mt-[1px] border-b border-black">
        <Link href="/shop/shiva" className="relative aspect-square bg-white group block overflow-hidden">
          <div className="relative h-full w-full">
            <Image
              src="/final-products/go44/go44-01.png"
              alt="Shiva"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top transition-all duration-[1500ms] ease-out group-hover:scale-105 group-hover:grayscale-0"
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-[8%] flex justify-center md:top-[10%]">
            <h2 className="text-[50px] md:text-[70px] text-white uppercase leading-none tracking-[0.2em] mix-blend-difference drop-shadow-2xl font-light">SHIVA</h2>
          </div>
        </Link>
        <Link href="/shop/shakti" className="relative aspect-square bg-white group block overflow-hidden">
          <div className="relative h-full w-full">
            <Image
              src="/final-products/go01/go01-01.png"
              alt="Shakti"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top transition-all duration-[1500ms] ease-out group-hover:scale-105 group-hover:grayscale-0"
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-[8%] flex justify-center md:top-[10%]">
            <h2 className="text-[50px] md:text-[70px] text-white uppercase leading-none tracking-[0.2em] mix-blend-difference drop-shadow-2xl font-light">SHAKTI</h2>
          </div>
        </Link>
      </section>

      <section className="w-full py-20 flex flex-col gap-10 border-b border-black">
        <div className="w-full px-10 text-center">
          <h3 className="text-2xl text-black uppercase tracking-[0.1em]">WHOLESALE READY STYLES</h3>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-32">
            <div className="w-6 h-6 border border-black/30 border-t-black animate-spin" />
          </div>
        ) : (
          <div className="product-catalogue-grid grid w-full grid-cols-1 gap-10 bg-white px-6 min-[600px]:grid-cols-2 md:px-10 lg:grid-cols-4">
            {products.slice(0, 4).map((product, i) => (
              <ProductCard key={product.slug} product={product} index={i} />
            ))}
          </div>
        )}

        <div className="w-full flex justify-center mt-10">
          <Link href="/shop/shakti" className="group relative inline-block overflow-hidden border border-black bg-white px-10 py-5 text-[13px] uppercase tracking-[0.16em] text-black lg:text-[11px] lg:tracking-[0.2em]">
            <span className="relative z-10 group-hover:text-white transition-colors duration-500">VIEW WHOLESALE CATALOGUE</span>
            <div className="absolute inset-0 bg-black translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
          </Link>
        </div>
      </section>
    </>
  );
}
