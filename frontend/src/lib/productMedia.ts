import type { Product } from "@/types";
import { getRandomProductImage } from "@/lib/siteImageProvider";

const productImageAliases: Record<string, string[]> = {
  "void-walker-trench": [
    "/assets/images/1-153A0953.jpg",
    "/assets/images/2-153A0956.jpg",
  ],
  "asymmetric-drape-dress": [
    "/assets/images/3-153A0960.jpg",
    "/assets/images/4-153A0965.jpg",
  ],
  "tactical-survival-suit": [
    "/assets/images/15-153A1040.jpg",
    "/assets/images/16-153A1042.jpg",
  ],
  "deconstructed-blazer": [
    "/assets/images/32-153A9973.jpg",
    "/assets/images/33-153A9976.jpg",
  ],
  "nomad-cargo-trousers": [
    "/assets/images/40-153A0003.jpg",
    "/assets/images/41-153A0011.jpg",
  ],
  "ritual-wrap-coat": [
    "/assets/images/20-153A1078.jpg",
    "/assets/images/21-153A1081.jpg",
  ],
  "mystic-silk-shirt": [
    "/assets/images/50-153A0039.jpg",
    "/assets/images/51-153A0043.jpg",
  ],
  "urban-utility-jacket": [
    "/assets/images/60-153A0067.jpg",
    "/assets/images/61-153A0068.jpg",
  ],
  "riverstone-denim-jeans": [
    "/assets/images/75-153A0113.jpg",
    "/assets/images/76-153A0115.jpg",
  ],
  "eclipse-leather-boots": [
    "/assets/images/85-153A0164.jpg",
    "/assets/images/86-153A0165.jpg",
  ],
};

const categoryFallbacks: Record<string, string[]> = {
  shakti: [
    "/assets/images/1-153A0953.jpg",
    "/assets/images/3-153A0960.jpg",
  ],
  shiva: [
    "/assets/images/32-153A9973.jpg",
    "/assets/images/40-153A0003.jpg",
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
