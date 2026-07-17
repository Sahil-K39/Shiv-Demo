"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

interface LanguageSwitcherButtonProps {
  variant?: "nav" | "footer" | "pill";
  className?: string;
}

export default function LanguageSwitcherButton({
  variant = "nav",
  className = "",
}: LanguageSwitcherButtonProps) {
  const { currentLanguage, setIsModalOpen, setActiveModalTab, isRtl } = useLanguage();

  const handleClick = () => {
    setActiveModalTab("language");
    setIsModalOpen(true);
  };

  if (variant === "footer") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label="Select language and region"
        className={`inline-flex items-center gap-2.5 rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-800 shadow-sm transition-all hover:border-black hover:bg-neutral-900 hover:text-white ${className}`}
      >
        <svg
          className="h-4 w-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          {currentLanguage.name} ({currentLanguage.nativeName})
        </span>
        {isRtl && (
          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-neutral-800">
            RTL
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Current language: ${currentLanguage.name}. Click to change language.`}
      className={`inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-800 transition-all hover:border-black hover:bg-neutral-900 hover:text-white ${className}`}
    >
      <svg
        className="h-3.5 w-3.5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="font-mono uppercase tracking-wider">
        {currentLanguage.code}
      </span>
      {isRtl && (
        <span className="rounded bg-neutral-100 px-1 py-0.5 text-[8px] font-bold text-neutral-800">
          RTL
        </span>
      )}
    </button>
  );
}
