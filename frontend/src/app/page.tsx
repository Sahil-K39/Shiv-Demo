"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";
import { getAllProducts } from "@/lib/productData";
import { MIN_WHOLESALE_QUANTITY } from "@/lib/wholesale";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "shiva" | "shakti">("all");

  useEffect(() => {
    getAllProducts()
      .then((data) => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filteredProducts = products.filter((p) => {
    if (activeTab === "all") return true;
    return p.category.toLowerCase() === activeTab;
  });

  return (
    <div className="w-full bg-white text-black min-h-screen">
      {/* Section 1: Demobaza Widescreen Editorial Split Hero */}
      <section className="w-full max-w-[1780px] mx-auto px-4 sm:px-8 py-8 lg:py-12 border-b border-black/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Demobaza Vertical Category Menu & Wholesale Specs */}
          <div className="lg:col-span-3 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-black/10 pb-8 lg:pb-0 lg:pr-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-black">
                  CATEGORIES
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#e11d48] bg-[#e11d48]/10 px-2 py-0.5">
                  SS26 LIVE
                </span>
              </div>

              {/* Signature Demobaza Vertical Menu */}
              <div className="flex flex-col gap-3 text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-gray-800">
                <Link href="/shop/shakti" className="hover:text-black hover:translate-x-1.5 transition-all text-[#e11d48]">
                  *NEW STUFF
                </Link>
                <Link href="/shop/shakti" className="hover:text-black hover:translate-x-1.5 transition-all">
                  WHOLESALE BUYING
                </Link>
                <Link href="/shop/shiva" className="hover:text-black hover:translate-x-1.5 transition-all">
                  SHIVA / MEN
                </Link>
                <Link href="/shop/shakti" className="hover:text-black hover:translate-x-1.5 transition-all">
                  SHAKTI / WOMEN
                </Link>
                <Link href="/shop/shakti" className="hover:text-black hover:translate-x-1.5 transition-all text-gray-400">
                  ARMOR / CEREMONIAL
                </Link>
                <Link href="/shop/shiva" className="hover:text-black hover:translate-x-1.5 transition-all text-gray-400">
                  DECONSTRUCTED
                </Link>
                <Link href="/shop/shakti" className="hover:text-black hover:translate-x-1.5 transition-all text-gray-400">
                  KNITS / HEAVY
                </Link>
                <Link href="/shop/shiva" className="hover:text-black hover:translate-x-1.5 transition-all text-gray-400">
                  KNITS / LIGHT
                </Link>
                <Link href="/shop/shakti" className="hover:text-black hover:translate-x-1.5 transition-all text-gray-400">
                  ROBES & COATS
                </Link>
              </div>
            </div>

            {/* Wholesale Info Block */}
            <div className="mt-8 pt-6 border-t border-black/10 text-[11px] leading-relaxed uppercase tracking-[0.12em] text-gray-600 space-y-2">
              <p className="font-bold text-black">WHOLESALE BUYING ROOM</p>
              <p>MOQ {MIN_WHOLESALE_QUANTITY} UNITS PER STYLE across selected sizes & colorways.</p>
              <p>Global expedited shipping for studio & boutique partners.</p>
              <div className="pt-2">
                <Link
                  href="/shop/shakti"
                  className="inline-block bg-black text-white px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors w-full text-center"
                >
                  ENTER BUYING ROOM &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Center / Right Column: Massive Widescreen Campaign Banner */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            <Link href="/shop/shakti" className="block group overflow-hidden bg-neutral-50 relative aspect-[16/9] sm:aspect-[21/9] w-full">
              <Image
                src="/final-products/go22/go22-01.webp"
                alt="Shiv Shakti SS26 Campaign"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 75vw"
                className="object-cover object-center transition-transform duration-[2000ms] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </Link>

            {/* Clean Editorial Typography (No cheap drop shadows or glowing text) */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2 border-b border-black/10 pb-6">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#e11d48] block mb-1">
                  SS26 CAMPAIGN LAUNCH
                </span>
                <h2 className="text-[24px] sm:text-[34px] md:text-[42px] font-light uppercase tracking-[0.14em] text-black leading-tight">
                  THE COUNCIL OF LIGHT
                </h2>
                <p className="text-[13px] sm:text-[14px] uppercase tracking-[0.08em] text-gray-600 mt-1 max-w-2xl">
                  Deconstructed silhouettes, raw organic textures, and elevated frequency wearable forms.
                </p>
              </div>
              <Link
                href="/shop/shakti"
                className="shrink-0 text-[11px] font-bold uppercase tracking-[0.2em] text-black border-b-2 border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-all"
              >
                EXPLORE COLLECTION &rarr;
              </Link>
            </div>

            {/* Quick Promo Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-black pt-2">
              <div className="border border-black/10 p-4 text-center bg-white hover:border-black transition-colors">
                <span className="block text-gray-400 text-[9px] tracking-[0.2em] mb-1">COLLECTION</span>
                SS26 WHOLESALE OPEN
              </div>
              <div className="border border-black/10 p-4 text-center bg-white hover:border-black transition-colors">
                <span className="block text-gray-400 text-[9px] tracking-[0.2em] mb-1">MINIMUM ORDER</span>
                MOQ {MIN_WHOLESALE_QUANTITY} UNITS / STYLE
              </div>
              <div className="border border-black/10 p-4 text-center bg-white hover:border-black transition-colors">
                <span className="block text-gray-400 text-[9px] tracking-[0.2em] mb-1">DISPATCH</span>
                GLOBAL EXPRESS DELIVERY
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Section 2: Minimalist Marquee Bar */}
      <div className="w-full py-4 bg-black text-white overflow-hidden border-b border-black select-none">
        <div className="whitespace-nowrap px-4 text-[12px] sm:text-[14px] font-medium uppercase tracking-[0.25em] animate-marquee">
          SS26 WHOLESALE BUYING WINDOW OPEN &nbsp;&bull;&nbsp; MOQ {MIN_WHOLESALE_QUANTITY} UNITS PER STYLE &nbsp;&bull;&nbsp; BOUTIQUE & STUDIO ENQUIRIES WELCOME &nbsp;&bull;&nbsp; RITUAL ARMOR & DECONSTRUCTED SILHOUETTES &nbsp;&bull;&nbsp; SS26 WHOLESALE BUYING WINDOW OPEN &nbsp;&bull;&nbsp; MOQ {MIN_WHOLESALE_QUANTITY} UNITS PER STYLE
        </div>
      </div>

      {/* Section 3: Wholesale Showroom Grid (Demobaza Floating White Cards) */}
      <section className="w-full max-w-[1780px] mx-auto px-4 sm:px-8 py-16 sm:py-24 border-b border-black/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-2">
              DIRECT FROM SHOWROOM
            </p>
            <h3 className="text-[28px] sm:text-[38px] font-light uppercase tracking-[0.16em] text-black">
              FEATURED STYLES
            </h3>
          </div>

          {/* Collection Filter Tabs */}
          <div className="flex items-center gap-2 border border-black/10 p-1 bg-white text-[11px] font-bold uppercase tracking-[0.15em]">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 transition-colors ${activeTab === "all" ? "bg-black text-white" : "text-gray-600 hover:text-black"}`}
            >
              ALL ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("shiva")}
              className={`px-4 py-2 transition-colors ${activeTab === "shiva" ? "bg-black text-white" : "text-gray-600 hover:text-black"}`}
            >
              SHIVA / MEN
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("shakti")}
              className={`px-4 py-2 transition-colors ${activeTab === "shakti" ? "bg-black text-white" : "text-gray-600 hover:text-black"}`}
            >
              SHAKTI / WOMEN
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-32">
            <div className="w-8 h-8 border border-black/20 border-t-black animate-spin" />
          </div>
        ) : (
          <div className="product-catalogue-grid grid w-full grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 sm:gap-y-16">
            {filteredProducts.slice(0, 12).map((product, i) => (
              <ProductCard key={product.slug} product={product} index={i} />
            ))}
          </div>
        )}

        <div className="w-full flex justify-center mt-16">
          <Link
            href="/shop/shakti"
            className="group relative inline-block overflow-hidden border border-black bg-black text-white px-12 py-5 text-[12px] font-bold uppercase tracking-[0.22em] transition-all hover:bg-white hover:text-black"
          >
            VIEW ENTIRE WHOLESALE CATALOGUE &rarr;
          </Link>
        </div>
      </section>

      {/* Section 4: Split Campaign Portals (Clean Editorial Style, Zero Boxy Overlays) */}
      <section className="w-full max-w-[1780px] mx-auto px-4 sm:px-8 py-16 sm:py-24 border-b border-black/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
          
          {/* Shiva Portal */}
          <div className="flex flex-col group">
            <Link href="/shop/shiva" className="block relative aspect-[3/4] w-full overflow-hidden bg-neutral-50 mb-6">
              <Image
                src="/final-products/go44/go44-01.webp"
                alt="Shiva Men Collection"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-top transition-transform duration-[1500ms] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </Link>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e11d48]">
                SS26 MENSWEAR
              </span>
              <Link href="/shop/shiva">
                <h4 className="text-[20px] sm:text-[26px] font-bold uppercase tracking-[0.16em] text-black group-hover:underline underline-offset-4">
                  SHIVA / MEN — DECONSTRUCTED ARMOR
                </h4>
              </Link>
              <p className="text-[13px] text-gray-600 tracking-[0.04em] mt-1">
                Explore ceremonial coats, deconstructed knitwear, and modular silhouettes designed for movement.
              </p>
              <div className="pt-3">
                <Link
                  href="/shop/shiva"
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-black border-b border-black pb-0.5 hover:text-gray-600 transition-all"
                >
                  EXPLORE SHIVA COLLECTION &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Shakti Portal */}
          <div className="flex flex-col group">
            <Link href="/shop/shakti" className="block relative aspect-[3/4] w-full overflow-hidden bg-neutral-50 mb-6">
              <Image
                src="/final-products/go01/go01-01.webp"
                alt="Shakti Women Collection"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-top transition-transform duration-[1500ms] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </Link>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d946ef]">
                SS26 WOMENSWEAR
              </span>
              <Link href="/shop/shakti">
                <h4 className="text-[20px] sm:text-[26px] font-bold uppercase tracking-[0.16em] text-black group-hover:underline underline-offset-4">
                  SHAKTI / WOMEN — SILHOUETTES OF LIGHT
                </h4>
              </Link>
              <p className="text-[13px] text-gray-600 tracking-[0.04em] mt-1">
                Fluid draping, high-frequency organic cottons, and architectural layering for the modern consciousness.
              </p>
              <div className="pt-3">
                <Link
                  href="/shop/shakti"
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-black border-b border-black pb-0.5 hover:text-gray-600 transition-all"
                >
                  EXPLORE SHAKTI COLLECTION &rarr;
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
