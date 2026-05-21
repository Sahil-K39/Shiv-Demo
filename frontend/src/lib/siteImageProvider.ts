import { fallbackProducts } from "@/lib/productData";

/**
 * Returns a random product image URL from the fallback product data.
 * This function is used to replace static placeholder images throughout the site.
 */
export function getRandomProductImage(): string {
  if (!fallbackProducts || fallbackProducts.length === 0) {
    // Fallback to a generic placeholder if product data is unavailable.
    return "/assets/images/placeholder.jpg";
  }
  const randomIndex = Math.floor(Math.random() * fallbackProducts.length);
  const product = fallbackProducts[randomIndex];
  // Return the first image of the selected product, or a placeholder if none.
  return product.images && product.images.length > 0
    ? product.images[0]
    : "/assets/images/placeholder.jpg";
}
