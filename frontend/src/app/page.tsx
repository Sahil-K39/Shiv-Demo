"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { productsAPI } from "@/lib/api";
import type { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productsAPI
      .listAll()
      .then((data) => {
        setProducts(data.products);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 300]);

  return (
    <>
      {}
      <section className="relative flex h-[calc(100svh-80px)] min-h-[620px] w-full items-end overflow-hidden border-b border-black p-6 md:p-10">
        <motion.div 
          className="absolute inset-0 w-full h-[120%] -top-[10%]"
          style={{ y: heroY }}
        >
          <Image
            src="/assets/images/lookbook-vision-2.jpg" 
            alt="Shiv Shakti SS26 editorial look" 
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>

        {}
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-start gap-10 pb-16">
          <motion.h1
            initial={{ opacity: 0, filter: "blur(10px)", y: 28 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl break-words text-[44px] font-light uppercase leading-[0.92] text-white mix-blend-difference sm:text-[64px] md:text-[96px] xl:text-[112px]"
          >
            SS26 / THE COUNCIL OF LIGHT
          </motion.h1>

          <Link href="/shop/shakti">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="relative overflow-hidden group inline-block border border-white text-white bg-transparent backdrop-blur-sm px-10 py-5 text-[11px] tracking-[0.2em] uppercase transition-colors duration-500"
            >
              <span className="relative z-10 group-hover:text-black transition-colors duration-500">
                Explore Collection
              </span>
              <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
            </motion.div>
          </Link>
        </div>
      </section>

      {}
      <div className="w-full h-[120px] bg-black flex items-center overflow-hidden border-b border-black select-none">
        <div className="whitespace-nowrap px-4 text-[54px] uppercase animate-marquee md:text-[80px]" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.5)", color: "transparent" }}>
          FREE WORLDWIDE SHIPPING ON ALL ORDERS OVER $500. / SS26 NEW ARRIVALS. / SHAKTI AND SHIVA EDITIONS. / FREE WORLDWIDE SHIPPING ON ALL ORDERS OVER $500. / SS26 NEW ARRIVALS.
        </div>
      </div>

      {}
      <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-black mt-[1px] border-b border-black">
        {}
        <Link href="/shop/shakti" className="relative aspect-[3/4] bg-white group block overflow-hidden">
          <div className="relative h-full w-full">
            <Image
              src="/assets/images/lookbook-shakti-1.jpg" 
              alt="Shakti" 
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover grayscale transition-all duration-[1500ms] ease-out group-hover:scale-110 group-hover:grayscale-0"
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h2 className="text-[50px] md:text-[70px] text-white uppercase tracking-[0.2em] mix-blend-difference drop-shadow-2xl font-light">SHAKTI</h2>
          </div>
        </Link>
        {}
        <Link href="/shop/shiva" className="relative aspect-[3/4] bg-white group block overflow-hidden">
          <div className="relative h-full w-full">
            <Image
              src="/assets/images/deconstructed-blazer.jpg" 
              alt="Shiva" 
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover grayscale transition-all duration-[1500ms] ease-out group-hover:scale-110 group-hover:grayscale-0"
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h2 className="text-[50px] md:text-[70px] text-white uppercase tracking-[0.2em] mix-blend-difference drop-shadow-2xl font-light">SHIVA</h2>
          </div>
        </Link>
      </section>

      {}
      <section className="w-full py-20 flex flex-col gap-10 border-b border-black">
        <div className="w-full px-10 text-center">
          <h3 className="text-2xl text-black uppercase tracking-[0.1em]">NEW ARRIVALS</h3>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-32">
            <div className="w-6 h-6 border border-black/30 border-t-black animate-spin" />
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 gap-8 bg-white px-6 sm:grid-cols-2 md:px-10 lg:grid-cols-4">
            {products.slice(0, 4).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}

        <div className="w-full flex justify-center mt-10">
          <Link href="/shop/shakti" className="relative overflow-hidden group inline-block border border-black text-black px-10 py-5 text-[11px] tracking-[0.2em] uppercase bg-white">
            <span className="relative z-10 group-hover:text-white transition-colors duration-500">VIEW ALL NEW</span>
            <div className="absolute inset-0 bg-black translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
          </Link>
        </div>
      </section>
    </>
  );
}
