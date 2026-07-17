"use client";

import { useState, useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import ImageLightbox from "@/components/ImageLightbox";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import {
  getCategoryFallbackImage,
  getProductImages,
} from "@/lib/productMedia";
import { useLanguage } from "@/context/LanguageContext";
import { translateProductText } from "@/lib/productTranslations";

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const { t, currentLanguage, formatPrice } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-80px" });
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const router = useRouter();
  const images = getProductImages(product);
  const fallbackImage = getCategoryFallbackImage(product.category);
  const hoverImage = images.length > 1 ? images[1] : null;

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="group relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container — portrait 3:4 ratio, borderless, pure white */}
      <div
        className="relative aspect-[3/4] overflow-hidden bg-white"
        onClick={() => router.push(`/product/${product.slug}`)}
      >
        <Image
          src={images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
          priority={index < 6}
          className="h-full w-full object-contain object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = fallbackImage;
          }}
          style={{
            transform: `scale(${isHovered ? 1.05 : 1})`,
          }}
          onClick={(e) => {
            if (e.altKey || e.metaKey) {
              e.stopPropagation();
              setLightboxOpen(true);
            }
          }}
        />

        {/* Hover image swap — opacity crossfade (Demobaza style) */}
        {hoverImage && (
          <Image
            src={hoverImage}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain object-center opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100"
            aria-hidden={true}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        )}

        {/* Out of stock overlay */}
        {!product.in_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-black">
              {t("product.soldOut")}
            </span>
          </div>
        )}
      </div>

      {lightboxOpen && (
        <ImageLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          imageSrc={images[0]}
          imageAlt={product.name}
        />
      )}

      {/* Product info — Demobaza video style: bold title with status badge and price below */}
      <Link href={`/product/${product.slug}`} className="block">
        <div className="mt-2.5 sm:mt-4 space-y-1 px-0.5">
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-1 sm:gap-2">
            <h3 className="text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.14em] sm:tracking-[0.18em] text-black line-clamp-1">
              {translateProductText(product.name, currentLanguage.code)}
            </h3>
            {index % 3 === 0 ? (
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.12em] text-[#e11d48]">{t("product.new")}</span>
            ) : index % 4 === 0 ? (
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.12em] text-[#d946ef]">{t("product.preorder")}</span>
            ) : null}
          </div>
          <p className="text-[11px] sm:text-[13px] font-medium sm:font-normal tracking-[0.05em] text-black/80 sm:text-black">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
