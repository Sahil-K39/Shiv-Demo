import type { Product } from "@/types";
import { getRandomProductImage } from "@/lib/siteImageProvider";

const productImageAliases: Record<string, string[]> = {};

const categoryFallbacks: Record<string, string[]> = {
  shakti: [
    "/final-products/go01/go01-01.webp",
    "/final-products/go02/go02-01.webp",
  ],
  shiva: [
    "/final-products/go15/go15-01.webp",
    "/final-products/go16/go16-01.webp",
  ],
};

const swatches: Record<string, string> = {
  ash: "#d8d8d2",
  charcoal: "#2d2d2d",
  "desert storm": "#8d8376",
  obsidian: "#090909",
  stone: "#8f8b82",
  "void black": "#050505",
};

export function parseList(value: string[] | string | null | undefined): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return value ? [value] : [];
  }
}

export function getProductImages(product: Product): string[] {
  // Use the product's own images if available
  const parsed = parseList(product.images);
  if (parsed.length) {
    return parsed;
  }
  // Use explicit image aliases for known products as fallback
  const aliasImages = productImageAliases[product.slug];
  if (Array.isArray(aliasImages) && aliasImages.length) {
    return aliasImages;
  }
  // Fallback to category images when product has none
  return categoryFallbacks[product.category?.toLowerCase()] ?? [
    getRandomProductImage(),
  ];
}

export function getCartItemImage(images: string[] | string | null | undefined) {
  return parseList(images)[0] || getRandomProductImage();
}

export function getCategoryFallbackImage(category: string | null | undefined) {
  return (
    categoryFallbacks[category?.toLowerCase() ?? ""]?.[0] ||
    getRandomProductImage()
  );
}

export function getColorSwatch(color: string) {
  return swatches[color.toLowerCase()] ?? "#777";
}
