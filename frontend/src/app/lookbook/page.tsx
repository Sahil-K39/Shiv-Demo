"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const campaigns = [
  {
    id: "arise",
    title: "SHIV SHAKTI: ARISE IN THE DESERT",
    subtitle: "A reflection on awakening, emergence, and the clarity of vast landscapes.",
    image: "/final-products/go22/go22-01.webp",
    link: "/shop/shakti",
    colSpan: "lg:col-span-12", // Full width hero banner
    aspect: "aspect-[16/9] sm:aspect-[21/9]",
  },
  {
    id: "beyond-space",
    title: "MOVES BEYOND SPACE WITH SS26",
    subtitle: "The SS26 collection THE COUNCIL OF LIGHT reflects an exploration of balance, guardianship, and conscious evolution.",
    image: "/final-products/go01/go01-01.webp",
    link: "/shop/shakti",
    colSpan: "lg:col-span-6",
    aspect: "aspect-[4/3]",
  },
  {
    id: "kinetics",
    title: "KINETICS — BETWEEN WORLDS MAKING OFF",
    subtitle: "Intensity reveals what is essential — a force shaped through movement across raw landscapes and constructed space.",
    image: "/final-products/go44/go44-01.webp",
    link: "/shop/shiva",
    colSpan: "lg:col-span-6",
    aspect: "aspect-[4/3]",
  },
  {
    id: "ceremonial",
    title: "THE COUNCIL OF LIGHT — RITUAL ARMOR",
    subtitle: "Deconstructed silhouettes, natural materials, and restrained tones translate light and awareness into wearable form.",
    image: "/final-products/go48/go48-01.webp",
    link: "/shop/shiva",
    colSpan: "lg:col-span-4",
    aspect: "aspect-[3/4]",
  },
  {
    id: "silhouettes",
    title: "STRUCTURE & FLOW: THE NEO-PRIMITIVE",
    subtitle: "Exploring the garment as a vessel of transformation where form follows intention.",
    image: "/final-products/go49/go49-01.webp",
    link: "/shop/shakti",
    colSpan: "lg:col-span-4",
    aspect: "aspect-[3/4]",
  },
  {
    id: "monochrome",
    title: "ELEVATION & EXPANSION",
    subtitle: "Layered silhouettes and refined textures create a sense of balance designed for your next evolution.",
    image: "/final-products/go35/go35-01.webp",
    link: "/shop/shiva",
    colSpan: "lg:col-span-4",
    aspect: "aspect-[3/4]",
  },
];

export default function LookbookPage() {
  return (
    <div className="w-full bg-white text-black min-h-screen pb-24">
      {/* Editorial Header */}
      <div className="w-full border-b border-black/10 py-16 sm:py-20 text-center px-6">
        <p className="mb-4 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.22em] text-gray-500">
          SS26 CAMPAIGN & EDITORIAL JOURNAL
        </p>
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[36px] sm:text-[48px] md:text-[60px] font-light uppercase tracking-[0.16em] text-black"
        >
          LOOKBOOK
        </motion.h1>
        <p className="mx-auto mt-4 max-w-2xl text-[14px] sm:text-[16px] uppercase leading-relaxed tracking-[0.1em] text-gray-700 font-normal">
          Visual stories, collection manifestos, and field documentation from the Shiv Shakti SS26 buying room.
        </p>
      </div>

      {/* Campaign Stories Grid */}
      <div className="max-w-[1780px] mx-auto px-6 sm:px-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {campaigns.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: (index % 3) * 0.1 }}
              className={`flex flex-col group ${story.colSpan}`}
            >
              <Link href={story.link} className="block overflow-hidden bg-neutral-50 mb-6">
                <div className={`relative w-full ${story.aspect} overflow-hidden`}>
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 80vw"
                    className="object-cover object-top transition-transform duration-[1500ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                </div>
              </Link>
              
              <div className="flex flex-col gap-2 max-w-2xl">
                <Link href={story.link}>
                  <h2 className="text-[16px] sm:text-[18px] font-bold uppercase tracking-[0.16em] text-black group-hover:underline underline-offset-4 decoration-black/40">
                    {story.title}
                  </h2>
                </Link>
                <p className="text-[13px] sm:text-[14px] leading-relaxed text-gray-700 font-normal tracking-[0.03em]">
                  {story.subtitle}
                </p>
                <div className="pt-2">
                  <Link
                    href={story.link}
                    className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-black border-b border-black pb-0.5 hover:text-gray-600 hover:border-gray-600 transition-all"
                  >
                    EXPLORE PIECES &rarr;
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
