"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminAPI } from "@/lib/api";
import type { AdminOrder, OrderStatus, Product } from "@/types";
import { getProductImages } from "@/lib/productMedia";
import { MIN_WHOLESALE_QUANTITY } from "@/lib/wholesale";

type DashboardStats = {
  total_products: number;
  total_stock: number;
  low_stock_products: number;
  out_of_stock_products: number;
  active_sale_products: number;
  total_enquiries: number;
  pending_enquiries: number;
  confirmed_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  units_requested: number;
  units_pending: number;
  units_sold: number;
  gross_enquiry_value: number;
  confirmed_revenue: number;
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

function orderUnits(order: AdminOrder) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

function soldOrder(status: OrderStatus) {
  return status === "confirmed" || status === "shipped" || status === "delivered";
}

function pendingOrder(status: OrderStatus) {
  return status === "pending" || status === "payment_pending";
}

function statusLabel(status: OrderStatus) {
  if (status === "payment_pending") return "enquiry pending";
  return status.replace("_", " ");
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([adminAPI.dashboard(), adminAPI.listProducts(), adminAPI.listOrders()])
      .then(([dashboard, productResponse, orderResponse]) => {
        if (cancelled) return;
        setStats(dashboard);
        setProducts(productResponse.products);
        setOrders(orderResponse.orders);
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
        return quantity > 0 && quantity < MIN_WHOLESALE_QUANTITY;
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
    const pendingOrders = orders.filter((order) => pendingOrder(order.status));
    const soldOrders = orders.filter((order) => soldOrder(order.status));
    const pendingUnits = pendingOrders.reduce((sum, order) => sum + orderUnits(order), 0);
    const soldUnits = soldOrders.reduce((sum, order) => sum + orderUnits(order), 0);
    const requestedUnits = orders
      .filter((order) => order.status !== "cancelled" && order.status !== "refunded")
      .reduce((sum, order) => sum + orderUnits(order), 0);
    const confirmedRevenue = soldOrders.reduce((sum, order) => sum + order.total_price, 0);
    const grossEnquiryValue = orders
      .filter((order) => order.status !== "cancelled" && order.status !== "refunded")
      .reduce((sum, order) => sum + order.total_price, 0);
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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
      pendingOrders,
      soldOrders,
      pendingUnits,
      soldUnits,
      requestedUnits,
      confirmedRevenue,
      grossEnquiryValue,
      recentOrders,
    };
  }, [orders, products, stats]);

  const metricCards = [
    {
      label: "Total Products",
      value: number(stats?.total_products ?? details.totalProducts),
      sub: `${number(details.activeProducts)} active / ${number(details.inactiveProducts)} hidden`,
    },
    {
      label: "Stock On Hand",
      value: number(details.totalStock || stats?.total_stock || 0),
      sub: `${number(stats?.out_of_stock_products ?? details.outOfStock)} out of stock`,
    },
    {
      label: "Out Of Stock",
      value: number(stats?.out_of_stock_products ?? details.outOfStock),
      sub: "Needs restock before new enquiries",
    },
    {
      label: `Low Stock < ${MIN_WHOLESALE_QUANTITY}`,
      value: number(stats?.low_stock_products ?? details.lowStock.length),
      sub: "Needs restock before wholesale sale",
    },
    {
      label: "Pending Enquiries",
      value: number(stats?.pending_enquiries ?? details.pendingOrders.length),
      sub: `${number(stats?.units_pending ?? details.pendingUnits)} units in review`,
    },
    {
      label: "Units Sold",
      value: number(stats?.units_sold ?? details.soldUnits),
      sub: `${number(stats?.units_requested ?? details.requestedUnits)} units requested total`,
    },
    {
      label: "Confirmed Revenue",
      value: money(stats?.confirmed_revenue ?? details.confirmedRevenue),
      sub: `${money(stats?.gross_enquiry_value ?? details.grossEnquiryValue)} enquiry value`,
    },
    {
      label: "Sale Products",
      value: number(details.activeSales.length || stats?.active_sale_products || 0),
      sub: `${number(details.featuredProducts)} featured styles`,
    },
    {
      label: "Inventory Value",
      value: money(details.inventoryValue),
      sub: `${money(details.averagePrice)} average unit`,
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
            Inventory health, wholesale stock pressure, units pending review, confirmed sales, and recent enquiry movement.
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
              Products below the wholesale minimum of {MIN_WHOLESALE_QUANTITY} units.
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
            <h2 className="text-[14px] uppercase tracking-[0.16em]">Recent Enquiries</h2>
            <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-black/45">
              Track units requested, payment state, and customer follow-up.
            </p>
          </div>
          <div className="divide-y divide-black/10">
            {details.recentOrders.length === 0 ? (
              <p className="p-5 text-[12px] uppercase tracking-[0.12em] text-black/45">
                No wholesale enquiries yet.
              </p>
            ) : (
              details.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href="/admin/orders"
                  className="grid gap-3 p-5 transition-colors hover:bg-neutral-50 sm:grid-cols-[1fr_auto]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] uppercase tracking-[0.1em]">
                      Enquiry #{order.id} / {order.shipping_name || order.user_name || "Customer"}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-black/45">
                      {number(orderUnits(order))} units / {statusLabel(order.status)}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[13px] tracking-[0.08em]">{money(order.total_price)}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-black/45">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

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
