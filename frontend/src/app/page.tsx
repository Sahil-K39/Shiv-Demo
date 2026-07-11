"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";
import { getAllProducts } from "@/lib/productData";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
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
                  {t("home.categories")}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#e11d48] bg-[#e11d48]/10 px-2 py-0.5">
                  {t("home.ss26Live")}
                </span>
              </div>

              {/* Signature Demobaza Vertical Menu */}
              <div className="flex flex-col gap-3 text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-gray-800">
                <Link href="/shop/shakti" className="hover:text-black hover:translate-x-1.5 transition-all text-[#e11d48]">
                  {t("home.newStuff")}
                </Link>
                <Link href="/shop/shakti" className="hover:text-black hover:translate-x-1.5 transition-all">
                  {t("home.wholesaleBuying")}
                </Link>
                <Link href="/shop/shiva" className="hover:text-black hover:translate-x-1.5 transition-all">
                  {t("home.shivaMen")}
                </Link>
                <Link href="/shop/shakti" className="hover:text-black hover:translate-x-1.5 transition-all">
                  {t("home.shaktiWomen")}
                </Link>
                <Link href="/shop/shakti" className="hover:text-black hover:translate-x-1.5 transition-all text-gray-400">
                  {t("home.armorCeremonial")}
                </Link>
                <Link href="/shop/shiva" className="hover:text-black hover:translate-x-1.5 transition-all text-gray-400">
                  {t("home.deconstructed")}
                </Link>
                <Link href="/shop/shakti" className="hover:text-black hover:translate-x-1.5 transition-all text-gray-400">
                  {t("home.knitsHeavy")}
                </Link>
                <Link href="/shop/shiva" className="hover:text-black hover:translate-x-1.5 transition-all text-gray-400">
                  {t("home.knitsLight")}
                </Link>
                <Link href="/shop/shakti" className="hover:text-black hover:translate-x-1.5 transition-all text-gray-400">
                  {t("home.robesCoats")}
                </Link>
              </div>
            </div>

            {/* Wholesale Info Block */}
            <div className="mt-8 pt-6 border-t border-black/10 text-[11px] leading-relaxed uppercase tracking-[0.12em] text-gray-600 space-y-2">
              <p className="font-bold text-black">{t("home.wholesaleBuyingRoom")}</p>
              <p>{t("home.moqDescription")}</p>
              <p>{t("home.globalShipping")}</p>
              <div className="pt-2">
                <Link
                  href="/shop/shakti"
                  className="inline-block bg-black text-white px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors w-full text-center"
                >
                  {t("home.enterBuyingRoom")} &rarr;
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

            {/* Clean Editorial Typography */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2 border-b border-black/10 pb-6">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#e11d48] block mb-1">
                  {t("hero.subtitle")}
                </span>
                <h2 className="text-[24px] sm:text-[34px] md:text-[42px] font-light uppercase tracking-[0.14em] text-black leading-tight">
                  {t("hero.title")}
                </h2>
                <p className="text-[13px] sm:text-[14px] uppercase tracking-[0.08em] text-gray-600 mt-1 max-w-2xl">
                  {t("hero.description")}
                </p>
              </div>
              <Link
                href="/shop/shakti"
                className="shrink-0 text-[11px] font-bold uppercase tracking-[0.2em] text-black border-b-2 border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-all"
              >
                {t("hero.cta")} &rarr;
              </Link>
            </div>

            {/* Quick Promo Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-black pt-2">
              <div className="border border-black/10 p-4 text-center bg-white hover:border-black transition-colors">
                <span className="block text-gray-400 text-[9px] tracking-[0.2em] mb-1">{t("home.collection")}</span>
                {t("home.ss26WholesaleOpen")}
              </div>
              <div className="border border-black/10 p-4 text-center bg-white hover:border-black transition-colors">
                <span className="block text-gray-400 text-[9px] tracking-[0.2em] mb-1">{t("home.minimumOrder")}</span>
                {t("home.moqUnits")}
              </div>
              <div className="border border-black/10 p-4 text-center bg-white hover:border-black transition-colors">
                <span className="block text-gray-400 text-[9px] tracking-[0.2em] mb-1">{t("home.dispatch")}</span>
                {t("home.globalExpress")}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Section 2: Minimalist Marquee Bar */}
      <div className="w-full py-4 bg-black text-white overflow-hidden border-b border-black select-none">
        <div className="whitespace-nowrap px-4 text-[12px] sm:text-[14px] font-medium uppercase tracking-[0.25em] animate-marquee">
          {t("home.marquee")} &nbsp;&bull;&nbsp; {t("home.moqUnits")} &nbsp;&bull;&nbsp; {t("home.marquee")} &nbsp;&bull;&nbsp; {t("home.moqUnits")}
        </div>
      </div>

      {/* Section 3: Wholesale Showroom Grid */}
      <section className="w-full max-w-[1780px] mx-auto px-4 sm:px-8 py-16 sm:py-24 border-b border-black/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-2">
              {t("home.directFromShowroom")}
            </p>
            <h3 className="text-[28px] sm:text-[38px] font-light uppercase tracking-[0.16em] text-black">
              {t("home.featuredStyles")}
            </h3>
          </div>

          {/* Collection Filter Tabs */}
          <div className="flex items-center gap-2 border border-black/10 p-1 bg-white text-[11px] font-bold uppercase tracking-[0.15em]">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 transition-colors ${activeTab === "all" ? "bg-black text-white" : "text-gray-600 hover:text-black"}`}
            >
              {t("home.all")} ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("shiva")}
              className={`px-4 py-2 transition-colors ${activeTab === "shiva" ? "bg-black text-white" : "text-gray-600 hover:text-black"}`}
            >
              {t("home.shivaMen")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("shakti")}
              className={`px-4 py-2 transition-colors ${activeTab === "shakti" ? "bg-black text-white" : "text-gray-600 hover:text-black"}`}
            >
              {t("home.shaktiWomen")}
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
            {t("home.viewCatalogue")} &rarr;
          </Link>
        </div>
      </section>

      {/* Section 4: Split Campaign Portals */}
      <section className="w-full max-w-[1780px] mx-auto px-4 sm:px-8 py-16 sm:py-24 border-b border-black/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
          
          {/* Shiva Portal */}
          <div className="flex flex-col group">
            <Link href="/shop/shiva" className="block relative aspect-[3/4] w-full overflow-hidden bg-white mb-6">
              <Image
                src="/final-products/go44/go44-01.webp"
                alt="Shiva Men Collection"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain object-center transition-transform duration-[1500ms] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </Link>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e11d48]">
                {t("home.ss26Menswear")}
              </span>
              <Link href="/shop/shiva">
                <h4 className="text-[20px] sm:text-[26px] font-bold uppercase tracking-[0.16em] text-black group-hover:underline underline-offset-4">
                  {t("home.shivaDeconstructed")}
                </h4>
              </Link>
              <p className="text-[13px] text-gray-600 tracking-[0.04em] mt-1">
                {t("home.shivaDesc")}
              </p>
              <div className="pt-3">
                <Link
                  href="/shop/shiva"
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-black border-b border-black pb-0.5 hover:text-gray-600 transition-all"
                >
                  {t("home.exploreShiva")} &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Shakti Portal */}
          <div className="flex flex-col group">
            <Link href="/shop/shakti" className="block relative aspect-[3/4] w-full overflow-hidden bg-white mb-6">
              <Image
                src="/final-products/go01/go01-01.webp"
                alt="Shakti Women Collection"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain object-center transition-transform duration-[1500ms] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </Link>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d946ef]">
                {t("home.ss26Womenswear")}
              </span>
              <Link href="/shop/shakti">
                <h4 className="text-[20px] sm:text-[26px] font-bold uppercase tracking-[0.16em] text-black group-hover:underline underline-offset-4">
                  {t("home.shaktiSilhouettes")}
                </h4>
              </Link>
              <p className="text-[13px] text-gray-600 tracking-[0.04em] mt-1">
                {t("home.shaktiDesc")}
              </p>
              <div className="pt-3">
                <Link
                  href="/shop/shakti"
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-black border-b border-black pb-0.5 hover:text-gray-600 transition-all"
                >
                  {t("home.exploreShakti")} &rarr;
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
