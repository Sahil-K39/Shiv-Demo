"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Language,
  LANGUAGES,
  RTL_LANGUAGES,
  getLanguageByCode,
} from "@/lib/languages";
import { TranslationKey, getTranslation } from "@/lib/translations";
import { getPageText } from "@/lib/pageTranslations";
import { Currency, CURRENCIES, getCurrencyByCode, convertAndFormatPrice } from "@/lib/currencies";

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (code: string) => void;
  currentCurrency: Currency;
  setCurrency: (code: string) => void;
  activeModalTab: "language" | "currency";
  setActiveModalTab: (tab: "language" | "currency") => void;
  isRtl: boolean;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  t: (key: TranslationKey | string) => string;
  pt: (key: string) => string;
  formatPrice: (valueInINR: number) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: LANGUAGES[0],
  setLanguage: () => {},
  currentCurrency: CURRENCIES[0],
  setCurrency: () => {},
  activeModalTab: "language",
  setActiveModalTab: () => {},
  isRtl: false,
  isModalOpen: false,
  setIsModalOpen: () => {},
  t: (key) => String(key),
  pt: (key) => String(key),
  formatPrice: (value) => `₹${value.toLocaleString("en-IN")}`,
});

const STORAGE_KEY = "shiv_shakti_locale";
const CURRENCY_STORAGE_KEY = "shiv_shakti_currency";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguageState] = useState<Language>(
    LANGUAGES[0]
  );
  const [currentCurrency, setCurrentCurrencyState] = useState<Currency>(
    CURRENCIES[0]
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<"language" | "currency">("language");

  const applyDocumentDirection = (lang: Language) => {
    const isRtl = Boolean(lang.rtl || RTL_LANGUAGES.has(lang.code));
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang.code;
      document.documentElement.dir = isRtl ? "rtl" : "ltr";
      if (isRtl) {
        document.documentElement.classList.add("rtl");
      } else {
        document.documentElement.classList.remove("rtl");
      }
      try {
        if (lang.code === "en") {
          document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        } else {
          document.cookie = `googtrans=/en/${lang.code}; path=/;`;
        }
      } catch {}
    }
  };

  useEffect(() => {
    try {
      const storedCode = localStorage.getItem(STORAGE_KEY);
      if (storedCode) {
        const found = getLanguageByCode(storedCode);
        setTimeout(() => {
          setCurrentLanguageState(found);
          applyDocumentDirection(found);
        }, 0);
      }
      const storedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (storedCurrency) {
        const foundCurr = getCurrencyByCode(storedCurrency);
        setTimeout(() => {
          setCurrentCurrencyState(foundCurr);
        }, 0);
      }
    } catch (err) {
      console.error("Failed to read locale/currency from localStorage:", err);
    }
  }, []);

  const setLanguage = (code: string) => {
    const lang = getLanguageByCode(code);
    setCurrentLanguageState(lang);
    applyDocumentDirection(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang.code);
    } catch (err) {
      console.error("Failed to save locale to localStorage:", err);
    }
  };

  const setCurrency = (code: string) => {
    const curr = getCurrencyByCode(code);
    setCurrentCurrencyState(curr);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, curr.code);
    } catch (err) {
      console.error("Failed to save currency to localStorage:", err);
    }
  };

  const isRtl = Boolean(
    currentLanguage.rtl || RTL_LANGUAGES.has(currentLanguage.code)
  );

  const pt = (key: string) => getPageText(currentLanguage.code, key);

  const t = (key: TranslationKey | string) => {
    const translated = getTranslation(currentLanguage.code, key as TranslationKey);
    if (translated && translated !== key) return translated;
    return getPageText(currentLanguage.code, key);
  };

  const formatPrice = (valueInINR: number): string => {
    return convertAndFormatPrice(valueInINR, currentCurrency);
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        currentCurrency,
        setCurrency,
        activeModalTab,
        setActiveModalTab,
        isRtl,
        isModalOpen,
        setIsModalOpen,
        t,
        pt,
        formatPrice,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
