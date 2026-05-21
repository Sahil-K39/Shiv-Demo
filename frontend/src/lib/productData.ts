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
      "/assets/images/1-153A0953.jpg",
      "/assets/images/2-153A0956.jpg",
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
      "/assets/images/3-153A0960.jpg",
      "/assets/images/4-153A0965.jpg",
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
      "/assets/images/15-153A1040.jpg",
      "/assets/images/16-153A1042.jpg",
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
      "/assets/images/32-153A9973.jpg",
      "/assets/images/33-153A9976.jpg",
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
      "/assets/images/40-153A0003.jpg",
      "/assets/images/41-153A0011.jpg",
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
      "/assets/images/20-153A1078.jpg",
      "/assets/images/21-153A1081.jpg",
    ],
    in_stock: true,
    featured: true,
    created_at: "2026-05-12T11:37:41Z",
  },
  // New Product 7
  {
    id: 7,
    name: "Mystic Silk Shirt",
    slug: "mystic-silk-shirt",
    description: "Luxurious silk shirt with an ethereal sheen, perfect for layered looks.",
    price: 1120,
    currency: "USD",
    category: "shakti",
    collection: "SS26",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Silk White", "Midnight Blue"],
    images: ["/assets/images/50-153A0039.jpg", "/assets/images/51-153A0043.jpg"],
    in_stock: true,
    featured: false,
    created_at: "2026-05-12T11:37:41Z",
  },
  // New Product 8
  {
    id: 8,
    name: "Urban Utility Jacket",
    slug: "urban-utility-jacket",
    description: "Utility jacket with multiple pockets and water-resistant finish.",
    price: 1350,
    currency: "USD",
    category: "shakti",
    collection: "SS26",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Olive", "Charcoal"],
    images: ["/assets/images/60-153A0067.jpg", "/assets/images/61-153A0068.jpg"],
    in_stock: true,
    featured: true,
    created_at: "2026-05-12T11:37:41Z",
  },
  // New Product 9
  {
    id: 9,
    name: "Riverstone Denim Jeans",
    slug: "riverstone-denim-jeans",
    description: "Classic denim with a modern stretch, featuring subtle riverstone wash.",
    price: 950,
    currency: "USD",
    category: "shakti",
    collection: "SS26",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Riverstone", "Dark Indigo"],
    images: ["/assets/images/75-153A0113.jpg", "/assets/images/76-153A0115.jpg"],
    in_stock: true,
    featured: false,
    created_at: "2026-05-12T11:37:41Z",
  },
  // New Product 10
  {
    id: 10,
    name: "Eclipse Leather Boots",
    slug: "eclipse-leather-boots",
    description: "Sturdy leather boots with a sleek eclipse silhouette, perfect for all seasons.",
    price: 1580,
    currency: "USD",
    category: "shakti",
    collection: "SS26",
    sizes: ["S", "M", "L"],
    colors: ["Midnight Black"],
    images: ["/assets/images/85-153A0164.jpg", "/assets/images/86-153A0165.jpg"],
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
