"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminAPI } from "@/lib/api";
import type { Product } from "@/types";
import { getProductImages } from "@/lib/productMedia";

type DashboardStats = {
  total_products: number;
  total_stock: number;
  low_stock_products: number;
  active_sale_products: number;
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function number(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function productTime(product: Product) {
  return new Date(product.updated_at || product.created_at).getTime();
}

function productStock(product: Product) {
  return product.quantity ?? 0;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([adminAPI.dashboard(), adminAPI.listProducts()])
      .then(([dashboard, productResponse]) => {
        if (cancelled) return;
        setStats(dashboard);
        setProducts(productResponse.products);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load dashboard");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const details = useMemo(() => {
    const totalProducts = products.length || stats?.total_products || 0;
    const totalStock = products.reduce((sum, product) => sum + productStock(product), 0);
    const inventoryValue = products.reduce(
      (sum, product) => sum + product.price * productStock(product),
      0
    );
    const activeProducts = products.filter((product) => product.is_active !== false).length;
    const inactiveProducts = totalProducts - activeProducts;
    const outOfStock = products.filter((product) => productStock(product) === 0).length;
    const lowStock = products
      .filter((product) => {
        const quantity = productStock(product);
        return quantity > 0 && quantity <= 10;
      })
      .sort((a, b) => productStock(a) - productStock(b));
    const activeSales = products.filter((product) => product.sale_active || product.is_on_sale);
    const featuredProducts = products.filter(
      (product) => product.is_featured || product.featured
    ).length;
    const averagePrice =
      totalProducts > 0
        ? products.reduce((sum, product) => sum + product.price, 0) / totalProducts
        : 0;
    const categories = Object.entries(
      products.reduce<Record<string, number>>((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]);
    const recentProducts = [...products]
      .sort((a, b) => productTime(b) - productTime(a))
      .slice(0, 5);

    return {
      totalProducts,
      totalStock,
      inventoryValue,
      activeProducts,
      inactiveProducts,
      outOfStock,
      lowStock,
      activeSales,
      featuredProducts,
      averagePrice,
      categories,
      recentProducts,
    };
  }, [products, stats]);

  const metricCards = [
    {
      label: "Total Products",
      value: number(details.totalProducts),
      sub: `${number(details.activeProducts)} active / ${number(details.inactiveProducts)} hidden`,
    },
    {
      label: "Total Stock",
      value: number(details.totalStock || stats?.total_stock || 0),
      sub: `${number(details.outOfStock)} out of stock`,
    },
    {
      label: "Inventory Value",
      value: money(details.inventoryValue),
      sub: `${money(details.averagePrice)} average unit`,
    },
    {
      label: "Sale Products",
      value: number(details.activeSales.length || stats?.active_sale_products || 0),
      sub: `${number(details.featuredProducts)} featured styles`,
    },
  ];

  return (
    <AdminShell>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-black/45">
            Overview
          </p>
          <h1 className="text-[32px] font-light uppercase tracking-[0.12em]">
            Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-[12px] uppercase leading-relaxed tracking-[0.12em] text-black/45">
            Inventory health, wholesale stock pressure, active sale status, and recent catalogue movement.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="w-fit border border-black bg-black px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-white"
        >
          Manage Products
        </Link>
      </div>

      {error && (
        <p className="mb-5 border border-red-200 bg-red-50 p-3 text-[11px] uppercase tracking-[0.12em] text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <div key={card.label} className="border border-black/10 bg-white p-6">
            <p className="mb-4 text-[10px] uppercase tracking-[0.18em] text-black/45">
              {card.label}
            </p>
            <p className="text-[30px] font-light tracking-[0.05em]">{card.value}</p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-black/45">
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="border border-black/10">
          <div className="border-b border-black/10 p-5">
            <h2 className="text-[14px] uppercase tracking-[0.16em]">Stock Watchlist</h2>
            <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-black/45">
              Products at 10 units or fewer.
            </p>
          </div>
          <div className="divide-y divide-black/10">
            {details.lowStock.length === 0 ? (
              <p className="p-5 text-[12px] uppercase tracking-[0.12em] text-black/45">
                No low-stock products.
              </p>
            ) : (
              details.lowStock.slice(0, 6).map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] uppercase tracking-[0.1em]">
                      {product.name}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-black/45">
                      {product.sku || "No SKU"} / {product.category}
                    </p>
                  </div>
                  <span className="border border-amber-300 bg-amber-50 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-amber-700">
                    {productStock(product)} units
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="border border-black/10">
          <div className="border-b border-black/10 p-5">
            <h2 className="text-[14px] uppercase tracking-[0.16em]">Category Mix</h2>
            <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-black/45">
              Current catalogue distribution.
            </p>
          </div>
          <div className="space-y-4 p-5">
            {details.categories.map(([category, count]) => (
              <div key={category}>
                <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.12em]">
                  <span>{category}</span>
                  <span className="text-black/45">{count}</span>
                </div>
                <div className="h-2 bg-black/5">
                  <div
                    className="h-full bg-black"
                    style={{
                      width: `${Math.max(8, (count / Math.max(details.totalProducts, 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="border border-black/10">
          <div className="border-b border-black/10 p-5">
            <h2 className="text-[14px] uppercase tracking-[0.16em]">Recent Updates</h2>
          </div>
          <div className="divide-y divide-black/10">
            {details.recentProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-5">
                <div className="h-14 w-11 shrink-0 overflow-hidden bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getProductImages(product)[0]} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] uppercase tracking-[0.1em]">
                    {product.name}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-black/45">
                    Updated {new Date(product.updated_at || product.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-[12px] tracking-[0.08em]">{money(product.price)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-black/10">
          <div className="border-b border-black/10 p-5">
            <h2 className="text-[14px] uppercase tracking-[0.16em]">Active Sales</h2>
          </div>
          <div className="divide-y divide-black/10">
            {details.activeSales.length === 0 ? (
              <p className="p-5 text-[12px] uppercase tracking-[0.12em] text-black/45">
                No active sale products.
              </p>
            ) : (
              details.activeSales.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] uppercase tracking-[0.1em]">
                      {product.name}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-black/45">
                      Sale price {money(product.sale_price || product.price)}
                    </p>
                  </div>
                  <span className="border border-black bg-black px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-white">
                    Sale
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
