"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

interface CurrencySwitcherButtonProps {
  variant?: "nav" | "footer" | "pill";
  className?: string;
}

export default function CurrencySwitcherButton({
  variant = "nav",
  className = "",
}: CurrencySwitcherButtonProps) {
  const { currentCurrency, setIsModalOpen, setActiveModalTab } = useLanguage();

  const handleClick = () => {
    setActiveModalTab("currency");
    setIsModalOpen(true);
  };

  if (variant === "footer") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label="Select currency"
        className={`inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-800 shadow-sm transition-all hover:border-black hover:bg-neutral-900 hover:text-white ${className}`}
      >
        <span className="font-bold text-[#e11d48]">{currentCurrency.symbol}</span>
        <span>{currentCurrency.code} — {currentCurrency.name}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Current currency: ${currentCurrency.code}. Click to change currency.`}
      className={`inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-800 transition-all hover:border-black hover:bg-neutral-900 hover:text-white ${className}`}
    >
      <span className="font-bold text-[#e11d48] shrink-0">{currentCurrency.symbol}</span>
      <span className="font-mono uppercase tracking-wider">
        {currentCurrency.code}
      </span>
    </button>
  );
}
