

"use client";

import { useState, useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import ImageLightbox from "@/components/ImageLightbox";
// Product details will be shown on a dedicated page
import { useRouter } from 'next/navigation';
// Removed unused GSAP imports for cleaner build
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import {
  getCategoryFallbackImage,
  getProductImages,
  parseList,
} from "@/lib/productMedia";
import { formatPriceINR } from "@/lib/pricing";
import { MIN_WHOLESALE_QUANTITY } from "@/lib/wholesale";

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  // Removed modal state; navigation will handle description

  const router = useRouter();
  const images = getProductImages(product);
  const sizes = parseList(product.sizes);
  const fallbackImage = getCategoryFallbackImage(product.category);
  const hoverImage = images.length > 1 ? images[1] : null; // use second image if available

  
  // Removed heavy GSAP tilt for smoother performance. Hover scaling is handled via CSS.

  
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: index * 0.1,
        ease: "easeInOut",
      },
    },
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1 + 0.4 + i * 0.1,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="group relative cursor-pointer"
      style={{ transformStyle: "preserve-3d" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative mb-4 aspect-square overflow-hidden border border-black/10 bg-[#f4f1ec]"
        onClick={() => router.push(`/product/${product.slug}`)}
      >
        <Image
            src={images[0]}
            alt={product.name}
            width={500}
            height={667}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={index < 4}
            className="h-full w-full cursor-pointer object-cover object-top transition-transform duration-700 ease-out"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = fallbackImage;
            }}
            style={{
              transform: `scale(${isHovered ? 1.04 : 1})`,
            }}
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
          />

        {hoverImage && (
          <Image
            src={hoverImage}
            alt=""
            width={500}
            height={667}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-top opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100"
            aria-hidden={true}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        )}

        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />

        {product.featured && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-white px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-black lg:text-[9px] lg:tracking-[0.3em]">
              WHOLESALE READY
            </span>
          </div>
        )}

        <motion.div
          ref={overlayRef}
          className="absolute bottom-0 left-0 right-0 p-4 z-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{
            y: isHovered ? 0 : 20,
            opacity: isHovered ? 1 : 0,
          }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <span
                key={size}
                className="border border-white/40 px-2.5 py-1.5 text-[12px] uppercase tracking-[0.12em] text-white transition-colors duration-200 lg:text-[10px] lg:tracking-[0.15em]"
              >
                {size}
              </span>
            ))}
          </div>
        </motion.div>

        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 3px)",
          }}
        />
      </div>

      {lightboxOpen && (
        <ImageLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          imageSrc={images[0]}
          imageAlt={product.name}
        />
      )}
      {/* Details are now on a separate page via navigation */}

      <Link href={`/product/${product.slug}`} className="block">
        <div className="space-y-2 px-1 pb-1">
          <motion.p
            custom={0}
            variants={textVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="text-[13px] uppercase tracking-[0.2em] text-stone lg:text-[10px] lg:tracking-[0.3em]"
          >
            {product.category} / {product.collection}
          </motion.p>

          <motion.h3
            custom={1}
            variants={textVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="text-[18px] font-light uppercase leading-snug tracking-[0.06em] text-bone lg:text-[15px] lg:tracking-[0.08em]"
          >
            {product.name}
          </motion.h3>

          <motion.div
            custom={2}
            variants={textVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="flex flex-wrap items-center gap-3"
          >
            <span className="text-[16px] font-light tracking-[0.08em] text-bone/70 lg:text-[14px] lg:tracking-[0.1em]">
              {formatPriceINR(product.price)} wholesale unit
            </span>
            <span className="border border-bone/15 px-2 py-0.5 text-[11px] uppercase tracking-[0.14em] text-bone/55 lg:text-[9px] lg:tracking-[0.2em] lg:text-bone/45">
              MOQ {MIN_WHOLESALE_QUANTITY}
            </span>
            {!product.in_stock && (
              <span className="border border-accent-ember/30 px-2 py-0.5 text-[11px] uppercase tracking-[0.14em] text-accent-ember/70 lg:text-[9px] lg:tracking-[0.2em]">
                SOLD OUT
              </span>
            )}
          </motion.div>

          <motion.div
            className="h-[1px] bg-bone/20 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </Link>
    </motion.div>
  );
}
