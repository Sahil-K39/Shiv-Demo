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
  const [heroSlide, setHeroSlide] = useState(0);

  const heroImages = [
    "/final-products/go21/go21-02.webp",
    "/final-products/go05/go05-03.webp",
    "/final-products/go44/go44-01.webp",
  ];

  useEffect(() => {
    getAllProducts()
      .then((data) => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const filteredProducts = products.filter((p) => {
    if (activeTab === "all") return true;
    return p.category.toLowerCase() === activeTab;
  });

  return (
    <div className="w-full bg-white text-black min-h-screen">
      {/* 1. Psylo-Style Top Announcement Banner */}
      <div className="w-full bg-[#f1f2ef] text-neutral-800 py-2 sm:py-2.5 px-3 sm:px-4 flex items-center justify-between text-[10px] sm:text-[12px] font-medium tracking-[0.14em] sm:tracking-[0.16em] uppercase border-b border-black/10 select-none">
        <button
          type="button"
          onClick={() => setHeroSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
          className="p-1 hover:opacity-60 transition-opacity flex items-center justify-center min-h-[28px] min-w-[28px]"
          aria-label="Previous announcement"
        >
          &larr;
        </button>
        <div className="mx-auto flex items-center gap-1.5 sm:gap-2 text-center overflow-hidden whitespace-nowrap text-ellipsis px-2">
          <span className="font-bold text-black shrink-0">{t("home.ss26Live")}</span>
          <span className="hidden sm:inline">&bull; {t("home.globalExpress")}</span>
          <span className="hidden lg:inline">&bull; {t("home.moqUnits")}</span>
          <Link
            href="/shop/shakti"
            className="underline underline-offset-4 hover:text-black font-bold ml-1 sm:ml-2 text-[#e11d48] shrink-0"
          >
            {t("home.enterBuyingRoom")} &rarr;
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setHeroSlide((prev) => (prev + 1) % heroImages.length)}
          className="p-1 hover:opacity-60 transition-opacity flex items-center justify-center min-h-[28px] min-w-[28px]"
          aria-label="Next announcement"
        >
          &rarr;
        </button>
      </div>

      {/* 2. Psylo-Style Widescreen Full-Bleed Cinematic Hero Banner */}
      <section className="relative w-full h-[74vh] min-h-[500px] sm:h-[82vh] sm:min-h-[620px] max-h-[960px] overflow-hidden bg-neutral-950 select-none">
        {/* Background Slide Carousel */}
        {heroImages.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === heroSlide ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"
            } transition-transform duration-[8000ms]`}
          >
            <Image
              src={src}
              alt={`Shiv Shakti SS26 Campaign ${index + 1}`}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-center opacity-85"
            />
            {/* Cinematic Gradients for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/60" />
          </div>
        ))}

        {/* Center Overlay Typography (Psylo Aesthetic) */}
        <div className="relative z-20 flex h-full flex-col items-center justify-center px-4 text-center text-white pb-6 sm:pb-0">
          <span className="mb-2 sm:mb-3 inline-block bg-white/10 px-3.5 py-1 sm:px-4 sm:py-1.5 text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-white backdrop-blur-md border border-white/20">
            {t("hero.subtitle")} &bull; SS26
          </span>
          
          <h1 className="max-w-4xl font-serif text-[30px] sm:text-[50px] md:text-[64px] lg:text-[72px] font-light uppercase tracking-[0.14em] sm:tracking-[0.16em] leading-[1.12] sm:leading-tight">
            {t("hero.title")}
          </h1>

          <p className="mt-2.5 sm:mt-3 max-w-2xl text-[11px] sm:text-[15px] font-normal uppercase tracking-[0.1em] sm:tracking-[0.12em] text-neutral-200 leading-relaxed px-2">
            {t("hero.description")} &bull; {t("home.wholesaleBuyingRoom")}
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto max-w-xs sm:max-w-none px-4 sm:px-0">
            <Link
              href="/shop/shakti"
              className="group relative inline-flex items-center justify-center bg-white min-h-[46px] sm:min-h-[50px] px-8 sm:px-10 py-3.5 sm:py-4 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.22em] sm:tracking-[0.25em] text-black shadow-2xl transition-all hover:bg-black hover:text-white border border-white text-center"
            >
              <span>{t("hero.cta")}</span>
              <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1.5">&rarr;</span>
            </Link>
            <Link
              href="/shop/shiva"
              className="inline-flex items-center justify-center bg-black/70 min-h-[46px] sm:min-h-[50px] px-6 sm:px-8 py-3.5 sm:py-4 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.22em] sm:tracking-[0.25em] text-white backdrop-blur-md border border-white/30 transition-all hover:bg-white hover:text-black text-center"
            >
              <span>{t("home.shivaMen")}</span>
            </Link>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setHeroSlide(idx)}
              className={`h-1 sm:h-1.5 transition-all duration-300 rounded-full ${
                idx === heroSlide ? "w-6 sm:w-8 bg-white" : "w-1.5 sm:w-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Floating Bottom Badges (Rewards Club & Concierge) */}
        <div className="absolute bottom-3.5 left-3 sm:bottom-6 sm:left-6 z-30 flex">
          <Link
            href="/council"
            className="flex items-center gap-1.5 sm:gap-2.5 rounded-full bg-black/90 px-3.5 py-1.5 sm:px-5 sm:py-2.5 text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.14em] sm:tracking-[0.18em] text-white shadow-2xl backdrop-blur-md border border-white/15 transition-transform hover:scale-105"
          >
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#e11d48] animate-pulse" />
            <span>Council Club</span>
          </Link>
        </div>

        <div className="absolute bottom-3.5 right-3 sm:bottom-6 sm:right-6 z-30 flex">
          <Link
            href="/contact"
            className="flex items-center gap-1.5 sm:gap-2.5 rounded-full bg-black/90 px-3.5 py-1.5 sm:px-5 sm:py-2.5 text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.14em] sm:tracking-[0.18em] text-white shadow-2xl backdrop-blur-md border border-white/15 transition-transform hover:scale-105"
          >
            <span>Concierge</span>
            <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </Link>
        </div>
      </section>

      {/* 3. Psylo-Style Category Discovery Strip */}
      <section className="w-full max-w-[1780px] mx-auto px-3 sm:px-8 py-10 sm:py-16 border-b border-black/10">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-6 sm:mb-8 gap-3 sm:gap-4 px-1">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e11d48] block mb-1">
              {t("home.categories")}
            </span>
            <h2 className="text-[22px] sm:text-[32px] font-light uppercase tracking-[0.14em] sm:tracking-[0.15em] text-black">
              Discover By Sanctuary
            </h2>
          </div>
          <Link
            href="/shop/shakti"
            className="text-[11px] font-bold uppercase tracking-[0.18em] sm:tracking-[0.2em] text-black border-b border-black pb-0.5 hover:text-gray-600 transition-all"
          >
            View Complete Archive &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <Link href="/shop/shakti" className="group block relative overflow-hidden aspect-[4/5] bg-neutral-100 border border-black/5">
            <Image
              src="/final-products/go01/go01-01.webp"
              alt="New Arrivals"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
              className="object-cover object-top transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 text-white">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.22em] text-[#e11d48] block mb-0.5 sm:mb-1">
                {t("home.newStuff")}
              </span>
              <h3 className="text-[15px] sm:text-[20px] font-serif uppercase tracking-[0.12em] sm:tracking-[0.16em] group-hover:translate-x-1.5 transition-transform">
                New Arrivals
              </h3>
            </div>
          </Link>

          <Link href="/shop/shakti" className="group block relative overflow-hidden aspect-[4/5] bg-neutral-100 border border-black/5">
            <Image
              src="/final-products/go06/go06-01.webp"
              alt="Shakti Women"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
              className="object-cover object-top transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 text-white">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.22em] text-[#d946ef] block mb-0.5 sm:mb-1">
                {t("home.shaktiWomen")}
              </span>
              <h3 className="text-[15px] sm:text-[20px] font-serif uppercase tracking-[0.12em] sm:tracking-[0.16em] group-hover:translate-x-1.5 transition-transform">
                Shakti Silhouettes
              </h3>
            </div>
          </Link>

          <Link href="/shop/shiva" className="group block relative overflow-hidden aspect-[4/5] bg-neutral-100 border border-black/5">
            <Image
              src="/final-products/go44/go44-01.webp"
              alt="Shiva Men"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
              className="object-cover object-top transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 text-white">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.22em] text-[#e11d48] block mb-0.5 sm:mb-1">
                {t("home.shivaMen")}
              </span>
              <h3 className="text-[15px] sm:text-[20px] font-serif uppercase tracking-[0.12em] sm:tracking-[0.16em] group-hover:translate-x-1.5 transition-transform">
                Shiva Avant-Garde
              </h3>
            </div>
          </Link>

          <Link href="/council" className="group block relative overflow-hidden aspect-[4/5] bg-neutral-100 border border-black/5">
            <Image
              src="/final-products/go22/go22-01.webp"
              alt="The Council"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
              className="object-cover object-top transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 text-white">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.22em] text-gray-300 block mb-0.5 sm:mb-1">
                {t("home.armorCeremonial")}
              </span>
              <h3 className="text-[15px] sm:text-[20px] font-serif uppercase tracking-[0.12em] sm:tracking-[0.16em] group-hover:translate-x-1.5 transition-transform">
                The Council Club
              </h3>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. Minimalist Marquee Bar */}
      <div className="w-full py-3.5 sm:py-4 bg-black text-white overflow-hidden border-b border-black select-none">
        <div className="whitespace-nowrap px-4 text-[11px] sm:text-[13px] font-medium uppercase tracking-[0.22em] sm:tracking-[0.28em] animate-marquee">
          {t("home.marquee")} &nbsp;&bull;&nbsp; {t("home.moqUnits")} &nbsp;&bull;&nbsp; {t("home.globalExpress")} &nbsp;&bull;&nbsp; {t("home.marquee")} &nbsp;&bull;&nbsp; {t("home.moqUnits")}
        </div>
      </div>

      {/* 5. Wholesale Showroom Featured Grid */}
      <section className="w-full max-w-[1780px] mx-auto px-3 sm:px-8 py-12 sm:py-24 border-b border-black/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5 sm:gap-6 mb-8 sm:mb-12 px-1">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-1 sm:mb-2">
              {t("home.directFromShowroom")}
            </p>
            <h3 className="text-[24px] sm:text-[38px] font-light uppercase tracking-[0.14em] sm:tracking-[0.16em] text-black">
              {t("home.featuredStyles")}
            </h3>
          </div>

          {/* Collection Filter Tabs — Full Width Grid on Mobile for easy thumb tap */}
          <div className="w-full sm:w-auto grid grid-cols-3 sm:flex items-center gap-1 border border-black/15 p-1 bg-[#f8f8f6] text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.15em]">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`min-h-[42px] sm:min-h-0 px-3 sm:px-5 py-2 sm:py-2.5 transition-all text-center ${activeTab === "all" ? "bg-black text-white shadow-md" : "text-gray-600 hover:text-black"}`}
            >
              {t("home.all")} ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("shiva")}
              className={`min-h-[42px] sm:min-h-0 px-3 sm:px-5 py-2 sm:py-2.5 transition-all text-center ${activeTab === "shiva" ? "bg-black text-white shadow-md" : "text-gray-600 hover:text-black"}`}
            >
              {t("home.shivaMen")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("shakti")}
              className={`min-h-[42px] sm:min-h-0 px-3 sm:px-5 py-2 sm:py-2.5 transition-all text-center ${activeTab === "shakti" ? "bg-black text-white shadow-md" : "text-gray-600 hover:text-black"}`}
            >
              {t("home.shaktiWomen")}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24 sm:py-32">
            <div className="w-8 h-8 border border-black/20 border-t-black animate-spin rounded-full" />
          </div>
        ) : (
          <div className="product-catalogue-grid grid w-full grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 sm:gap-x-6 sm:gap-y-16">
            {filteredProducts.slice(0, 12).map((product, i) => (
              <ProductCard key={product.slug} product={product} index={i} />
            ))}
          </div>
        )}

        <div className="w-full flex justify-center mt-12 sm:mt-16">
          <Link
            href="/shop/shakti"
            className="group relative inline-flex items-center justify-center border border-black bg-black text-white min-h-[48px] px-10 sm:px-12 py-4 sm:py-5 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.22em] transition-all hover:bg-white hover:text-black shadow-lg w-full sm:w-auto max-w-xs sm:max-w-none text-center"
          >
            {t("home.viewCatalogue")} &rarr;
          </Link>
        </div>
      </section>

      {/* 6. Split Lookbook Portals (`Shiva` & `Shakti`) */}
      <section className="w-full max-w-[1780px] mx-auto px-3 sm:px-8 py-12 sm:py-24 border-b border-black/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
          {/* Shiva Portal */}
          <div className="flex flex-col group">
            <Link href="/shop/shiva" className="block relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 mb-4 sm:mb-6 border border-black/5">
              <Image
                src="/final-products/go44/go44-01.webp"
                alt="Shiva Men Collection"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-[1500ms] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </Link>
            <div className="flex flex-col gap-1 px-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e11d48]">
                {t("home.ss26Menswear")}
              </span>
              <Link href="/shop/shiva">
                <h4 className="text-[20px] sm:text-[28px] font-serif uppercase tracking-[0.14em] sm:tracking-[0.16em] text-black group-hover:underline underline-offset-4">
                  {t("home.shivaDeconstructed")}
                </h4>
              </Link>
              <p className="text-[12px] sm:text-[13px] text-gray-600 tracking-[0.04em] mt-1 leading-relaxed">
                {t("home.shivaDesc")}
              </p>
              <div className="pt-2 sm:pt-3">
                <Link
                  href="/shop/shiva"
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-black border-b border-black pb-0.5 hover:text-gray-600 transition-all min-h-[36px] flex items-center"
                >
                  {t("home.exploreShiva")} &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Shakti Portal */}
          <div className="flex flex-col group">
            <Link href="/shop/shakti" className="block relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 mb-4 sm:mb-6 border border-black/5">
              <Image
                src="/final-products/go01/go01-01.webp"
                alt="Shakti Women Collection"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-[1500ms] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </Link>
            <div className="flex flex-col gap-1 px-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d946ef]">
                {t("home.ss26Womenswear")}
              </span>
              <Link href="/shop/shakti">
                <h4 className="text-[20px] sm:text-[28px] font-serif uppercase tracking-[0.14em] sm:tracking-[0.16em] text-black group-hover:underline underline-offset-4">
                  {t("home.shaktiSilhouettes")}
                </h4>
              </Link>
              <p className="text-[12px] sm:text-[13px] text-gray-600 tracking-[0.04em] mt-1 leading-relaxed">
                {t("home.shaktiDesc")}
              </p>
              <div className="pt-2 sm:pt-3">
                <Link
                  href="/shop/shakti"
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-black border-b border-black pb-0.5 hover:text-gray-600 transition-all min-h-[36px] flex items-center"
                >
                  {t("home.exploreShakti")} &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bottom Wholesale Assurance Bar */}
      <section className="w-full max-w-[1780px] mx-auto px-3 sm:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.14em] sm:tracking-[0.16em] text-black">
          <div className="border border-black/15 p-5 sm:p-6 text-center bg-[#fbfaf8] hover:border-black transition-colors shadow-sm">
            <span className="block text-[#e11d48] text-[10px] tracking-[0.2em] mb-1.5 sm:mb-2 font-bold">{t("home.collection")}</span>
            <p className="text-[13px] sm:text-[14px] font-bold">{t("home.ss26WholesaleOpen")}</p>
            <span className="block text-gray-500 text-[10px] sm:text-[11px] font-normal mt-1">{t("home.wholesaleBuyingRoom")}</span>
          </div>
          <div className="border border-black/15 p-5 sm:p-6 text-center bg-[#fbfaf8] hover:border-black transition-colors shadow-sm">
            <span className="block text-[#e11d48] text-[10px] tracking-[0.2em] mb-1.5 sm:mb-2 font-bold">{t("home.minimumOrder")}</span>
            <p className="text-[13px] sm:text-[14px] font-bold">{t("home.moqUnits")}</p>
            <span className="block text-gray-500 text-[10px] sm:text-[11px] font-normal mt-1">{t("home.moqDescription")}</span>
          </div>
          <div className="border border-black/15 p-5 sm:p-6 text-center bg-[#fbfaf8] hover:border-black transition-colors shadow-sm">
            <span className="block text-[#e11d48] text-[10px] tracking-[0.2em] mb-1.5 sm:mb-2 font-bold">{t("home.dispatch")}</span>
            <p className="text-[13px] sm:text-[14px] font-bold">{t("home.globalExpress")}</p>
            <span className="block text-gray-500 text-[10px] sm:text-[11px] font-normal mt-1">{t("home.globalShipping")}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
