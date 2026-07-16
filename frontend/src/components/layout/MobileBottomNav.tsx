"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { useLanguage } from "@/context/LanguageContext";
import { AnimatePresence, motion } from "framer-motion";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { toggleCart, itemCount } = useCartStore();
  const { t } = useLanguage();
  const count = itemCount();

  const isHome = pathname === "/";
  const isShakti = pathname.startsWith("/shop/shakti");
  const isShiva = pathname.startsWith("/shop/shiva");
  const isSearch = pathname === "/search";

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around bg-white/95 backdrop-blur-xl border-t border-black/10 px-2 py-2.5 pb-safe text-black shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none"
    >
      {/* Home Tab */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 transition-colors ${
          isHome ? "text-black font-bold" : "text-black/55 hover:text-black"
        }`}
      >
        <svg className="w-5 h-5" fill={isHome ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isHome ? 2.2 : 1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="text-[10px] uppercase tracking-wider font-semibold leading-none">{t("nav.wholesale")}</span>
      </Link>

      {/* Shakti Tab */}
      <Link
        href="/shop/shakti"
        className={`flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 transition-colors ${
          isShakti ? "text-[#e11d48] font-bold" : "text-black/55 hover:text-black"
        }`}
      >
        <svg className="w-5 h-5" fill={isShakti ? "currentColor" : "none"} viewBox="0 0 24 24" stroke={isShakti ? "#e11d48" : "currentColor"} strokeWidth={isShakti ? 2.2 : 1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span className="text-[10px] uppercase tracking-wider font-semibold leading-none">{t("nav.shakti")}</span>
      </Link>

      {/* Shiva Tab */}
      <Link
        href="/shop/shiva"
        className={`flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 transition-colors ${
          isShiva ? "text-black font-bold" : "text-black/55 hover:text-black"
        }`}
      >
        <svg className="w-5 h-5" fill={isShiva ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isShiva ? 2.2 : 1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-[10px] uppercase tracking-wider font-semibold leading-none">{t("nav.shiva")}</span>
      </Link>

      {/* Search Tab */}
      <Link
        href="/search"
        className={`flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 transition-colors ${
          isSearch ? "text-black font-bold" : "text-black/55 hover:text-black"
        }`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isSearch ? 2.2 : 1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-[10px] uppercase tracking-wider font-semibold leading-none">Search</span>
      </Link>

      {/* Bag / Cart Tab */}
      <button
        type="button"
        onClick={toggleCart}
        className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 text-black/55 hover:text-black transition-colors relative"
        aria-label={`Open shopping bag (${count} items)`}
      >
        <div className="relative">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <AnimatePresence>
            {count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-black px-1 text-[8px] font-bold leading-none text-white shadow-sm"
              >
                {count}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold leading-none">Bag</span>
      </button>
    </nav>
  );
}
