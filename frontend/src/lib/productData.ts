import { productsAPI } from "@/lib/api";
import type { Product } from "@/types";

export const fallbackProducts: Product[] = [];

const retiredProductSlugs = new Set([
  "ivory-ruin-dress",
  "ivory-backless-kaftan",
  "saffron-pleated-dress",
  "tribal-print-slip-dress",
  "ivory-panel-dress",
  "grey-poncho-dress",
  "ivory-flow-dress",
  "white-long-overlay",
  "stone-kimono-overlay",
  "night-print-slip-dress",
  "taupe-backless-dress",
  "rust-hooded-coat",
  "ivory-hooded-wrap-coat",
  "sand-drape-dress",
  "black-drape-dress",
  "black-sheer-skirt-set",
  "black-gold-mini-dress",
  "black-hooded-robe",
  "silver-hooded-vest",
  "black-line-dress",
  "charcoal-sheer-kimono",
  "black-studded-skirt-set",
  "black-lace-skirt-set",
  "brown-wrap-skirt-set",
  "void-walker-trench",
  "asymmetric-drape-dress",
  "tactical-survival-suit",
  "deconstructed-blazer",
  "nomad-cargo-trousers",
  "ritual-wrap-coat",
]);

function visibleProduct(product: Product) {
  return product.is_active !== false && !retiredProductSlugs.has(product.slug);
}

export async function getAllProducts() {
  try {
    const data = await productsAPI.listAll();
    return (data.products ?? []).filter(visibleProduct);
  } catch {
    return fallbackProducts;
  }
}
