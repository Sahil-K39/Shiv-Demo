"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { adminAPI } from "@/lib/api";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/ngo", label: "NGO Forms" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    adminAPI
      .me()
      .then((user) => {
        if (user.role !== "admin") {
          router.replace("/admin/login");
          return;
        }
        setIsReady(true);
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  if (!isReady) {
    return (
      <div className="min-h-[70vh] bg-white px-6 py-20">
        <div className="mx-auto h-6 w-6 animate-spin border border-black/20 border-t-black" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-white text-black">
      <div className="grid min-h-[calc(100vh-80px)] grid-cols-1 border-t border-black/10 md:grid-cols-[240px_1fr]">
        <aside className="border-b border-black/10 bg-neutral-50 p-6 md:border-b-0 md:border-r">
          <p className="mb-8 text-[10px] uppercase tracking-[0.24em] text-black/45">
            Admin Panel
          </p>
          <nav className="flex gap-2 md:flex-col">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`border px-4 py-3 text-[11px] uppercase tracking-[0.16em] transition-colors ${
                    active
                      ? "border-black bg-black text-white"
                      : "border-black/10 text-black/55 hover:border-black/40 hover:text-black"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
