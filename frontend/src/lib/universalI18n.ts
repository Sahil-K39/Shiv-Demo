import { ALL_86_TRANSLATIONS } from "./all86Translations";
import { TRANSLATIONS, TranslationKey } from "./translations";
import { PAGE_TRANSLATIONS } from "./pageTranslations";

/**
 * Universal lookup across all 86 languages for any UI / Page / Product key.
 */
export function getUniversalTranslation(langCode: string, key: string): string {
  if (!langCode || langCode === "en") return key;

  const codeExact = langCode;
  const codePrefix = langCode.split("-")[0];

  // 1. Check ALL_86_TRANSLATIONS exact or prefix
  const dict86 = ALL_86_TRANSLATIONS[codeExact] || ALL_86_TRANSLATIONS[codePrefix];
  if (dict86 && dict86[key] && dict86[key] !== key) {
    return dict86[key];
  }

  // 2. Check TRANSLATIONS exact or prefix
  const dictCore = (TRANSLATIONS as any)[codeExact] || (TRANSLATIONS as any)[codePrefix];
  if (dictCore && dictCore[key] && dictCore[key] !== key) {
    return dictCore[key];
  }

  // 3. Check PAGE_TRANSLATIONS exact or prefix
  const dictPage = (PAGE_TRANSLATIONS as any)[codeExact] || (PAGE_TRANSLATIONS as any)[codePrefix];
  if (dictPage && dictPage[key] && dictPage[key] !== key) {
    return dictPage[key];
  }

  return key;
}
