import { productsAPI } from "@/lib/api";
import type { Product } from "@/types";

const groupedProductRows = [
  {
    name: "Ivory Ruin Dress",
    category: "shakti",
    price: 1216.06,
    images: [
      "1-153A0953.jpg",
      "2-153A0956.jpg",
      "3-153A0960.jpg",
      "4-153A0965.jpg",
      "5-153A0979.jpg",
      "6-153A0981.jpg",
    ],
  },
  {
    name: "Ivory Backless Kaftan",
    category: "shakti",
    price: 908.49,
    images: ["15-153A1040.jpg", "16-153A1042.jpg", "17-153A1043.jpg", "18-153A1044.jpg"],
  },
  {
    name: "Saffron Pleated Dress",
    category: "shakti",
    price: 2068.23,
    images: [
      "19-153A1072.jpg",
      "20-153A1078.jpg",
      "21-153A1081.jpg",
      "22-153A1083.jpg",
      "23-153A1086.jpg",
      "24-153A1089.jpg",
    ],
  },
  {
    name: "Tribal Print Slip Dress",
    category: "shakti",
    price: 885.64,
    images: ["25-153A1093.jpg", "26-153A1094.jpg", "27-153A1095.jpg"],
  },
  {
    name: "Ivory Panel Dress",
    category: "shakti",
    price: 930.28,
    images: ["28-153A1128.jpg", "29-153A1130.jpg", "30-153A1137.jpg", "31-153A1139.jpg"],
  },
  {
    name: "Grey Poncho Dress",
    category: "shakti",
    price: 836.11,
    images: [
      "82-153A0139.jpg",
      "83-153A0159.jpg",
      "84-153A0163.jpg",
      "85-153A0164.jpg",
      "86-153A0165.jpg",
    ],
  },
  {
    name: "Ivory Flow Dress",
    category: "shakti",
    price: 1408.38,
    images: [
      "87-153A0173.jpg",
      "88-153A0176.jpg",
      "89-153A0179.jpg",
      "90-153A0180.jpg",
      "91-153A0181.jpg",
    ],
  },
  {
    name: "White Long Overlay",
    category: "shakti",
    price: 1212.14,
    images: ["92-153A0185.jpg", "93-153A0191.jpg", "94-153A0192.jpg"],
  },
  {
    name: "Stone Kimono Overlay",
    category: "shakti",
    price: 1000.59,
    images: [
      "95-153A0198.jpg",
      "96-153A0200.jpg",
      "97-153A0201.jpg",
      "98-153A0204.jpg",
      "99-153A0217.jpg",
      "100-153A0218.jpg",
      "101-153A0219.jpg",
      "102-153A0220.jpg",
    ],
  },
  {
    name: "Night Print Slip Dress",
    category: "shakti",
    price: 917.47,
    images: ["103-153A0223.jpg", "104-153A0225.jpg", "105-153A0227.jpg"],
  },
  {
    name: "Taupe Backless Dress",
    category: "shakti",
    price: 1323.6,
    images: [
      "106-153A0247.jpg",
      "107-153A0248.jpg",
      "108-153A0255.jpg",
      "109-153A0262.jpg",
      "110-153A0263.jpg",
    ],
  },
  {
    name: "Rust Hooded Coat",
    category: "shakti",
    price: 1710.32,
    images: ["111-153A0276.jpg", "112-153A0280.jpg", "113-153A0282.jpg", "114-153A0284.jpg"],
  },
  {
    name: "Ivory Hooded Wrap Coat",
    category: "shakti",
    price: 1569.08,
    images: ["116-153A0306.jpg", "117-153A0315.jpg", "118-153A0319.jpg", "119-153A0325.jpg"],
  },
  {
    name: "Sand Drape Dress",
    category: "shakti",
    price: 1427.26,
    images: [
      "120-153A0334.jpg",
      "121-153A0335.jpg",
      "122-153A0338.jpg",
      "123-153A0339.jpg",
      "124-153A0346.jpg",
      "125-153A0351.jpg",
    ],
  },
  {
    name: "Black Drape Dress",
    category: "shiva",
    price: 904.96,
    images: ["32-153A9973.jpg", "33-153A9976.jpg", "34-153A9986.jpg", "35-153A9988.jpg"],
  },
  {
    name: "Black Sheer Skirt Set",
    category: "shiva",
    price: 601.08,
    images: ["36-153A9990.jpg", "37-153A9994.jpg", "38-153A9996.jpg", "39-153A9999.jpg", "40-153A0003.jpg"],
  },
  {
    name: "Black Gold Mini Dress",
    category: "shiva",
    price: 1010.94,
    images: ["41-153A0011.jpg", "42-153A0014.jpg", "43-153A0017.jpg", "44-153A0021.jpg", "45-153A0024.jpg"],
  },
  {
    name: "Black Hooded Robe",
    category: "shiva",
    price: 567.66,
    images: ["46-153A0030.jpg", "47-153A0032.jpg", "48-153A0033.jpg", "49-153A0037.jpg", "50-153A0039.jpg"],
  },
  {
    name: "Silver Hooded Vest",
    category: "shiva",
    price: 1354.31,
    images: ["51-153A0043.jpg", "52-153A0046.jpg", "53-153A0049.jpg"],
  },
  {
    name: "Black Line Dress",
    category: "shiva",
    price: 1199.52,
    images: [
      "54-153A0053.jpg",
      "55-153A0055.jpg",
      "56-153A0058.jpg",
      "57-153A0061.jpg",
      "58-153A0062.jpg",
      "59-153A0064.jpg",
      "60-153A0067.jpg",
      "61-153A0068.jpg",
    ],
  },
  {
    name: "Charcoal Sheer Kimono",
    category: "shiva",
    price: 897.63,
    images: ["62-153A0070.jpg", "63-153A0073.jpg", "64-153A0079.jpg", "65-153A0081.jpg", "66-153A0083.jpg"],
  },
  {
    name: "Black Studded Skirt Set",
    category: "shiva",
    price: 640.47,
    images: ["67-153A0084.jpg", "68-153A0085.jpg", "69-153A0094.jpg"],
  },
  {
    name: "Black Lace Skirt Set",
    category: "shiva",
    price: 654.71,
    images: [
      "70-153A0097.jpg",
      "71-153A0098.jpg",
      "72-153A0099.jpg",
      "73-153A0101.jpg",
      "74-153A0105.jpg",
      "80-153A0127.jpg",
      "81-153A0128.jpg",
    ],
  },
  {
    name: "Brown Wrap Skirt Set",
    category: "shiva",
    price: 785.27,
    images: ["75-153A0113.jpg", "76-153A0115.jpg", "77-153A0118.jpg", "78-153A0119.jpg", "79-153A0120.jpg"],
  },
] as const;

function productSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const fallbackProducts: Product[] = groupedProductRows.map(
  (product, index) => {
    const id = index + 1;
    const featured = id <= 4;

    return {
      id,
      name: product.name,
      slug: productSlug(product.name),
      description: "Studio photographed wholesale style with matching front, back, and detail views.",
      price: product.price,
      sale_price: 0,
      is_on_sale: false,
      currency: "USD",
      category: product.category,
      collection: "SS26",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Void Black"],
      images: product.images.map((image) => `/assets/images/${image}`),
      in_stock: true,
      featured,
      quantity: 24,
      sku: `SS26-${product.category.toUpperCase()}-${String(id).padStart(3, "0")}`,
      is_featured: featured,
      is_active: true,
      sale_active: false,
      sale_start_date: null,
      sale_end_date: null,
      created_at: "2026-05-12T11:37:41Z",
      updated_at: "2026-05-12T11:37:41Z",
    };
  }
);

export async function getAllProducts() {
  try {
    const data = await productsAPI.listAll();
    return data.products.length > 0 ? data.products : fallbackProducts;
  } catch {
    return fallbackProducts;
  }
}
