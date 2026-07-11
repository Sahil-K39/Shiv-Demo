"use client";

import React, { useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";

// Comprehensive multi-language phrase book for instant DOM text translation fallback
const DICTIONARY: Record<string, Record<string, string>> = {
  hi: {
    "WHOLESALE BUYING ROOM": "थोक क्रय कक्ष",
    "DECONSTRUCTED AVANT-GARDE": "आधुनिक सेरेमोनियल परिधान",
    "THE COUNCIL OF LIGHT": "प्रकाश की परिषद",
    "SS26 WHOLESALE COLLECTION": "SS26 थोक संग्रह",
    "SS26 CAMPAIGN LAUNCH": "SS26 अभियान शुरुआत",
    "IN STOCK": "उपलब्ध है",
    "OUT OF STOCK": "स्टॉक में नहीं",
    "ADD TO ENQUIRY": "पूछताछ में जोड़ें",
    "EXPLORE COLLECTION": "संग्रह देखें",
    "EXPLORE WHOLESALE CATALOGUE": "थोक कैटलॉग देखें",
    "WHOLESALE": "थोक",
    "FABRIC SELLING": "वस्त्र विक्रय",
    "COUNCIL": "परिषद",
    "SEARCH": "खोजें",
    "ACCOUNT": "खाता",
    "CATEGORIES": "श्रेणियां",
    "WHOLESALE BUYING": "थोक खरीदारी",
    "SHIVA / MEN": "शिव / पुरुष",
    "SHAKTI / WOMEN": "शक्ति / महिलाएं",
    "ARMOR / CEREMONIAL": "कवच / अनुष्ठानिक",
  },
  ar: {
    "WHOLESALE BUYING ROOM": "غرفة البيع بالجملة",
    "DECONSTRUCTED AVANT-GARDE": "أزياء طليعية فاخرة",
    "THE COUNCIL OF LIGHT": "مجلس النور",
    "SS26 WHOLESALE COLLECTION": "مجموعة الجملة لموسم ربيع وصيف 26",
    "SS26 CAMPAIGN LAUNCH": "إطلاق حملة SS26",
    "IN STOCK": "متوفر في المخزون",
    "OUT OF STOCK": "غير متوفر",
    "ADD TO ENQUIRY": "إضافة إلى الاستفسار",
    "EXPLORE COLLECTION": "استعرض المجموعة",
    "EXPLORE WHOLESALE CATALOGUE": "استعرض كتالوج الجملة",
    "WHOLESALE": "البيع بالجملة",
    "FABRIC SELLING": "بيع الأقمشة",
    "COUNCIL": "المجلس",
    "SEARCH": "بحث",
    "ACCOUNT": "الحساب",
    "CATEGORIES": "الفئات",
    "WHOLESALE BUYING": "شراء بالجملة",
    "SHIVA / MEN": "شيفا / رجال",
    "SHAKTI / WOMEN": "شاكتي / نساء",
    "ARMOR / CEREMONIAL": "دروع / احتفالي",
  },
  es: {
    "WHOLESALE BUYING ROOM": "SALA DE COMPRA MAYORISTA",
    "DECONSTRUCTED AVANT-GARDE": "VANGUARDIA DECONSTRUIDA",
    "THE COUNCIL OF LIGHT": "EL CONSEJO DE LA LUZ",
    "SS26 WHOLESALE COLLECTION": "COLECCIÓN MAYORISTA SS26",
    "SS26 CAMPAIGN LAUNCH": "LANZAMIENTO DE CAMPAÑA SS26",
    "IN STOCK": "EN STOCK",
    "OUT OF STOCK": "AGOTADO",
    "ADD TO ENQUIRY": "AÑADIR A CONSULTA",
    "EXPLORE COLLECTION": "EXPLORAR COLECCIÓN",
    "EXPLORE WHOLESALE CATALOGUE": "EXPLORAR CATÁLOGO MAYORISTA",
    "WHOLESALE": "MAYORISTA",
    "FABRIC SELLING": "VENTA DE TELAS",
    "COUNCIL": "CONSEJO",
    "SEARCH": "BUSCAR",
    "ACCOUNT": "CUENTA",
    "CATEGORIES": "CATEGORÍAS",
    "WHOLESALE BUYING": "COMPRA MAYORISTA",
    "SHIVA / MEN": "SHIVA / HOMBRE",
    "SHAKTI / WOMEN": "SHAKTI / MUJER",
    "ARMOR / CEREMONIAL": "ARMADURA / CEREMONIAL",
  },
  fr: {
    "WHOLESALE BUYING ROOM": "SALLE D'ACHAT GROSSISTE",
    "DECONSTRUCTED AVANT-GARDE": "AVANT-GARDE DÉCONSTRUITE",
    "THE COUNCIL OF LIGHT": "LE CONSEIL DE LA LUMIÈRE",
    "SS26 WHOLESALE COLLECTION": "COLLECTION GROSSISTE SS26",
    "SS26 CAMPAIGN LAUNCH": "LANCEMENT DE CAMPAGNE SS26",
    "IN STOCK": "EN STOCK",
    "OUT OF STOCK": "RUPTURE DE STOCK",
    "ADD TO ENQUIRY": "AJOUTER À LA DEMANDE",
    "EXPLORE COLLECTION": "EXPLORER LA COLLECTION",
    "EXPLORE WHOLESALE CATALOGUE": "EXPLORER LE CATALOGUE GROSSISTE",
    "WHOLESALE": "GROSSISTE",
    "FABRIC SELLING": "VENTE DE TISSUS",
    "COUNCIL": "CONSEIL",
    "SEARCH": "RECHERCHER",
    "ACCOUNT": "COMPTE",
    "CATEGORIES": "CATÉGORIES",
    "WHOLESALE BUYING": "ACHAT EN GROS",
    "SHIVA / MEN": "SHIVA / HOMME",
    "SHAKTI / WOMEN": "SHAKTI / FEMME",
    "ARMOR / CEREMONIAL": "ARMURE / CÉRÉMONIEL",
  },
  de: {
    "WHOLESALE BUYING ROOM": "GROSSHANDEL RAUM",
    "DECONSTRUCTED AVANT-GARDE": "DEKONSTRUIERTE AVANTGARDE",
    "THE COUNCIL OF LIGHT": "DER RAT DES LICHTS",
    "SS26 WHOLESALE COLLECTION": "SS26 GROSSHANDELSKOLLEKTION",
    "SS26 CAMPAIGN LAUNCH": "SS26 KAMPAGNENSTART",
    "IN STOCK": "AUF LAGER",
    "OUT OF STOCK": "AUSVERKAUFT",
    "ADD TO ENQUIRY": "ZUR ANFRAGE HINZUFÜGEN",
    "EXPLORE COLLECTION": "KOLLEKTION ENTDECKEN",
    "EXPLORE WHOLESALE CATALOGUE": "GROSSHANDELSKATALOG ENTDECKEN",
    "WHOLESALE": "GROSSHANDEL",
    "FABRIC SELLING": "STOFFVERKAUF",
    "COUNCIL": "RAT",
    "SEARCH": "SUCHE",
    "ACCOUNT": "KONTO",
    "CATEGORIES": "KATEGORIEN",
    "WHOLESALE BUYING": "GROSSHANDELSEINKAUF",
    "SHIVA / MEN": "SHIVA / HERREN",
    "SHAKTI / WOMEN": "SHAKTI / DAMEN",
    "ARMOR / CEREMONIAL": "RÜSTUNG / ZEREMONIELL",
  },
  ja: {
    "WHOLESALE BUYING ROOM": "ホールセール バイング ルーム",
    "DECONSTRUCTED AVANT-GARDE": "アバンギャルドの再構築",
    "THE COUNCIL OF LIGHT": "光の評議会",
    "SS26 WHOLESALE COLLECTION": "SS26 ホールセールコレクション",
    "SS26 CAMPAIGN LAUNCH": "SS26 キャンペーン開始",
    "IN STOCK": "在庫あり",
    "OUT OF STOCK": "在庫切れ",
    "ADD TO ENQUIRY": "お問い合わせに追加",
    "EXPLORE COLLECTION": "コレクションを見る",
    "EXPLORE WHOLESALE CATALOGUE": "カタログを見る",
    "WHOLESALE": "ホールセール",
    "FABRIC SELLING": "ファブリック販売",
    "COUNCIL": "カウンシル",
    "SEARCH": "検索",
    "ACCOUNT": "アカウント",
    "CATEGORIES": "カテゴリー",
    "WHOLESALE BUYING": "ホールセール仕入れ",
    "SHIVA / MEN": "SHIVA / メンズ",
    "SHAKTI / WOMEN": "SHAKTI / レディース",
    "ARMOR / CEREMONIAL": "アーマー / 儀礼",
  },
  zh: {
    "WHOLESALE BUYING ROOM": "批发选款室",
    "DECONSTRUCTED AVANT-GARDE": "解构前卫美学",
    "THE COUNCIL OF LIGHT": "光明理事会",
    "SS26 WHOLESALE COLLECTION": "SS26 批发系列",
    "SS26 CAMPAIGN LAUNCH": "SS26 广告发布",
    "IN STOCK": "现货供应",
    "OUT OF STOCK": "暂时缺货",
    "ADD TO ENQUIRY": "加入订购清单",
    "EXPLORE COLLECTION": "浏览系列",
    "EXPLORE WHOLESALE CATALOGUE": "浏览批发总目录",
    "WHOLESALE": "批发",
    "FABRIC SELLING": "面料销售",
    "COUNCIL": "理事会",
    "SEARCH": "搜索",
    "ACCOUNT": "账户",
    "CATEGORIES": "分类",
    "WHOLESALE BUYING": "批发选购",
    "SHIVA / MEN": "湿婆 / 男装",
    "SHAKTI / WOMEN": "萨克蒂 / 女装",
    "ARMOR / CEREMONIAL": "概念战甲 / 典礼装",
  },
  ru: {
    "WHOLESALE BUYING ROOM": "ЗАЛ ОПТОВЫХ ЗАКУПОК",
    "DECONSTRUCTED AVANT-GARDE": "ДЕКОНСТРУИРОВАННЫЙ АВАНГАРД",
    "THE COUNCIL OF LIGHT": "СОВЕТ СВЕТА",
    "SS26 WHOLESALE COLLECTION": "ОПТОВАЯ КОЛЛЕКЦИЯ SS26",
    "SS26 CAMPAIGN LAUNCH": "ЗАПУСК КАМПАНИИ SS26",
    "IN STOCK": "В НАЛИЧИИ",
    "OUT OF STOCK": "НЕТ В НАЛИЧИИ",
    "ADD TO ENQUIRY": "ДОБАВИТЬ В ЗАПРОС",
    "EXPLORE COLLECTION": "СМОТРЕТЬ КОЛЛЕКЦИЮ",
    "EXPLORE WHOLESALE CATALOGUE": "ОТКРЫТЬ ОПТОВЫЙ КАТАЛОГ",
    "WHOLESALE": "ОПТ",
    "FABRIC SELLING": "ПРОДАЖА ТКАНЕЙ",
    "COUNCIL": "СОВЕТ",
    "SEARCH": "ПОИСК",
    "ACCOUNT": "АККАУНТ",
    "CATEGORIES": "КАТЕГОРИИ",
    "WHOLESALE BUYING": "ОПТОВЫЕ ЗАКУПКИ",
    "SHIVA / MEN": "ШИВА / МУЖЧИНЫ",
    "SHAKTI / WOMEN": "ШАКТИ / ЖЕНЩИНЫ",
    "ARMOR / CEREMONIAL": "БРОНЯ / ЦЕРЕМОНИАЛЬНОЕ",
  },
};

export default function AutoTranslator() {
  const { currentLanguage } = useLanguage();
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!scriptLoaded.current && typeof window !== "undefined") {
      scriptLoaded.current = true;
      (window as any).googleTranslateElementInit = () => {
        try {
          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: "en",
              autoDisplay: false,
            },
            "google_translate_hidden_container"
          );
        } catch {}
      };

      if (!document.getElementById("google-translate-script")) {
        const script = document.createElement("script");
        script.id = "google-translate-script";
        script.src =
          "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.head.appendChild(script);
      }
    }
  }, []);

  useEffect(() => {
    const code = currentLanguage.code;

    // 1. Sync googtrans cookie
    try {
      if (code === "en") {
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + window.location.hostname + "; path=/;";
      } else {
        document.cookie = `googtrans=/en/${code}; path=/;`;
        document.cookie = `googtrans=/en/${code}; domain=` + window.location.hostname + `; path=/;`;
      }
    } catch {}

    // 2. Poll & trigger Google Translate engine (.goog-te-combo) so the entire page transforms instantly
    let attempts = 0;
    const triggerGoogleTranslate = () => {
      const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (select) {
        select.value = code;
        select.dispatchEvent(new Event("change"));
        return true;
      }
      return false;
    };

    if (!triggerGoogleTranslate()) {
      const interval = setInterval(() => {
        attempts++;
        if (triggerGoogleTranslate() || attempts >= 12) {
          clearInterval(interval);
        }
      }, 250);
    }

    // 3. Instant client-side DOM phrase translation
    const targetDict = DICTIONARY[code] || DICTIONARY[code.split("-")[0]];
    if (targetDict) {
      const walkAndTranslate = () => {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null
        );
        let node: Node | null;
        while ((node = walker.nextNode())) {
          if (!node.nodeValue) continue;
          let text = node.nodeValue;
          let changed = false;
          Object.entries(targetDict).forEach(([eng, translated]) => {
            if (text.includes(eng)) {
              text = text.replaceAll(eng, translated);
              changed = true;
            }
          });
          if (changed) {
            node.nodeValue = text;
          }
        }
      };
      setTimeout(walkAndTranslate, 40);
    }
  }, [currentLanguage]);

  return (
    <>
      <div
        id="google_translate_hidden_container"
        className="hidden opacity-0 pointer-events-none absolute -top-96"
        aria-hidden="true"
      />
      <style jsx global>{`
        /* Hide Google Translate ugly top frame */
        .goog-te-banner-frame.skiptranslate,
        .goog-te-gadget-icon {
          display: none !important;
        }
        body {
          top: 0px !important;
        }
        .goog-tooltip {
          display: none !important;
        }
        .goog-tooltip:hover {
          display: none !important;
        }
        .goog-text-highlight {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </>
  );
}
