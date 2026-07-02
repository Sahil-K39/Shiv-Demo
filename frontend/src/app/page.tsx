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
      <section className="relative min-h-[calc(100svh-80px)] w-full bg-white text-black border-b border-black/10 overflow-hidden px-6 py-10 md:px-10 lg:py-16">
        <div className="mx-auto w-full max-w-[1700px] grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Side: Demobaza Editorial Menu & Model */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full pt-2">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-black mb-6">
                SS26 WHOLESALE BUYING ROOM
              </p>
              <h1 className="text-[32px] sm:text-[42px] md:text-[54px] font-normal uppercase leading-[1.05] text-black tracking-[0.05em] mb-8">
                SHIV SHAKTI
              </h1>

              <div className="flex flex-row gap-8 sm:gap-12 items-start my-6">
                {/* Demobaza style vertical list */}
                <div className="flex flex-col gap-2.5 text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.18em] text-gray-800">
                  <Link href="/shop/shakti" className="hover:text-black hover:translate-x-1 transition-all">
                    *NEW STUFF
                  </Link>
                  <Link href="/shop/shakti" className="hover:text-black hover:translate-x-1 transition-all">
                    WHOLESALE
                  </Link>
                  <Link href="/shop/shiva" className="hover:text-black hover:translate-x-1 transition-all">
                    SHIVA / MEN
                  </Link>
                  <Link href="/shop/shakti" className="hover:text-black hover:translate-x-1 transition-all">
                    SHAKTI / WOMEN
                  </Link>
                  <Link href="/shop/shakti" className="hover:text-black hover:translate-x-1 transition-all text-gray-500">
                    ARMOR / CEREMONIAL
                  </Link>
                  <Link href="/shop/shiva" className="hover:text-black hover:translate-x-1 transition-all text-gray-500">
                    DECONSTRUCTED
                  </Link>
                  <Link href="/shop/shakti" className="hover:text-black hover:translate-x-1 transition-all text-gray-500">
                    KNITS / HEAVY
                  </Link>
                  <Link href="/shop/shiva" className="hover:text-black hover:translate-x-1 transition-all text-gray-500">
                    KNITS / LIGHT
                  </Link>
                  <Link href="/shop/shakti" className="hover:text-black hover:translate-x-1 transition-all text-gray-500">
                    ROBES & COATS
                  </Link>
                  <Link href="/shop/shiva" className="hover:text-black hover:translate-x-1 transition-all text-gray-500">
                    TROUSERS
                  </Link>
                </div>

                {/* Left Side Model Photo */}
                <div className="relative aspect-[3/4] w-[180px] sm:w-[240px] md:w-[280px] overflow-hidden bg-white shrink-0">
                  <Image
                    src="/final-products/go44/go44-01.webp"
                    alt="Shiv Shakti Look"
                    fill
                    sizes="(max-width: 768px) 50vw, 30vw"
                    className="object-contain object-center"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-black/10">
              <Link href="/shop/shakti" className="inline-block bg-black text-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors">
                START WHOLESALE ORDER
              </Link>
            </div>
          </div>

          {/* Right Side: Demobaza Campaign Photo & Text */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden bg-white group">
              <Image
                src="/final-products/go22/go22-01.webp"
                alt="Shiv Shakti SS26 Campaign" 
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-center transition-transform duration-[2000ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none">
                <h2 className="text-[38px] sm:text-[56px] md:text-[68px] font-bold uppercase tracking-[0.15em] text-black drop-shadow-[0_2px_15px_rgba(255,255,255,0.9)]">
                  SS26
                </h2>
                <p className="text-[16px] sm:text-[22px] font-bold uppercase tracking-[0.25em] text-black drop-shadow-[0_2px_15px_rgba(255,255,255,0.9)]">
                  WHOLESALE OPEN
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 max-w-3xl">
              <h3 className="text-[14px] sm:text-[16px] font-bold uppercase tracking-[0.15em] text-black">
                DISCOVER SS26 — WHOLESALE BUYING ROOM NOW
              </h3>
              <p className="text-[13px] sm:text-[14px] leading-relaxed text-gray-800 font-normal">
                Step into a state of elevation with selected pieces from the SS26 COLLECTION. Inspired by the idea of awakening and inner ascent, SHIV SHAKTI explores the garment as a vessel of transformation — where structure meets lightness and form follows intention. Layered silhouettes, fluid movement and refined textures create a sense of balance, clarity and expansion — designed for your next evolution.
              </p>
            </div>
          </div>

        </div>
      </section>

      <div className="w-full h-[100px] bg-white flex items-center overflow-hidden border-b border-black/10 select-none">
        <div className="whitespace-nowrap px-4 text-[42px] uppercase animate-marquee md:text-[64px]" style={{ WebkitTextStroke: "1px rgba(0,0,0,0.6)", color: "transparent" }}>
          WHOLESALE MOQ {MIN_WHOLESALE_QUANTITY} UNITS PER STYLE. / SEND ENQUIRY FOR REVIEW, PAYMENT TERMS, AND DELIVERY PLAN. / SS26 BUYING WINDOW OPEN. / WHOLESALE MOQ {MIN_WHOLESALE_QUANTITY} UNITS PER STYLE.
        </div>
      </div>

      <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-black/10 mt-[1px] border-b border-black/10">
        <Link href="/shop/shiva" className="relative aspect-square bg-white group block overflow-hidden">
          <div className="relative h-full w-full">
            <Image
              src="/final-products/go44/go44-01.webp"
              alt="Shiva"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top transition-all duration-[1500ms] ease-out group-hover:scale-105"
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-[8%] flex justify-center">
            <span className="bg-white/95 text-black px-8 py-3 text-[28px] md:text-[36px] font-bold uppercase tracking-[0.25em] border border-black/10 shadow-md">
              SHIVA / MEN
            </span>
          </div>
        </Link>
        <Link href="/shop/shakti" className="relative aspect-square bg-white group block overflow-hidden">
          <div className="relative h-full w-full">
            <Image
              src="/final-products/go01/go01-01.webp"
              alt="Shakti"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top transition-all duration-[1500ms] ease-out group-hover:scale-105"
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-[8%] flex justify-center">
            <span className="bg-white/95 text-black px-8 py-3 text-[28px] md:text-[36px] font-bold uppercase tracking-[0.25em] border border-black/10 shadow-md">
              SHAKTI / WOMEN
            </span>
          </div>
        </Link>
      </section>

      <section className="w-full py-20 flex flex-col gap-10 border-b border-black/10 bg-white">
        <div className="w-full px-10 text-center">
          <h3 className="text-2xl text-black font-semibold uppercase tracking-[0.1em]">WHOLESALE READY STYLES</h3>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-32">
            <div className="w-6 h-6 border border-black/30 border-t-black animate-spin" />
          </div>
        ) : (
          <div className="product-catalogue-grid grid w-full grid-cols-1 gap-10 bg-transparent px-6 min-[600px]:grid-cols-2 md:px-10 lg:grid-cols-4">
            {products.slice(0, 4).map((product, i) => (
              <ProductCard key={product.slug} product={product} index={i} />
            ))}
          </div>
        )}

        <div className="w-full flex justify-center mt-10">
          <Link href="/shop/shakti" className="group relative inline-block overflow-hidden border border-black bg-transparent px-10 py-5 text-[13px] uppercase tracking-[0.16em] text-black lg:text-[11px] lg:tracking-[0.2em]">
            <span className="relative z-10 group-hover:text-white transition-colors duration-500 font-medium">VIEW WHOLESALE CATALOGUE</span>
            <div className="absolute inset-0 bg-black translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
          </Link>
        </div>
      </section>
    </>
  );
}
