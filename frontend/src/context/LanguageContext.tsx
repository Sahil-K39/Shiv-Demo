"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Language,
  LANGUAGES,
  RTL_LANGUAGES,
  getLanguageByCode,
} from "@/lib/languages";
import { TranslationKey, getTranslation } from "@/lib/translations";

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (code: string) => void;
  isRtl: boolean;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: LANGUAGES[0],
  setLanguage: () => {},
  isRtl: false,
  isModalOpen: false,
  setIsModalOpen: () => {},
  t: (key) => key,
});

const STORAGE_KEY = "shiv_shakti_locale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguageState] = useState<Language>(
    LANGUAGES[0]
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    } catch (err) {
      console.error("Failed to read locale from localStorage:", err);
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

  const isRtl = Boolean(
    currentLanguage.rtl || RTL_LANGUAGES.has(currentLanguage.code)
  );

  const t = (key: TranslationKey) =>
    getTranslation(currentLanguage.code, key);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        isRtl,
        isModalOpen,
        setIsModalOpen,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
