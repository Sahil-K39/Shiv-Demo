import { productsAPI } from "@/lib/api";
import type { Product } from "@/types";

export const fallbackProducts: Product[] = [
  {
    id: 1,
    name: "Void Walker Trench",
    slug: "void-walker-trench",
    description:
      "A sculptural trench coat crafted from heavyweight waxed cotton. Asymmetric draping meets military precision in this statement piece of post-apocalyptic armor.",
    price: 1450,
    currency: "USD",
    category: "shakti",
    collection: "SS26",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Void Black", "Obsidian"],
    images: [
      "/assets/images/void-walker-trench.jpg",
      "/assets/images/lookbook-shakti-1.jpg",
    ],
    in_stock: true,
    featured: true,
    created_at: "2026-05-12T11:37:41Z",
  },
  {
    id: 2,
    name: "Asymmetric Drape Dress",
    slug: "asymmetric-drape-dress",
    description:
      "Fluid jersey construction with deliberate asymmetry. A garment that moves between worlds, ceremonial yet street-ready.",
    price: 1180,
    currency: "USD",
    category: "shakti",
    collection: "SS26",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Void Black", "Ash"],
    images: [
      "/assets/images/asymmetric-drape-dress.jpg",
      "/assets/images/tactical-survival-suit.jpg",
    ],
    in_stock: true,
    featured: true,
    created_at: "2026-05-12T11:37:41Z",
  },
  {
    id: 3,
    name: "Tactical Survival Suit",
    slug: "tactical-survival-suit",
    description:
      "Multi-pocket utility construction with reinforced panels and a silhouette built for movement through uncertain terrain.",
    price: 1650,
    currency: "USD",
    category: "shakti",
    collection: "SS26",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Void Black", "Desert Storm"],
    images: [
      "/assets/images/tactical-survival-suit.jpg",
      "/assets/images/asymmetric-drape-dress.jpg",
    ],
    in_stock: true,
    featured: false,
    created_at: "2026-05-12T11:37:41Z",
  },
  {
    id: 4,
    name: "Deconstructed Blazer",
    slug: "deconstructed-blazer",
    description:
      "Traditional tailoring torn apart and rebuilt with raw-edge seams, exposed structure, and an intentionally unfinished silhouette.",
    price: 1320,
    currency: "USD",
    category: "shiva",
    collection: "SS26",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Void Black", "Charcoal"],
    images: [
      "/assets/images/deconstructed-blazer.jpg",
      "/assets/images/nomad-cargo-trousers.jpg",
    ],
    in_stock: true,
    featured: true,
    created_at: "2026-05-12T11:37:41Z",
  },
  {
    id: 5,
    name: "Nomad Cargo Trousers",
    slug: "nomad-cargo-trousers",
    description:
      "Wide-leg cargo with articulated knee panels and adjustable ankle cuffs for long days in motion.",
    price: 890,
    currency: "USD",
    category: "shiva",
    collection: "SS26",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Void Black", "Stone"],
    images: [
      "/assets/images/nomad-cargo-trousers.jpg",
      "/assets/images/deconstructed-blazer.jpg",
    ],
    in_stock: true,
    featured: false,
    created_at: "2026-05-12T11:37:41Z",
  },
  {
    id: 6,
    name: "Ritual Wrap Coat",
    slug: "ritual-wrap-coat",
    description:
      "An oversized cocoon silhouette inspired by ceremonial robes, finished with a structured wrap closure.",
    price: 1780,
    currency: "USD",
    category: "shiva",
    collection: "SS26",
    sizes: ["S", "M", "L"],
    colors: ["Void Black"],
    images: [
      "/assets/images/ritual-wrap-coat.jpg",
      "/assets/images/lookbook-vision-2.jpg",
    ],
    in_stock: true,
    featured: true,
    created_at: "2026-05-12T11:37:41Z",
  },
];

export async function getAllProducts() {
  try {
    const data = await productsAPI.listAll();
    return data.products.length > 0 ? data.products : fallbackProducts;
  } catch {
    return fallbackProducts;
  }
}
