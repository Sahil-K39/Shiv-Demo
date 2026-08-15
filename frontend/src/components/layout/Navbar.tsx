

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/store/cart";
import BrandLogo from "@/components/ui/BrandLogo";
import LanguageSwitcherButton from "@/components/ui/LanguageSwitcherButton";
import CurrencySwitcherButton from "@/components/ui/CurrencySwitcherButton";
import { useLanguage } from "@/context/LanguageContext";
import { TranslationKey } from "@/lib/translations";
import {
  BagIcon,
  CloseIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/Icons";

const navLinks: Array<{ href: string; key?: TranslationKey; label?: string }> = [
  { href: "/shop/shiva", key: "nav.shiva" },
  { href: "/shop/shakti", key: "nav.shakti" },
  { href: "/", key: "nav.wholesale" },
  { href: "/fabric-selling", key: "nav.fabric" },
  { href: "/council", key: "nav.council" },
  { href: "/ngo", label: "NGO" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { toggleCart, itemCount, user, checkSession } = useCartStore();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const count = itemCount();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <motion.nav
        initial={false}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 z-50 flex h-[70px] sm:h-[80px] w-full items-center justify-between border-b border-black/10 bg-white/95 text-black px-3 sm:px-4 backdrop-blur-xl md:px-6 lg:px-10 select-none"
      >
        {/* Mobile Header Layout (< md) */}
        <div className="flex md:hidden w-full items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              className="mobile-menu-trigger icon-button p-2"
              onClick={() => setIsMenuOpen((value) => !value)}
            >
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <Link
              href="/search"
              aria-label="Search"
              className="icon-button p-2"
              onClick={closeMenu}
            >
              <SearchIcon />
            </Link>
          </div>

          <div className="flex-1 flex justify-center">
            <BrandLogo className="nav-brand" />
          </div>

          <div className="flex items-center gap-1">
            <Link
              href={user ? "/account" : "/login"}
              aria-label={user ? "Account" : "Log in"}
              className="icon-button p-2"
              onClick={closeMenu}
            >
              <UserIcon />
            </Link>
            <button
              type="button"
              onClick={() => {
                closeMenu();
                toggleCart();
              }}
              aria-label={`Open wholesale enquiry${count > 0 ? ` with ${count} unit${count === 1 ? "" : "s"}` : ""}`}
              className="icon-button relative p-2"
            >
              <BagIcon />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-black px-1 text-[8px] font-bold leading-none text-white shadow-sm"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Desktop Header Layout (>= md) */}
        <div className="hidden md:flex w-full items-center justify-between gap-3">
          <BrandLogo className="nav-brand" />

          <div className="desktop-nav-links h-full min-w-0 flex-1 flex items-center justify-center gap-3 whitespace-nowrap text-[13px] font-medium uppercase tracking-[0.09em] lg:gap-4 lg:text-[14px] xl:gap-5 xl:text-[15px]">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link relative py-2 ${isActive ? "text-black font-semibold" : "text-black/70 hover:text-black"}`}
                >
                  {link.label || (link.key && t(link.key))}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-px bg-black"
                      transition={{ type: "spring", stiffness: 320, damping: 32 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <LanguageSwitcherButton variant="nav" />
            <CurrencySwitcherButton variant="nav" />

            <Link
              href="/search"
              aria-label="Search"
              className="icon-button"
              onClick={closeMenu}
            >
              <SearchIcon />
            </Link>

            <Link
              href={user ? "/account" : "/login"}
              aria-label={user ? "Account" : "Log in"}
              className="icon-button"
              onClick={closeMenu}
            >
              <UserIcon />
            </Link>

            <button
              type="button"
              onClick={() => {
                closeMenu();
                toggleCart();
              }}
              aria-label={`Open wholesale enquiry${count > 0 ? ` with ${count} unit${count === 1 ? "" : "s"}` : ""}`}
              className="icon-button relative"
            >
              <BagIcon />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-black px-1 text-[8px] font-bold leading-none text-white shadow-sm"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mobile-menu-panel fixed left-0 right-0 top-[80px] z-40 border-b border-black/10 bg-white text-black px-4 py-5 md:hidden"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col divide-y divide-black/10 border-y border-black/10">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className={`flex items-center justify-between py-4 text-[12px] font-medium uppercase tracking-[0.16em] transition-colors ${
                      isActive ? "text-black font-semibold" : "text-black/55"
                    }`}
                  >
                    {link.label || (link.key && t(link.key))}
                    <span className="h-px w-8 bg-current opacity-40" />
                  </Link>
                );
              })}
              <div className="py-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-neutral-500 font-medium">
                    {t("nav.languageRegion")}
                  </span>
                  <LanguageSwitcherButton variant="footer" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-neutral-500 font-medium">
                    Currency & Pricing
                  </span>
                  <CurrencySwitcherButton variant="footer" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
