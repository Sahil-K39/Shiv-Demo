"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { adminAPI } from "@/lib/api";
import type { Product, ProductInput } from "@/types";
import { getColorSwatch, getProductImages, parseList } from "@/lib/productMedia";
import { MIN_WHOLESALE_QUANTITY } from "@/lib/wholesale";

const emptyForm: ProductInput = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  sale_price: 0,
  category: "shakti",
  collection: "SS26",
  sizes: `["OS"]`,
  colors: `["Default"]`,
  images: "[]",
  quantity: 0,
  sku: "",
  is_featured: false,
  is_active: true,
  sale_active: false,
  sale_start_date: null,
  sale_end_date: null,
};

const categoryOptions = [
  { value: "shakti", label: "Shakti" },
  { value: "shiva", label: "Shiva" },
  { value: "accessories", label: "Accessories" },
  { value: "rudraksha", label: "Rudraksha" },
  { value: "malas", label: "Malas" },
  { value: "wellness", label: "Wellness" },
];

const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "OS", "Custom"];

const colorOptions = [
  "Void Black",
  "Ivory",
  "White",
  "Ash",
  "Charcoal",
  "Stone",
  "Sand",
  "Taupe",
  "Brown",
  "Rust",
  "Saffron",
  "Gold",
  "Silver",
];

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function toDateInput(value: string | null | undefined) {
  if (!value) return "";
  return value.slice(0, 10);
}

function fromDateInput(value: string) {
  return value ? new Date(`${value}T00:00:00`).toISOString() : null;
}

function productQuantity(product: Product) {
  return product.quantity ?? 0;
}

function uniqueList(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function listToField(items: string[]) {
  return JSON.stringify(uniqueList(items));
}

function imageTextToField(text: string) {
  return JSON.stringify(
    text
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

function productToForm(product: Product): ProductInput {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    sale_price: product.sale_price ?? 0,
    category: product.category,
    collection: product.collection,
    sizes: typeof product.sizes === "string" ? product.sizes : JSON.stringify(product.sizes),
    colors: typeof product.colors === "string" ? product.colors : JSON.stringify(product.colors),
    images: typeof product.images === "string" ? product.images : JSON.stringify(product.images),
    quantity: product.quantity ?? 0,
    sku: product.sku ?? "",
    is_featured: product.is_featured ?? product.featured,
    is_active: product.is_active ?? true,
    sale_active: product.sale_active ?? product.is_on_sale ?? false,
    sale_start_date: product.sale_start_date ?? null,
    sale_end_date: product.sale_end_date ?? null,
  };
}

const bulkImportColumns = [
  "name",
  "description",
  "price",
  "sale_price",
  "quantity",
  "category",
  "sku",
  "images",
  "sizes",
  "colors",
  "is_featured",
  "is_active",
  "sale_active",
  "sale_start_date",
  "sale_end_date",
  "slug",
  "collection",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function csvEscape(value: string | number | boolean) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function buildTemplateCSV() {
  const rows = [
    bulkImportColumns,
    [
      "Sample Bulk Dress",
      "Wholesale product description",
      "999",
      "0",
      "120",
      "shakti",
      "BULK-SAMPLE-001",
      "/assets/images/1-153A0953.jpg|/assets/images/2-153A0956.jpg",
      "S|M|L|XL",
      "Void Black|Ivory",
      "false",
      "true",
      "false",
      "",
      "",
      "sample-bulk-dress",
      "SS26",
    ],
  ];

  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function downloadBulkTemplate() {
  const blob = new Blob([buildTemplateCSV()], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "shiv-shakti-product-import-template.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function parseCSV(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function rowsToRecords(rows: string[][]) {
  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map(normalizeHeader);
  return dataRows.map((row) =>
    headers.reduce<Record<string, string>>((record, header, index) => {
      record[header] = row[index]?.trim() ?? "";
      return record;
    }, {})
  );
}

function recordValue(record: Record<string, string>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[normalizeHeader(key)];
    if (value) return value;
  }
  return "";
}

function listField(value: string) {
  if (!value.trim()) return "[]";

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return JSON.stringify(uniqueList(parsed.map(String)));
  } catch {
    // Fall through to separator parsing.
  }

  return JSON.stringify(
    uniqueList(value.split(/\s*[|;\n]\s*/).map((item) => item.trim()))
  );
}

function booleanField(value: string, fallback = false) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return fallback;
  return ["true", "1", "yes", "y", "active", "on"].includes(normalized);
}

function dateField(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/\d{4}-\d{2}-\d{2}T/.test(trimmed)) return trimmed;
  const date = new Date(`${trimmed}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function recordToProduct(record: Record<string, string>, index: number): ProductInput {
  const name = recordValue(record, "name", "product_name", "product");
  const slug = recordValue(record, "slug") || slugify(name);
  const sku = recordValue(record, "sku") || `BULK-${slug.toUpperCase()}-${String(index + 1).padStart(3, "0")}`;
  const price = Number(recordValue(record, "price", "unit_price") || 0);
  const salePrice = Number(recordValue(record, "sale_price", "sale price") || 0);
  const quantity = Number(recordValue(record, "quantity", "stock", "units") || 0);
  const images =
    recordValue(record, "images", "image_urls", "image_url") ||
    Object.entries(record)
      .filter(([key, value]) => key.startsWith("image_") && value)
      .map(([, value]) => value)
      .join("|");

  return {
    name,
    slug,
    description: recordValue(record, "description", "product_description"),
    price: Number.isFinite(price) ? price : 0,
    sale_price: Number.isFinite(salePrice) ? salePrice : 0,
    category: recordValue(record, "category") || "shakti",
    collection: recordValue(record, "collection") || "SS26",
    sizes: listField(recordValue(record, "sizes", "size") || "OS"),
    colors: listField(recordValue(record, "colors", "color") || "Default"),
    images: listField(images),
    quantity: Number.isFinite(quantity) ? quantity : 0,
    sku,
    is_featured: booleanField(recordValue(record, "is_featured", "featured")),
    is_active: booleanField(recordValue(record, "is_active", "active"), true),
    sale_active: booleanField(recordValue(record, "sale_active", "on_sale")),
    sale_start_date: dateField(recordValue(record, "sale_start_date", "sale_start")),
    sale_end_date: dateField(recordValue(record, "sale_end_date", "sale_end")),
  };
}

function validateBulkProducts(products: ProductInput[]) {
  const errors: string[] = [];
  products.forEach((product, index) => {
    const row = index + 1;
    if (!product.name.trim()) errors.push(`Row ${row}: name is required.`);
    if (!product.slug?.trim()) errors.push(`Row ${row}: slug is required.`);
    if (!product.sku.trim()) errors.push(`Row ${row}: SKU is required.`);
    if (!product.category.trim()) errors.push(`Row ${row}: category is required.`);
    if (!Number.isFinite(product.price) || product.price <= 0) {
      errors.push(`Row ${row}: price must be greater than 0.`);
    }
    if (!Number.isInteger(product.quantity) || product.quantity < 0) {
      errors.push(`Row ${row}: quantity must be 0 or higher.`);
    }
  });
  return errors;
}

async function parseBulkImportFile(file: File) {
  const text = await file.text();
  if (file.name.toLowerCase().endsWith(".json")) {
    const parsed = JSON.parse(text) as ProductInput[] | { products?: ProductInput[] };
    return Array.isArray(parsed) ? parsed : parsed.products ?? [];
  }

  const rows = parseCSV(text);
  if (rows.length < 2) return [];
  return rowsToRecords(rows).map(recordToProduct);
}

function StatusBadge({
  tone,
  children,
}: {
  tone: "neutral" | "green" | "amber" | "red" | "black";
  children: React.ReactNode;
}) {
  const styles = {
    neutral: "border-black/10 text-black/45",
    green: "border-green-300 bg-green-50 text-green-700",
    amber: "border-amber-300 bg-amber-50 text-amber-700",
    red: "border-red-300 bg-red-50 text-red-700",
    black: "border-black bg-black text-white",
  };

  return (
    <span className={`inline-flex border px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${styles[tone]}`}>
      {children}
    </span>
  );
}

function ProductForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  isSaving,
  editingProduct,
}: {
  value: ProductInput;
  onChange: (value: ProductInput) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSaving: boolean;
  editingProduct: Product | null;
}) {
  const images = useMemo(() => parseList(value.images), [value.images]);
  const selectedSizes = useMemo(() => parseList(value.sizes), [value.sizes]);
  const selectedColors = useMemo(() => parseList(value.colors), [value.colors]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function setField<K extends keyof ProductInput>(field: K, next: ProductInput[K]) {
    onChange({ ...value, [field]: next });
  }

  function addListValue(field: "sizes" | "colors", item: string) {
    if (!item) return;
    onChange({ ...value, [field]: listToField([...parseList(value[field]), item]) });
  }

  function removeListValue(field: "sizes" | "colors", item: string) {
    onChange({
      ...value,
      [field]: listToField(parseList(value[field]).filter((current) => current !== item)),
    });
  }

  function removeImage(index: number) {
    onChange({
      ...value,
      images: JSON.stringify(images.filter((_, imageIndex) => imageIndex !== index)),
    });
  }

  async function handleFiles(files: File[] | FileList | null) {
    const selectedFiles = Array.from(files ?? []);
    if (selectedFiles.length === 0) return;

    setUploadError("");
    setIsUploadingImages(true);
    try {
      const response = await adminAPI.uploadProductImages(selectedFiles);
      const existing = parseList(value.images);
      onChange({ ...value, images: JSON.stringify([...existing, ...response.images]) });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Could not upload images");
    } finally {
      setIsUploadingImages(false);
    }
  }

  return (
    <div className="border border-black/10 bg-white">
      <div className="border-b border-black/10 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-black/45">
              {editingProduct ? "Editing" : "New Inventory"}
            </p>
            <h2 className="text-[16px] uppercase tracking-[0.14em]">
              {editingProduct ? editingProduct.name : "Add Product"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="border border-black/10 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-black/55 hover:border-black/40 hover:text-black"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="space-y-6 p-5">
        <section>
          <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-black/45">
            Identity
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-[10px] uppercase tracking-[0.16em] text-black/45">
              Product Name
              <input className="w-full border border-black/10 p-3 text-[13px] normal-case tracking-normal text-black" value={value.name} onChange={(e) => setField("name", e.target.value)} />
            </label>
            <label className="space-y-2 text-[10px] uppercase tracking-[0.16em] text-black/45">
              Slug
              <input className="w-full border border-black/10 p-3 text-[13px] normal-case tracking-normal text-black" value={value.slug || ""} onChange={(e) => setField("slug", e.target.value)} />
            </label>
            <label className="space-y-2 text-[10px] uppercase tracking-[0.16em] text-black/45">
              SKU
              <input className="w-full border border-black/10 p-3 text-[13px] normal-case tracking-normal text-black" value={value.sku} onChange={(e) => setField("sku", e.target.value)} />
            </label>
            <label className="space-y-2 text-[10px] uppercase tracking-[0.16em] text-black/45">
              Category
              <select
                className="min-h-11 w-full border border-black/10 bg-white p-3 text-[13px] uppercase tracking-[0.08em] text-black outline-none focus:border-black"
                value={value.category}
                onChange={(e) => setField("category", e.target.value)}
              >
                {categoryOptions.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-4 block space-y-2 text-[10px] uppercase tracking-[0.16em] text-black/45">
            Product Description
            <textarea rows={4} className="w-full resize-none border border-black/10 p-3 text-[13px] normal-case tracking-normal text-black" value={value.description} onChange={(e) => setField("description", e.target.value)} />
          </label>
        </section>

        <section>
          <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-black/45">
            Pricing And Stock
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-[10px] uppercase tracking-[0.16em] text-black/45">
              Price
              <input type="number" min="0" className="w-full border border-black/10 p-3 text-[13px] normal-case tracking-normal text-black" value={value.price} onChange={(e) => setField("price", Number(e.target.value))} />
            </label>
            <label className="space-y-2 text-[10px] uppercase tracking-[0.16em] text-black/45">
              Sale Price
              <input type="number" min="0" className="w-full border border-black/10 p-3 text-[13px] normal-case tracking-normal text-black" value={value.sale_price} onChange={(e) => setField("sale_price", Number(e.target.value))} />
            </label>
            <label className="space-y-2 text-[10px] uppercase tracking-[0.16em] text-black/45">
              Quantity / Stock
              <input type="number" min="0" className="w-full border border-black/10 p-3 text-[13px] normal-case tracking-normal text-black" value={value.quantity} onChange={(e) => setField("quantity", Number(e.target.value))} />
            </label>
          </div>
        </section>

        <section>
          <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-black/45">
            Sale Window
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-[10px] uppercase tracking-[0.16em] text-black/45">
              Sale Start Date
              <input type="date" className="w-full border border-black/10 p-3 text-[13px] normal-case tracking-normal text-black" value={toDateInput(value.sale_start_date)} onChange={(e) => setField("sale_start_date", fromDateInput(e.target.value))} />
            </label>
            <label className="space-y-2 text-[10px] uppercase tracking-[0.16em] text-black/45">
              Sale End Date
              <input type="date" className="w-full border border-black/10 p-3 text-[13px] normal-case tracking-normal text-black" value={toDateInput(value.sale_end_date)} onChange={(e) => setField("sale_end_date", fromDateInput(e.target.value))} />
            </label>
          </div>
        </section>

        <section>
          <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-black/45">
            Merchandising
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-[10px] uppercase tracking-[0.16em] text-black/45">
              Collection
              <input className="w-full border border-black/10 p-3 text-[13px] normal-case tracking-normal text-black" value={value.collection || ""} onChange={(e) => setField("collection", e.target.value)} />
            </label>
            <div className="space-y-2 text-[10px] uppercase tracking-[0.16em] text-black/45">
              Sizes
              <select
                className="min-h-11 w-full border border-black/10 bg-white p-3 text-[13px] uppercase tracking-[0.08em] text-black outline-none focus:border-black"
                value=""
                onChange={(event) => addListValue("sizes", event.target.value)}
              >
                <option value="" disabled>
                  Add Size
                </option>
                {sizeOptions.map((size) => (
                  <option key={size} value={size} disabled={selectedSizes.includes(size)}>
                    {size}
                  </option>
                ))}
              </select>
              <div className="flex min-h-9 flex-wrap gap-2">
                {selectedSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => removeListValue("sizes", size)}
                    className="border border-black/15 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-black/65"
                  >
                    {size} x
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 text-[10px] uppercase tracking-[0.16em] text-black/45">
              Colors
              <select
                className="min-h-11 w-full border border-black/10 bg-white p-3 text-[13px] uppercase tracking-[0.08em] text-black outline-none focus:border-black"
                value=""
                onChange={(event) => addListValue("colors", event.target.value)}
              >
                <option value="" disabled>
                  Add Color
                </option>
                {colorOptions.map((color) => (
                  <option key={color} value={color} disabled={selectedColors.includes(color)}>
                    {color}
                  </option>
                ))}
              </select>
              <div className="flex min-h-9 flex-wrap gap-2">
                {selectedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => removeListValue("colors", color)}
                    className="inline-flex items-center gap-2 border border-black/15 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-black/65"
                  >
                    <span
                      className="h-3 w-3 border border-black/15"
                      style={{ backgroundColor: getColorSwatch(color) }}
                    />
                    {color} x
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            {[
              ["is_featured", "Featured"],
              ["is_active", "Active"],
              ["sale_active", "Sale Active"],
            ].map(([field, label]) => (
              <label key={field} className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-black/60">
                <input
                  type="checkbox"
                  checked={Boolean(value[field as keyof ProductInput])}
                  onChange={(e) => setField(field as keyof ProductInput, e.target.checked as never)}
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        <section>
          <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-black/45">
            Images
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-[10px] uppercase tracking-[0.16em] text-black/45">
              Upload From Device
              <input
                type="file"
                accept="image/*"
                multiple
                className="w-full border border-black/10 p-3 text-[12px]"
                onChange={(event) => {
                  void handleFiles(Array.from(event.currentTarget.files ?? []));
                  event.currentTarget.value = "";
                }}
              />
            </label>
            <label className="space-y-2 text-[10px] uppercase tracking-[0.16em] text-black/45">
              Image URLs
              <textarea
                rows={3}
                className="w-full resize-none border border-black/10 p-3 text-[12px] normal-case tracking-normal text-black"
                value={images.join("\n")}
                onChange={(e) => setField("images", imageTextToField(e.target.value))}
              />
            </label>
          </div>
          {isUploadingImages && (
            <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-black/45">
              Uploading images...
            </p>
          )}
          {uploadError && (
            <p className="mt-3 border border-red-200 bg-red-50 p-3 text-[11px] uppercase tracking-[0.12em] text-red-700">
              {uploadError}
            </p>
          )}
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-3">
              {images.map((src, index) => (
                <div key={`${src}-${index}`} className="group relative aspect-[3/4] overflow-hidden border border-black/10 bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 border border-black bg-white px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-black opacity-90"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <button
          type="button"
          disabled={isSaving}
          onClick={onSubmit}
          className="w-full border border-black bg-black px-6 py-4 text-[11px] uppercase tracking-[0.18em] text-white disabled:opacity-50"
        >
          {isSaving ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
        </button>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [stockNotice, setStockNotice] = useState("");
  const [bulkNotice, setBulkNotice] = useState("");
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savingStockId, setSavingStockId] = useState<number | null>(null);
  const [stockDrafts, setStockDrafts] = useState<Record<number, string>>({});
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden" | "low" | "sale">("all");

  async function loadProducts() {
    const response = await adminAPI.listProducts();
    setProducts(response.products);
  }

  useEffect(() => {
    let cancelled = false;
    adminAPI
      .listProducts()
      .then((response) => {
        if (!cancelled) setProducts(response.products);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load products");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      const quantity = productQuantity(product);
      const matchesQuery =
        !needle ||
        [product.name, product.sku, product.category, product.slug]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.is_active !== false) ||
        (statusFilter === "hidden" && product.is_active === false) ||
        (statusFilter === "low" && quantity > 0 && quantity < MIN_WHOLESALE_QUANTITY) ||
        (statusFilter === "sale" && Boolean(product.sale_active || product.is_on_sale));

      return matchesQuery && matchesStatus;
    });
  }, [products, query, statusFilter]);

  const summary = useMemo(() => {
    const totalStock = products.reduce((sum, product) => sum + productQuantity(product), 0);
    const lowStock = products.filter((product) => {
      const quantity = productQuantity(product);
      return quantity > 0 && quantity < MIN_WHOLESALE_QUANTITY;
    }).length;
    const outOfStock = products.filter((product) => productQuantity(product) === 0).length;
    const activeSales = products.filter((product) => product.sale_active || product.is_on_sale).length;
    return { totalStock, lowStock, outOfStock, activeSales };
  }, [products]);

  async function saveProduct() {
    setError("");
    setIsSaving(true);
    try {
      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct.id, form);
      } else {
        await adminAPI.createProduct(form);
      }
      setStockNotice("");
      setForm(emptyForm);
      setEditingProduct(null);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save product");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    setError("");
    try {
      await adminAPI.deleteProduct(product.id);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete product");
    }
  }

  async function importBulkProducts(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    setError("");
    setBulkNotice("");
    setBulkErrors([]);
    setIsBulkImporting(true);

    try {
      const productsToImport = await parseBulkImportFile(file);
      if (productsToImport.length === 0) {
        throw new Error("Import file has no products.");
      }
      if (productsToImport.length > 500) {
        throw new Error("Import limit is 500 products per file.");
      }

      const validationErrors = validateBulkProducts(productsToImport);
      if (validationErrors.length > 0) {
        setBulkErrors(validationErrors.slice(0, 20));
        throw new Error(`${validationErrors.length} product rows need changes.`);
      }

      const response = await adminAPI.bulkImportProducts(productsToImport);
      setBulkNotice(
        `${response.total} products processed. ${response.created} created, ${response.updated} updated.`
      );
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not import products");
    } finally {
      setIsBulkImporting(false);
    }
  }

  function stockDraft(product: Product) {
    return stockDrafts[product.id] ?? String(productQuantity(product));
  }

  function setStockDraft(product: Product, value: string) {
    setStockDrafts((current) => ({ ...current, [product.id]: value }));
  }

  function adjustStockDraft(product: Product, delta: number) {
    const current = Number(stockDraft(product));
    const safeCurrent = Number.isFinite(current) ? current : productQuantity(product);
    setStockDraft(product, String(Math.max(0, safeCurrent + delta)));
  }

  async function saveStock(product: Product) {
    const nextStock = Number(stockDraft(product));
    if (!Number.isInteger(nextStock) || nextStock < 0 || nextStock > 100000) {
      setError("Stock must be a whole number between 0 and 100000.");
      return;
    }

    setError("");
    setStockNotice("");
    setSavingStockId(product.id);
    try {
      await adminAPI.updateProduct(product.id, {
        ...productToForm(product),
        quantity: nextStock,
      });
      setStockDrafts((current) => {
        const next = { ...current };
        delete next[product.id];
        return next;
      });
      setStockNotice(`${product.name} stock updated to ${nextStock} units.`);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update stock");
    } finally {
      setSavingStockId(null);
    }
  }

  function startNewProduct() {
    setEditingProduct(null);
    setForm(emptyForm);
  }

  return (
    <AdminShell>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-black/45">
            Inventory
          </p>
          <h1 className="text-[32px] font-light uppercase tracking-[0.12em]">
            Product Management
          </h1>
          <p className="mt-3 max-w-2xl text-[12px] uppercase leading-relaxed tracking-[0.12em] text-black/45">
            Search, filter, edit wholesale stock levels, sale windows, image sets, and catalogue visibility.
          </p>
        </div>
        <button
          type="button"
          onClick={startNewProduct}
          className="w-fit border border-black bg-black px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-white"
        >
          New Product
        </button>
      </div>

      {error && (
        <p className="mb-5 border border-red-200 bg-red-50 p-3 text-[11px] uppercase tracking-[0.12em] text-red-700">
          {error}
        </p>
      )}

      {stockNotice && (
        <p className="mb-5 border border-green-200 bg-green-50 p-3 text-[11px] uppercase tracking-[0.12em] text-green-700">
          {stockNotice}
        </p>
      )}

      {bulkNotice && (
        <p className="mb-5 border border-green-200 bg-green-50 p-3 text-[11px] uppercase tracking-[0.12em] text-green-700">
          {bulkNotice}
        </p>
      )}

      <div className="mb-6 border border-black/10 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-black/45">
              Bulk Import
            </p>
            <h2 className="text-[16px] uppercase tracking-[0.14em]">Upload Products</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={downloadBulkTemplate}
              className="border border-black/15 px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-black/65 hover:border-black hover:text-black"
            >
              Download CSV Template
            </button>
            <label className="relative inline-flex cursor-pointer items-center justify-center border border-black bg-black px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-white">
              {isBulkImporting ? "Importing..." : "Choose CSV / JSON"}
              <input
                type="file"
                accept=".csv,.json,text/csv,application/json"
                disabled={isBulkImporting}
                className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                onChange={(event) => {
                  void importBulkProducts(event.currentTarget.files);
                  event.currentTarget.value = "";
                }}
              />
            </label>
          </div>
        </div>
        {bulkErrors.length > 0 && (
          <div className="mt-4 border border-red-200 bg-red-50 p-3 text-[11px] uppercase tracking-[0.1em] text-red-700">
            {bulkErrors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Products", products.length],
          ["Total Units", summary.totalStock],
          [`Low < ${MIN_WHOLESALE_QUANTITY}`, summary.lowStock],
          ["Out Of Stock", summary.outOfStock],
          ["Sale Active", summary.activeSales],
        ].map(([label, value]) => (
          <div key={label} className="border border-black/10 p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-black/45">{label}</p>
            <p className="mt-2 text-[24px] font-light">{Number(value).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 border border-black/10 p-4 lg:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, SKU, slug, category"
          className="min-h-11 flex-1 border border-black/10 px-4 text-[13px] outline-none focus:border-black"
        />
        <div className="flex flex-wrap gap-2">
          {[
            ["all", "All"],
            ["active", "Active"],
            ["hidden", "Hidden"],
            ["low", "Low Stock"],
            ["sale", "Sale"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value as typeof statusFilter)}
              className={`min-h-11 border px-4 text-[10px] uppercase tracking-[0.14em] ${
                statusFilter === value
                  ? "border-black bg-black text-white"
                  : "border-black/10 text-black/55 hover:border-black/40 hover:text-black"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1fr_520px]">
        <div className="overflow-x-auto border border-black/10">
          <table className="w-full min-w-[1280px] border-collapse text-left">
            <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.16em] text-black/45">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">SKU / Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Sale</th>
                <th className="p-4">Visibility</th>
                <th className="p-4">Updated</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 text-[13px]">
              {filteredProducts.map((product) => {
                const quantity = productQuantity(product);
                const lowStock = quantity > 0 && quantity < MIN_WHOLESALE_QUANTITY;
                const draft = stockDraft(product);
                const draftNumber = Number(draft);
                const hasStockChange = Number.isFinite(draftNumber) && draftNumber !== quantity;
                const image = getProductImages(product)[0];
                return (
                  <tr key={product.id} className="align-top">
                    <td className="p-4">
                      <div className="flex gap-3">
                        <div className="h-20 w-14 shrink-0 overflow-hidden bg-neutral-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={image} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[260px] truncate font-medium uppercase tracking-[0.08em]">
                            {product.name}
                          </p>
                          <p className="mt-1 max-w-[260px] truncate text-[11px] uppercase tracking-[0.12em] text-black/45">
                            {product.slug}
                          </p>
                          {product.is_featured || product.featured ? (
                            <div className="mt-2">
                              <StatusBadge tone="black">Featured</StatusBadge>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p>{product.sku || "-"}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-black/45">
                        {product.category} / {product.collection}
                      </p>
                    </td>
                    <td className="p-4">
                      <p>{money(product.price)}</p>
                      {product.sale_active || product.is_on_sale ? (
                        <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-black/45">
                          Sale {money(product.sale_price || product.price)}
                        </p>
                      ) : null}
                    </td>
                    <td className="p-4">
                      <div className="space-y-3">
                        {quantity === 0 ? (
                          <StatusBadge tone="red">Out</StatusBadge>
                        ) : lowStock ? (
                          <StatusBadge tone="amber">Low {quantity}</StatusBadge>
                        ) : (
                          <StatusBadge tone="green">In {quantity}</StatusBadge>
                        )}
                        <div className="flex w-[190px] items-center border border-black/10">
                          <button
                            type="button"
                            aria-label={`Decrease stock for ${product.name}`}
                            className="h-9 w-9 border-r border-black/10 text-[12px] text-black/55 hover:bg-neutral-50 hover:text-black"
                            onClick={() => adjustStockDraft(product, -MIN_WHOLESALE_QUANTITY)}
                          >
                            -50
                          </button>
                          <input
                            type="number"
                            min="0"
                            max="100000"
                            value={draft}
                            onChange={(event) => setStockDraft(product, event.target.value)}
                            className="h-9 min-w-0 flex-1 border-0 px-2 text-center text-[12px] outline-none"
                          />
                          <button
                            type="button"
                            aria-label={`Increase stock for ${product.name}`}
                            className="h-9 w-9 border-l border-black/10 text-[12px] text-black/55 hover:bg-neutral-50 hover:text-black"
                            onClick={() => adjustStockDraft(product, MIN_WHOLESALE_QUANTITY)}
                          >
                            +50
                          </button>
                        </div>
                        <button
                          type="button"
                          disabled={!hasStockChange || savingStockId === product.id}
                          className="w-[190px] border border-black/15 px-3 py-2 text-[10px] uppercase tracking-[0.12em] disabled:opacity-40"
                          onClick={() => saveStock(product)}
                        >
                          {savingStockId === product.id ? "Saving..." : "Save Stock"}
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      {product.sale_active || product.is_on_sale ? (
                        <div className="space-y-2">
                          <StatusBadge tone="black">Active</StatusBadge>
                          <p className="text-[10px] uppercase leading-relaxed tracking-[0.12em] text-black/45">
                            {toDateInput(product.sale_start_date) || "No start"} to{" "}
                            {toDateInput(product.sale_end_date) || "No end"}
                          </p>
                        </div>
                      ) : (
                        <StatusBadge tone="neutral">Off</StatusBadge>
                      )}
                    </td>
                    <td className="p-4">
                      {product.is_active !== false ? (
                        <StatusBadge tone="green">Active</StatusBadge>
                      ) : (
                        <StatusBadge tone="neutral">Hidden</StatusBadge>
                      )}
                    </td>
                    <td className="p-4 text-[12px] text-black/55">
                      {new Date(product.updated_at || product.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="border border-black/15 px-3 py-2 text-[10px] uppercase tracking-[0.12em]"
                          onClick={() => {
                            setEditingProduct(product);
                            setForm(productToForm(product));
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="border border-red-200 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-red-700"
                          onClick={() => deleteProduct(product)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <p className="p-8 text-center text-[12px] uppercase tracking-[0.14em] text-black/45">
              No products match this filter.
            </p>
          )}
        </div>

        <ProductForm
          value={form}
          onChange={setForm}
          onSubmit={saveProduct}
          onCancel={startNewProduct}
          isSaving={isSaving}
          editingProduct={editingProduct}
        />
      </div>
    </AdminShell>
  );
}
