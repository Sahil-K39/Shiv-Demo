const finalProductFallbackImages = [
  "/final-products/go01/go01-01.png",
  "/final-products/go02/go02-01.png",
  "/final-products/go03/go03-01.png",
  "/final-products/go04/go04-01.png",
  "/final-products/go05/go05-01.png",
];

export function getRandomProductImage(): string {
  const randomIndex = Math.floor(Math.random() * finalProductFallbackImages.length);
  return finalProductFallbackImages[randomIndex];
}
