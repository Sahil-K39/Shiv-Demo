"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { LANGUAGES, REGION_LABELS, Language } from "@/lib/languages";

export default function LanguageModal() {
  const { currentLanguage, setLanguage, isModalOpen, setIsModalOpen } =
    useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  const regions = [
    "all",
    "global",
    "indian",
    "mideast_central",
    "european",
    "southeast_asian",
    "african",
  ];

  const filteredLanguages = useMemo(() => {
    return LANGUAGES.filter((lang) => {
      const matchesRegion =
        selectedRegion === "all" || lang.region === selectedRegion;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        lang.name.toLowerCase().includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q);

      return matchesRegion && matchesSearch;
    });
  }, [selectedRegion, searchQuery]);

  if (!isModalOpen) return null;

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang.code);
    setIsModalOpen(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsModalOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
            <div>
              <h2 className="text-xl font-medium tracking-tight text-neutral-900">
                Select Language & Region
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                Automatic Right-to-Left (RTL) layout direction is applied for RTL languages.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              aria-label="Close language selector"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-black"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Search & Region Filters */}
          <div className="border-b border-neutral-100 bg-neutral-50/70 px-6 py-4">
            {/* Search Input */}
            <div className="relative mb-3">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search by language name or native script (e.g. Arabic, हिन्दी, 日本語)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Region Category Tabs */}
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
              {regions.map((region) => {
                const isActive = selectedRegion === region;
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => setSelectedRegion(region)}
                    className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-black text-white shadow-sm"
                        : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300 hover:text-black"
                    }`}
                  >
                    {REGION_LABELS[region]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredLanguages.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-medium text-neutral-600">
                  No languages found matching &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Try searching with the English or native name.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredLanguages.map((lang) => {
                  const isSelected = currentLanguage.code === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelectLanguage(lang)}
                      className={`group relative flex items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
                        isSelected
                          ? "border-black bg-neutral-900 text-white shadow-md"
                          : "border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50/80"
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-medium ${
                              isSelected ? "text-white" : "text-neutral-900"
                            }`}
                          >
                            {lang.name}
                          </span>
                          {lang.rtl && (
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wider ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              RTL
                            </span>
                          )}
                        </div>
                        <span
                          className={`mt-0.5 text-xs ${
                            isSelected ? "text-neutral-300" : "text-neutral-500"
                          }`}
                        >
                          {lang.nativeName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-mono uppercase tracking-wider ${
                            isSelected
                              ? "text-neutral-400"
                              : "text-neutral-400 group-hover:text-neutral-600"
                          }`}
                        >
                          {lang.code}
                        </span>
                        {isSelected && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black">
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-6 py-3 text-xs text-neutral-500">
            <div>
              <span>Currently active: </span>
              <strong className="font-medium text-neutral-900">
                {currentLanguage.name} ({currentLanguage.nativeName})
              </strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {currentLanguage.rtl ? "RTL Active" : "LTR Active"}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
