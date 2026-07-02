"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";
import {
  ArrowRightIcon,
  CheckIcon,
  MinusIcon,
  PlusIcon,
} from "@/components/ui/Icons";
import {
  getCategoryFallbackImage,
  getColorSwatch,
  getProductImages,
  parseList,
} from "@/lib/productMedia";
import { getAllProducts } from "@/lib/productData";
import { formatPriceINR } from "@/lib/pricing";
import { MIN_WHOLESALE_QUANTITY, WHOLESALE_PACK_SIZES } from "@/lib/wholesale";

export default function ProductDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem, openCart, user } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loadedSlug, setLoadedSlug] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(MIN_WHOLESALE_QUANTITY);
  const [addNotice, setAddNotice] = useState("");

  useEffect(() => {
    let isCurrent = true;

    getAllProducts().then((data) => {
      if (!isCurrent) return;

      const found = data.find((p) => p.slug === slug);
      if (found) {
        setProduct(found);

        const sizes = parseList(found.sizes);
        const colors = parseList(found.colors);

        setSelectedSize(sizes[0] ?? "");
        setSelectedColor(colors[0] ?? "");
        setCurrentImageIdx(0);
        setQuantity(MIN_WHOLESALE_QUANTITY);
        setAddNotice("");
      } else {
        setProduct(null);
      }
      setLoadedSlug(slug);
    });

    return () => {
      isCurrent = false;
    };
  }, [slug]);

  const isLoading = loadedSlug !== slug;

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-6 h-6 border border-black/30 border-t-black animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <h1 className="text-[24px] tracking-[0.2em] font-light uppercase text-stone">
          GARMENT NOT FOUND
        </h1>
      </div>
    );
  }

  const images = getProductImages(product);
  const sizes = parseList(product.sizes);
  const colors = parseList(product.colors);
  const fallbackImage = getCategoryFallbackImage(product.category);

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) return;

    if (!user) {
      setAddNotice("Log in or create an identity before adding wholesale enquiry items.");
      openCart();
      return;
    }

    setAddNotice("");
    setIsAdding(true);
    try {
      await addItem(product.id, selectedSize, selectedColor, quantity);
      setAddNotice("Added to wholesale enquiry.");
    } catch (error) {
      setAddNotice(error instanceof Error ? error.message : "Could not add this item.");
    } finally {
      setIsAdding(false);
    }
  };

  const wholesaleSubtotal = product.price * quantity;
  const categoryHref = `/shop/${product.category?.toLowerCase() || "shakti"}`;

  return (
    <main className="min-h-screen bg-white text-black px-4 pb-28 pt-6 sm:px-6 md:px-10 md:pb-24 md:pt-10 xl:px-14">
      <div className="mx-auto grid w-full max-w-[1680px] gap-12 lg:grid-cols-[minmax(0,1.18fr)_minmax(400px,0.82fr)] lg:gap-14 xl:gap-20">
        <motion.section
          aria-label={`${product.name} product gallery`}
          className="min-w-0"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Desktop vertical image gallery (Demobaza style) */}
          <div className="hidden lg:flex flex-col gap-6 w-full">
            {images.map((img, idx) => (
              <div
                key={`${img}-${idx}`}
                className="relative aspect-[3/4] w-full overflow-hidden bg-white"
              >
                <Image
                  src={img}
                  alt={`${product.name} — View ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  sizes="60vw"
                  className="object-contain object-center"
                  onError={(event) => {
                    event.currentTarget.src = fallbackImage;
                  }}
                />
              </div>
            ))}
          </div>

          {/* Mobile & Tablet image gallery with thumbnails */}
          <div className="grid min-w-0 gap-3 md:grid-cols-[76px_minmax(0,1fr)] lg:hidden">
            {images.length > 1 && (
              <div className="order-2 flex min-w-0 gap-3 overflow-x-auto pb-1 md:order-1 md:flex-col md:overflow-visible md:pb-0">
                {images.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setCurrentImageIdx(idx)}
                    aria-label={`View image ${idx + 1} of ${images.length}`}
                    aria-pressed={idx === currentImageIdx}
                    className={`relative aspect-[3/4] w-[72px] shrink-0 overflow-hidden bg-white transition-colors md:w-full ${
                      idx === currentImageIdx
                        ? "border border-black"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="(max-width: 767px) 72px, 88px"
                      className="object-contain object-center"
                    />
                  </button>
                ))}
              </div>
            )}

            <div
              className={`relative order-1 aspect-[3/4] overflow-hidden bg-white md:order-2 md:min-h-[580px] ${
                images.length === 1 ? "md:col-span-2" : ""
              }`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIdx}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <Image
                    src={images[currentImageIdx] || images[0]}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 1023px) 100vw, 58vw"
                    className="object-contain object-center"
                    onError={(event) => {
                      event.currentTarget.src = fallbackImage;
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              <div className="absolute left-4 top-4 bg-white/90 border border-black/20 px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] text-black font-medium">
                Wholesale
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-[9px] uppercase tracking-[0.2em] text-black/70 font-medium">
                <span>{product.collection || "SS26"}</span>
                <span>
                  {String(currentImageIdx + 1).padStart(2, "0")} /{" "}
                  {String(images.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="min-w-0 lg:sticky lg:top-28 lg:self-start lg:py-2 xl:py-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-10"
          >
          <header>
            <Link
              href={categoryHref}
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-gray-600 transition-colors hover:text-black font-medium"
            >
              <span>{product.category} collection</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>

            <p className="mt-10 text-[10px] uppercase tracking-[0.28em] text-gray-500 font-medium">
              {product.collection || "SS26"} / wholesale look
            </p>
            <h1 className="mt-4 max-w-[720px] text-[38px] font-light uppercase leading-[1.02] tracking-[0.025em] text-black md:text-[48px] xl:text-[56px]">
              {product.name}
            </h1>

            <div className="mt-8 flex flex-wrap items-end justify-between gap-5 border-y border-black/10 py-5">
              <div>
                <p className="text-[9px] uppercase tracking-[0.22em] text-gray-500 font-medium">
                  Wholesale unit
                </p>
                <p className="mt-1 text-[24px] font-light tracking-[0.06em] text-black md:text-[28px]">
                  {formatPriceINR(product.price)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-[0.22em] text-gray-500 font-medium">
                  Minimum order
                </p>
                <p className="mt-2 text-[12px] uppercase tracking-[0.16em] text-black font-medium">
                  {MIN_WHOLESALE_QUANTITY} units per style
                </p>
              </div>
            </div>
          </header>

          <p className="max-w-[680px] text-[16px] leading-[1.9] tracking-[0.02em] text-gray-600 md:text-[17px]">
            {product.description}
          </p>

          <div className="space-y-8 border-t border-black/10 pt-8">
            {colors.length > 0 && (
              <fieldset className="space-y-4">
                <legend className="text-[10px] uppercase tracking-[0.22em] text-gray-600 font-medium">
                  Colour / <span className="text-black font-semibold">{selectedColor}</span>
                </legend>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      aria-pressed={selectedColor === color}
                      className={`flex h-11 items-center gap-2.5 border px-3 text-[10px] uppercase tracking-[0.14em] transition-colors ${
                        selectedColor === color
                          ? "border-black bg-black text-white font-semibold"
                          : "border-black/20 text-gray-600 hover:border-black hover:text-black"
                      }`}
                      aria-label={`Select ${color}`}
                    >
                      <span
                        className="h-4 w-4 border border-black/20"
                        style={{ backgroundColor: getColorSwatch(color) }}
                      />
                      <span>{color}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {sizes.length > 0 && (
              <fieldset className="space-y-4">
                <legend className="text-[10px] uppercase tracking-[0.22em] text-gray-600 font-medium">
                  Stretch-fit size
                </legend>
                <p className="text-[9px] uppercase tracking-[0.16em] text-gray-400 font-medium">
                  Two flexible size bands
                </p>
                <div className="grid max-w-[420px] grid-cols-2 gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize === size}
                      className={`flex h-14 items-center justify-center border px-4 text-[12px] uppercase tracking-[0.14em] transition-colors ${
                        selectedSize === size
                          ? "border-black bg-black text-white font-semibold"
                          : "border-black/20 text-gray-600 hover:border-black hover:text-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
          </div>

          <div className="space-y-5 bg-neutral-50 border border-black/10 p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-gray-600 font-medium">
                  Wholesale quantity
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-black font-semibold">
                  Build your enquiry pack
                </p>
              </div>
              <div className="flex items-center border border-black/20 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(MIN_WHOLESALE_QUANTITY, value - 1))}
                  className="flex h-12 w-12 items-center justify-center text-gray-600 transition-colors hover:bg-black hover:text-white"
                  aria-label="Decrease wholesale quantity"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="w-16 text-center text-[14px] tracking-[0.12em] text-black font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.min(500, value + 1))}
                  className="flex h-12 w-12 items-center justify-center text-gray-600 transition-colors hover:bg-black hover:text-white"
                  aria-label="Increase wholesale quantity"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {WHOLESALE_PACK_SIZES.map((packSize) => (
                <button
                  key={packSize}
                  type="button"
                  onClick={() => setQuantity(packSize)}
                  className={`h-11 border text-[10px] uppercase tracking-[0.16em] transition-colors ${
                    quantity === packSize
                      ? "border-black bg-black text-white font-semibold"
                      : "border-black/20 bg-white text-gray-600 hover:border-black hover:text-black"
                  }`}
                  aria-label={`Set wholesale quantity to ${packSize}`}
                  aria-pressed={quantity === packSize}
                >
                  {packSize}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-black/10 pt-5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-medium">
                Estimated line total
              </span>
              <span className="text-[20px] font-light tracking-[0.06em] text-black">
                {formatPriceINR(wholesaleSubtotal)}
              </span>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.in_stock || isAdding}
            whileTap={{ scale: product.in_stock ? 0.99 : 1 }}
            className={`group flex min-h-16 w-full items-center justify-center gap-4 border px-5 text-[11px] uppercase tracking-[0.2em] transition-colors ${
              product.in_stock
                ? "border-black bg-black text-white font-semibold hover:bg-transparent hover:text-black"
                : "cursor-not-allowed border-black/15 text-black/35"
            }`}
          >
            {isAdding ? (
              <span className="h-4 w-4 animate-spin border border-white/40 border-t-white" />
            ) : product.in_stock ? (
              <>
                <span>Add to wholesale enquiry</span>
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            ) : (
              <span>Out of stock</span>
            )}
          </motion.button>

          {addNotice && (
            <p
              role="status"
              aria-live="polite"
              className="border-l border-black/60 pl-4 text-[10px] uppercase leading-relaxed tracking-[0.14em] text-gray-600"
            >
              {addNotice}{" "}
              <Link href="/login" className="underline underline-offset-4 transition-colors hover:text-black font-medium">
                Log in
              </Link>
            </p>
          )}

          <ul className="grid gap-4 border-t border-black/10 pt-7 text-[9px] uppercase leading-relaxed tracking-[0.15em] text-gray-600 sm:grid-cols-3">
            {["WHOLESALE ENQUIRY REVIEW", "PAYMENT METHOD SHARED AFTER APPROVAL", "BULK SHIPPING QUOTED AFTER REVIEW"].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-black" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          </motion.div>
        </section>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-black/10 bg-white/95 backdrop-blur-md p-4 md:hidden">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!product.in_stock || isAdding}
          className={`flex w-full min-h-[52px] items-center justify-center gap-3 text-[11px] uppercase tracking-[0.18em] transition-colors ${
            product.in_stock
              ? "bg-black text-white font-semibold active:bg-black/85"
              : "bg-black/10 text-black/35 cursor-not-allowed"
          }`}
        >
          {isAdding ? (
            <span className="h-4 w-4 animate-spin border border-white/40 border-t-white" />
          ) : product.in_stock ? (
            <>
              <span>Add to enquiry \u2014 {formatPriceINR(product.price * quantity)}</span>
            </>
          ) : (
            <span>Out of stock</span>
          )}
        </button>
      </div>
    </main>
  );
}
