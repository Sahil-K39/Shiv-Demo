

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/store/cart";
import BrandLogo from "@/components/ui/BrandLogo";
import {
  BagIcon,
  CloseIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/Icons";

const navLinks = [
  { href: "/shop/shiva", label: "SHIVA" },
  { href: "/shop/shakti", label: "SHAKTI" },
  { href: "/", label: "WHOLESALE" },
  { href: "/fabric-selling", label: "FABRIC SELLING" },
  { href: "/council", label: "COUNCIL" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { toggleCart, itemCount, user, checkSession } = useCartStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const count = itemCount();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 z-50 flex h-[80px] w-full items-center justify-between gap-2 border-b border-black/10 bg-white/[0.88] px-4 backdrop-blur-xl md:gap-3 md:px-6 lg:px-10"
      >
        <BrandLogo className="nav-brand" />

        <div className="desktop-nav-links hidden h-full min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.08em] md:flex md:gap-3 md:text-[13px] md:tracking-[0.09em] lg:gap-4 lg:text-[14px] xl:gap-5 xl:text-[15px]">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive ? "text-black" : ""}`}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute bottom-2 left-0 right-0 h-px bg-black"
                    transition={{ type: "spring", stiffness: 320, damping: 32 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-1 md:gap-2">
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
                  className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center bg-black px-1 text-[8px] font-medium leading-none text-white"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="mobile-menu-trigger icon-button md:hidden"
            onClick={() => setIsMenuOpen((value) => !value)}
          >
            {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mobile-menu-panel fixed left-0 right-0 top-[80px] z-40 border-b border-black bg-white px-4 py-5 md:hidden"
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
                      isActive ? "text-black" : "text-black/55"
                    }`}
                  >
                    {link.label}
                    <span className="h-px w-8 bg-current opacity-40" />
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
