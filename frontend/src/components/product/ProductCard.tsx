

"use client";

import { useRef, useState } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import type { Product } from "@/types";
import {
  getCategoryFallbackImage,
  getProductImages,
  parseList,
} from "@/lib/productMedia";

interface ProductCardProps {
  product: Product;
  index: number;
}

const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function ProductCard({ product, index }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });
  const [isHovered, setIsHovered] = useState(false);

  const images = getProductImages(product);
  const sizes = parseList(product.sizes);
  const fallbackImage = getCategoryFallbackImage(product.category);

  
  useGSAP(() => {
    const card = cardRef.current;
    if (!card) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      gsap.to(card, {
        rotateX,
        rotateY,
        transformPerspective: 1000,
        duration: 0.4,
        ease: "power2.out",
      });

      
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          x: ((x - centerX) / centerX) * 10,
          y: ((y - centerY) / centerY) * 10,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
      });
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.5)",
        });
      }
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, { scope: cardRef });

  
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: index * 0.1, 
        ease: smoothEase,
      },
    },
  };

  const imageVariants: Variants = {
    hidden: { scale: 1.2, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1.2,
        delay: index * 0.1 + 0.2,
        ease: smoothEase,
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
        ease: smoothEase,
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
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative mb-4 aspect-[3/4] overflow-hidden border border-black/10 bg-white">
          <motion.div
            ref={imageRef}
            variants={imageVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="absolute inset-0"
          >
            <motion.img
              src={images[0] || "/placeholder.jpg"}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(event) => {
                event.currentTarget.src = fallbackImage;
              }}
              animate={{
                scale: isHovered ? 1.08 : 1,
              }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </motion.div>

          {images[1] && (
            <motion.img
              src={images[1]}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100"
              aria-hidden="true"
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
              <span className="text-[9px] tracking-[0.3em] uppercase px-3 py-1.5 bg-white text-black font-medium">
                FEATURED
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
                  className="border border-white/40 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.15em] text-white transition-colors duration-200"
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

        <div className="space-y-2 px-1 pb-1">
          <motion.p
            custom={0}
            variants={textVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="text-[10px] tracking-[0.3em] uppercase text-stone"
          >
            {product.category} / {product.collection}
          </motion.p>

          <motion.h3
            custom={1}
            variants={textVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="text-[15px] tracking-[0.08em] uppercase text-bone font-light leading-snug"
          >
            {product.name}
          </motion.h3>

          <motion.div
            custom={2}
            variants={textVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="flex items-center gap-3"
          >
            <span className="text-[14px] tracking-[0.1em] text-bone/70 font-light">
              ${product.price.toLocaleString()}
            </span>
            {!product.in_stock && (
              <span className="text-[9px] tracking-[0.2em] uppercase text-accent-ember/70 border border-accent-ember/30 px-2 py-0.5">
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
