export interface Language {
  code: string;
  name: string;
  nativeName: string;
  region:
    | "global"
    | "indian"
    | "mideast_central"
    | "european"
    | "southeast_asian"
    | "african";
  rtl?: boolean;
}

export const REGION_LABELS: Record<string, string> = {
  all: "All Languages",
  global: "Global / Major",
  indian: "Indian Regional",
  mideast_central: "Middle East & Central Asia",
  european: "European & Nordic",
  southeast_asian: "Southeast Asian & Pacific",
  african: "African",
};

export const LANGUAGES: Language[] = [
  // Global / Major World Languages
  { code: "en", name: "English", nativeName: "English", region: "global" },
  { code: "es", name: "Spanish", nativeName: "Español", region: "global" },
  { code: "fr", name: "French", nativeName: "Français", region: "global" },
  { code: "de", name: "German", nativeName: "Deutsch", region: "global" },
  {
    code: "zh-CN",
    name: "Chinese (Simplified)",
    nativeName: "简体中文",
    region: "global",
  },
  {
    code: "zh-TW",
    name: "Chinese (Traditional)",
    nativeName: "繁體中文",
    region: "global",
  },
  { code: "ja", name: "Japanese", nativeName: "日本語", region: "global" },
  { code: "ru", name: "Russian", nativeName: "Русский", region: "global" },
  { code: "pt", name: "Portuguese", nativeName: "Português", region: "global" },
  { code: "it", name: "Italian", nativeName: "Italiano", region: "global" },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    region: "global",
    rtl: true,
  },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", region: "global" },
  { code: "ko", name: "Korean", nativeName: "한국어", region: "global" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", region: "global" },
  {
    code: "vi",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    region: "global",
  },
  {
    code: "id",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    region: "global",
  },

  // Indian Regional Languages
  { code: "bn", name: "Bengali", nativeName: "বাংলা", region: "indian" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", region: "indian" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", region: "indian" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", region: "indian" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", region: "indian" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", region: "indian" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", region: "indian" },
  {
    code: "ur",
    name: "Urdu",
    nativeName: "اردو",
    region: "indian",
    rtl: true,
  },

  // Middle Eastern & Central/South Asian
  {
    code: "he",
    name: "Hebrew",
    nativeName: "עברית",
    region: "mideast_central",
    rtl: true,
  },
  {
    code: "fa",
    name: "Persian (Farsi)",
    nativeName: "فارسی",
    region: "mideast_central",
    rtl: true,
  },
  {
    code: "ps",
    name: "Pashto",
    nativeName: "پښتو",
    region: "mideast_central",
    rtl: true,
  },
  {
    code: "ku",
    name: "Kurdish",
    nativeName: "Kurdî / کوردی",
    region: "mideast_central",
  },
  {
    code: "kk",
    name: "Kazakh",
    nativeName: "Қазақша",
    region: "mideast_central",
  },
  {
    code: "ky",
    name: "Kyrgyz",
    nativeName: "Кыргызча",
    region: "mideast_central",
  },
  { code: "tg", name: "Tajik", nativeName: "Тоҷикӣ", region: "mideast_central" },
  {
    code: "uz",
    name: "Uzbek",
    nativeName: "Oʻzbekcha",
    region: "mideast_central",
  },

  // European & Nordic
  { code: "nl", name: "Dutch", nativeName: "Nederlands", region: "european" },
  { code: "pl", name: "Polish", nativeName: "Polski", region: "european" },
  {
    code: "uk",
    name: "Ukrainian",
    nativeName: "Українська",
    region: "european",
  },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", region: "european" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", region: "european" },
  { code: "no", name: "Norwegian", nativeName: "Norsk", region: "european" },
  { code: "da", name: "Danish", nativeName: "Dansk", region: "european" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", region: "european" },
  { code: "cs", name: "Czech", nativeName: "Čeština", region: "european" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", region: "european" },
  { code: "ro", name: "Romanian", nativeName: "Română", region: "european" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina", region: "european" },
  {
    code: "bg",
    name: "Bulgarian",
    nativeName: "Български",
    region: "european",
  },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski", region: "european" },
  { code: "sr", name: "Serbian", nativeName: "Српски", region: "european" },
  {
    code: "sl",
    name: "Slovenian",
    nativeName: "Slovenščina",
    region: "european",
  },
  { code: "et", name: "Estonian", nativeName: "Eesti", region: "european" },
  { code: "lv", name: "Latvian", nativeName: "Latviešu", region: "european" },
  {
    code: "lt",
    name: "Lithuanian",
    nativeName: "Lietuvių",
    region: "european",
  },
  { code: "sq", name: "Albanian", nativeName: "Shqip", region: "european" },
  { code: "hy", name: "Armenian", nativeName: "Հայերեն", region: "european" },
  {
    code: "az",
    name: "Azerbaijani",
    nativeName: "Azərbaycan",
    region: "european",
  },
  { code: "eu", name: "Basque", nativeName: "Euskara", region: "european" },
  {
    code: "be",
    name: "Belarusian",
    nativeName: "Беларуская",
    region: "european",
  },
  { code: "bs", name: "Bosnian", nativeName: "Bosanski", region: "european" },
  { code: "ca", name: "Catalan", nativeName: "Català", region: "european" },
  { code: "ka", name: "Georgian", nativeName: "Քարթվելի", region: "european" },
  { code: "is", name: "Icelandic", nativeName: "Íslenska", region: "european" },
  { code: "ga", name: "Irish", nativeName: "Gaeilge", region: "european" },
  { code: "la", name: "Latin", nativeName: "Latina", region: "european" },
  {
    code: "mk",
    name: "Macedonian",
    nativeName: "Македонски",
    region: "european",
  },
  { code: "mt", name: "Maltese", nativeName: "Malti", region: "european" },
  { code: "cy", name: "Welsh", nativeName: "Cymraeg", region: "european" },
  {
    code: "yi",
    name: "Yiddish",
    nativeName: "ייִדיש",
    region: "european",
    rtl: true,
  },

  // Southeast Asian & Pacific
  {
    code: "ms",
    name: "Malay",
    nativeName: "Bahasa Melayu",
    region: "southeast_asian",
  },
  { code: "th", name: "Thai", nativeName: "ไทย", region: "southeast_asian" },
  {
    code: "tl",
    name: "Filipino (Tagalog)",
    nativeName: "Tagalog",
    region: "southeast_asian",
  },
  {
    code: "my",
    name: "Burmese",
    nativeName: "မြန်မာစာ",
    region: "southeast_asian",
  },
  { code: "km", name: "Khmer", nativeName: "ខ្មែរ", region: "southeast_asian" },
  { code: "lo", name: "Lao", nativeName: "ລາວ", region: "southeast_asian" },
  {
    code: "jv",
    name: "Javanese",
    nativeName: "Basa Jawa",
    region: "southeast_asian",
  },
  {
    code: "su",
    name: "Sundanese",
    nativeName: "Basa Sunda",
    region: "southeast_asian",
  },
  {
    code: "si",
    name: "Sinhala",
    nativeName: "සිංහල",
    region: "southeast_asian",
  },
  {
    code: "ne",
    name: "Nepali",
    nativeName: "नेपाली",
    region: "southeast_asian",
  },
  {
    code: "mi",
    name: "Maori",
    nativeName: "Te Reo Māori",
    region: "southeast_asian",
  },

  // African Languages
  {
    code: "sw",
    name: "Swahili",
    nativeName: "Kiswahili",
    region: "african",
  },
  { code: "am", name: "Amharic", nativeName: "አማርኛ", region: "african" },
  {
    code: "af",
    name: "Afrikaans",
    nativeName: "Afrikaans",
    region: "african",
  },
  { code: "ha", name: "Hausa", nativeName: "Hausa", region: "african" },
  {
    code: "mg",
    name: "Malagasy",
    nativeName: "Malagasy",
    region: "african",
  },
  { code: "so", name: "Somali", nativeName: "Soomaali", region: "african" },
  { code: "xh", name: "Xhosa", nativeName: "IsiXhosa", region: "african" },
  { code: "yo", name: "Yoruba", nativeName: "Yorùbá", region: "african" },
  { code: "zu", name: "Zulu", nativeName: "IsiZulu", region: "african" },
];

export const RTL_LANGUAGES = new Set([
  "ar",
  "he",
  "fa",
  "ur",
  "ps",
  "yi",
]);

export function getLanguageByCode(code: string): Language {
  return (
    LANGUAGES.find((lang) => lang.code === code) ||
    LANGUAGES[0] // Default English
  );
}
