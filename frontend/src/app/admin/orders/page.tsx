"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { adminAPI } from "@/lib/api";
import { formatPriceINR } from "@/lib/pricing";
import type { AdminOrder, OrderStatus } from "@/types";

const statusFilters = ["all", "payment_pending", "confirmed", "shipped", "delivered"] as const;

function money(value: number) {
  return formatPriceINR(value);
}

function formatDate(value?: string | null) {
  if (!value) return "Pending";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusLabel(status: OrderStatus) {
  if (status === "payment_pending") return "enquiry pending";
  return status.replace("_", " ");
}

function statusTone(status: OrderStatus) {
  if (status === "confirmed" || status === "delivered") return "green";
  if (status === "shipped") return "black";
  if (status === "cancelled" || status === "refunded") return "red";
  return "amber";
}

function orderUnits(order: AdminOrder) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

function isSoldStatus(status: OrderStatus) {
  return status === "confirmed" || status === "shipped" || status === "delivered";
}

function Badge({
  tone,
  children,
}: {
  tone: "black" | "green" | "amber" | "red" | "neutral";
  children: React.ReactNode;
}) {
  const styles = {
    black: "border-black bg-black text-white",
    green: "border-green-300 bg-green-50 text-green-700",
    amber: "border-amber-300 bg-amber-50 text-amber-700",
    red: "border-red-300 bg-red-50 text-red-700",
    neutral: "border-black/10 text-black/45",
  };

  return (
    <span
      className={`inline-flex border px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof statusFilters)[number]>("all");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function loadOrders() {
    const response = await adminAPI.listOrders();
    setOrders(response.orders);
  }

  useEffect(() => {
    let cancelled = false;
    adminAPI
      .listOrders()
      .then((response) => {
        if (!cancelled) setOrders(response.orders);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load orders");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesQuery =
        !needle ||
        [
          order.id,
          order.user_email,
          order.user_name,
          order.shipping_name,
          order.shipping_phone,
          order.payment_reference,
          order.status,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle));
      return matchesStatus && matchesQuery;
    });
  }, [orders, query, statusFilter]);

  const summary = useMemo(() => {
    const pending = orders.filter(
      (order) => order.status === "pending" || order.status === "payment_pending"
    ).length;
    const soldOrders = orders.filter((order) => isSoldStatus(order.status));
    const paid = soldOrders.length;
    const gross = orders
      .filter((order) => order.status !== "cancelled" && order.status !== "refunded")
      .reduce((sum, order) => sum + order.total_price, 0);
    const confirmedValue = soldOrders.reduce((sum, order) => sum + order.total_price, 0);
    const unitsPending = orders
      .filter((order) => order.status === "pending" || order.status === "payment_pending")
      .reduce((sum, order) => sum + orderUnits(order), 0);
    const unitsSold = soldOrders.reduce((sum, order) => sum + orderUnits(order), 0);
    return { pending, paid, gross, confirmedValue, unitsPending, unitsSold };
  }, [orders]);

  async function updateStatus(order: AdminOrder, status: OrderStatus) {
    let paymentReference: string | undefined;
    if (status === "confirmed") {
      const value = window.prompt("Payment reference or confirmation note", order.payment_reference);
      if (value === null) return;
      paymentReference = value.trim();
    }

    setError("");
    setUpdatingId(order.id);
    try {
      await adminAPI.updateOrderStatus(order.id, {
        status,
        payment_reference: paymentReference,
      });
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update order");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <AdminShell>
      <div className="mb-8">
        <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-black/45">
          Fulfillment
        </p>
        <h1 className="text-[32px] font-light uppercase tracking-[0.12em]">
          Wholesale Enquiries
        </h1>
        <p className="mt-3 max-w-2xl text-[12px] uppercase leading-relaxed tracking-[0.12em] text-black/45">
          Buyer enquiries, requested quantities, customer email, delivery details, and manual payment confirmation status.
        </p>
      </div>

      {error && (
        <p className="mb-5 border border-red-200 bg-red-50 p-3 text-[11px] uppercase tracking-[0.12em] text-red-700">
          {error}
        </p>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {[
          ["Total Enquiries", orders.length],
          ["Pending Review", summary.pending],
          ["Units In Review", summary.unitsPending],
          ["Units Sold", summary.unitsSold],
          ["Confirmed Sales", summary.paid],
          ["Confirmed Value", money(summary.confirmedValue)],
          ["Enquiry Value", money(summary.gross)],
        ].map(([label, value]) => (
          <div key={label} className="border border-black/10 p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-black/45">
              {label}
            </p>
            <p className="mt-2 text-[24px] font-light">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 border border-black/10 p-4 lg:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search enquiry, customer, phone, payment reference"
          className="min-h-11 flex-1 border border-black/10 px-4 text-[13px] outline-none focus:border-black"
        />
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`min-h-11 border px-4 text-[10px] uppercase tracking-[0.14em] ${
                statusFilter === status
                  ? "border-black bg-black text-white"
                  : "border-black/10 text-black/55 hover:border-black/40 hover:text-black"
              }`}
            >
              {statusLabel(status as OrderStatus)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        {filteredOrders.map((order) => (
          <section key={order.id} className="border border-black/10">
            <div className="flex flex-col gap-4 border-b border-black/10 p-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <h2 className="text-[15px] uppercase tracking-[0.14em]">
                    Enquiry #{order.id}
                  </h2>
                  <Badge tone={statusTone(order.status)}>
                    {statusLabel(order.status)}
                  </Badge>
                  <Badge tone="neutral">{orderUnits(order)} Units</Badge>
                  {order.payment_confirmed_at ? (
                    <Badge tone="green">Paid</Badge>
                  ) : (
                    <Badge tone="amber">Awaiting Payment</Badge>
                  )}
                </div>
                <p className="text-[12px] normal-case tracking-normal text-black/65">
                  {order.user_name || order.shipping_name || "Customer"} /{" "}
                  {order.user_email || "No account email"}
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-black/45">
                  Created {formatDate(order.created_at)} / Updated {formatDate(order.updated_at)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={updatingId === order.id}
                  onClick={() => updateStatus(order, "confirmed")}
                  className="border border-black bg-black px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-white disabled:opacity-50"
                >
                  Confirm Payment
                </button>
                <button
                  type="button"
                  disabled={updatingId === order.id}
                  onClick={() => updateStatus(order, "shipped")}
                  className="border border-black/15 px-3 py-2 text-[10px] uppercase tracking-[0.12em] disabled:opacity-50"
                >
                  Shipped
                </button>
                <button
                  type="button"
                  disabled={updatingId === order.id}
                  onClick={() => updateStatus(order, "delivered")}
                  className="border border-black/15 px-3 py-2 text-[10px] uppercase tracking-[0.12em] disabled:opacity-50"
                >
                  Delivered
                </button>
                <button
                  type="button"
                  disabled={updatingId === order.id}
                  onClick={() => updateStatus(order, "cancelled")}
                  className="border border-red-200 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-red-700 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="grid gap-5 p-5 xl:grid-cols-[1fr_1fr_1.1fr]">
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-black/45">
                  Approval And Payment
                </p>
                <p className="text-[24px] font-light">{money(order.total_price)}</p>
                <p className="mt-3 text-[12px] leading-relaxed text-black/60">
                  Payment note: {order.payment_reference || "No payment note recorded"}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-black/60">
                  Units tracked: {orderUnits(order)}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-black/60">
                  Payment confirmed: {formatDate(order.payment_confirmed_at)}
                </p>
              </div>

              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-black/45">
                  Shipping
                </p>
                <p className="text-[13px] uppercase tracking-[0.08em]">
                  {order.shipping_name || "No shipping name"}
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-black/60">
                  {order.shipping_address}
                  <br />
                  {[order.shipping_city, order.shipping_state, order.shipping_zip]
                    .filter(Boolean)
                    .join(", ")}
                  <br />
                  {order.shipping_country}
                </p>
                <p className="mt-2 text-[12px] tracking-[0.04em] text-black/60">
                  {order.shipping_phone || "No phone"}
                </p>
              </div>

              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-black/45">
                  Items
                </p>
                <div className="divide-y divide-black/10 border border-black/10">
                  {order.items.length === 0 ? (
                    <p className="p-3 text-[12px] text-black/45">No items recorded.</p>
                  ) : (
                    order.items.map((item) => (
                      <div key={item.id} className="grid grid-cols-[1fr_auto] gap-4 p-3">
                        <div className="min-w-0">
                          <p className="truncate text-[12px] uppercase tracking-[0.08em]">
                            {item.name}
                          </p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-black/45">
                            Qty {item.quantity} / {item.size}
                            {item.color ? ` / ${item.color}` : ""}
                          </p>
                        </div>
                        <p className="text-[12px]">{money(item.price)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        ))}

        {filteredOrders.length === 0 && (
          <p className="border border-black/10 p-8 text-center text-[12px] uppercase tracking-[0.14em] text-black/45">
            No enquiries match this filter.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
