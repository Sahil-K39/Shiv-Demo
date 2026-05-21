import type { Product } from "@/types";

const productImageAliases: Record<string, string[]> = {
  "void-walker-trench": [
    "/assets/images/void-walker-trench.jpg",
    "/assets/images/lookbook-shakti-1.jpg",
  ],
  "asymmetric-drape-dress": [
    "/assets/images/asymmetric-drape-dress.jpg",
    "/assets/images/void-walker-trench.jpg",
  ],
  "tactical-survival-suit": [
    "/assets/images/tactical-survival-suit.jpg",
    "/assets/images/asymmetric-drape-dress.jpg",
  ],
  "deconstructed-blazer": [
    "/assets/images/deconstructed-blazer.jpg",
    "/assets/images/nomad-cargo-trousers.jpg",
  ],
  "nomad-cargo-trousers": [
    "/assets/images/nomad-cargo-trousers.jpg",
    "/assets/images/deconstructed-blazer.jpg",
  ],
  "ritual-wrap-coat": [
    "/assets/images/ritual-wrap-coat.jpg",
    "/assets/images/lookbook-vision-2.jpg",
  ],
};

const categoryFallbacks: Record<string, string[]> = {
  shakti: [
    "/assets/images/void-walker-trench.jpg",
    "/assets/images/asymmetric-drape-dress.jpg",
  ],
  shiva: [
    "/assets/images/deconstructed-blazer.jpg",
    "/assets/images/nomad-cargo-trousers.jpg",
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
  const aliases = productImageAliases[product.slug];
  const parsed = parseList(product.images);

  if (aliases?.length) {
    return aliases;
  }

  if (parsed.length) {
    return parsed;
  }

  return categoryFallbacks[product.category?.toLowerCase()] ?? [
    "/assets/images/ritual-wrap-coat.jpg",
  ];
}

export function getCartItemImage(images: string[] | string | null | undefined) {
  return parseList(images)[0] || "/assets/images/ritual-wrap-coat.jpg";
}

export function getCategoryFallbackImage(category: string | null | undefined) {
  return (
    categoryFallbacks[category?.toLowerCase() ?? ""]?.[0] ||
    "/assets/images/ritual-wrap-coat.jpg"
  );
}

export function getColorSwatch(color: string) {
  return swatches[color.toLowerCase()] ?? "#777";
}
