import { TRANSLATIONS_ALL } from "./translationsAll86";

export type TranslationKey =
  | "nav.shiva"
  | "nav.shakti"
  | "nav.wholesale"
  | "nav.fabric"
  | "nav.council"
  | "nav.search"
  | "nav.account"
  | "nav.bag"
  | "nav.languageRegion"
  | "hero.subtitle"
  | "hero.title"
  | "hero.description"
  | "hero.cta"
  | "hero.lookbook"
  | "home.categories"
  | "home.ss26Live"
  | "home.newStuff"
  | "home.wholesaleBuying"
  | "home.shivaMen"
  | "home.shaktiWomen"
  | "home.armorCeremonial"
  | "home.deconstructed"
  | "home.knitsHeavy"
  | "home.knitsLight"
  | "home.robesCoats"
  | "home.wholesaleBuyingRoom"
  | "home.moqDescription"
  | "home.globalShipping"
  | "home.enterBuyingRoom"
  | "home.collection"
  | "home.ss26WholesaleOpen"
  | "home.minimumOrder"
  | "home.moqUnits"
  | "home.dispatch"
  | "home.globalExpress"
  | "home.marquee"
  | "home.directFromShowroom"
  | "home.featuredStyles"
  | "home.all"
  | "home.viewCatalogue"
  | "home.ss26Menswear"
  | "home.shivaDeconstructed"
  | "home.shivaDesc"
  | "home.exploreShiva"
  | "home.ss26Womenswear"
  | "home.shaktiSilhouettes"
  | "home.shaktiDesc"
  | "home.exploreShakti"
  | "products.inStock"
  | "products.outOfStock"
  | "products.addToEnquiry"
  | "products.viewDetails"
  | "product.soldOut"
  | "product.new"
  | "product.preorder"
  | "footer.collections"
  | "footer.information"
  | "footer.tagline"
  | "footer.transmission"
  | "footer.desc"
  | "footer.contact"
  | "footer.rights"
  | "footer.shakti"
  | "footer.shiva"
  | "footer.fabricSelling"
  | "footer.theCouncil"
  | "footer.shippingReturns"
  | "footer.termsOfService"
  | "footer.privacyPolicy"
  | "footer.contactLink"
  | "language.select"
  | "language.searchPlaceholder";

export type TranslationMap = Record<TranslationKey, string>;

export const TRANSLATIONS: Record<string, TranslationMap> = {
  en: {
    "nav.shiva": "SHIVA",
    "nav.shakti": "SHAKTI",
    "nav.wholesale": "WHOLESALE",
    "nav.fabric": "FABRIC SELLING",
    "nav.council": "COUNCIL",
    "nav.search": "SEARCH",
    "nav.account": "ACCOUNT",
    "nav.bag": "ENQUIRY BAG",
    "nav.languageRegion": "Language / Region",
    "hero.subtitle": "SS26 WHOLESALE COLLECTION",
    "hero.title": "DECONSTRUCTED AVANT-GARDE",
    "hero.description": "Ceremonial silhouettes, ritual textures, and architectural drapery for the Council of Light.",
    "hero.cta": "EXPLORE WHOLESALE CATALOGUE",
    "hero.lookbook": "SEASONAL ARCHIVE",
    "home.categories": "CATEGORIES",
    "home.ss26Live": "SS26 LIVE",
    "home.newStuff": "*NEW STUFF",
    "home.wholesaleBuying": "WHOLESALE BUYING",
    "home.shivaMen": "SHIVA / MEN",
    "home.shaktiWomen": "SHAKTI / WOMEN",
    "home.armorCeremonial": "ARMOR / CEREMONIAL",
    "home.deconstructed": "DECONSTRUCTED",
    "home.knitsHeavy": "KNITS / HEAVY",
    "home.knitsLight": "KNITS / LIGHT",
    "home.robesCoats": "ROBES & COATS",
    "home.wholesaleBuyingRoom": "WHOLESALE BUYING ROOM",
    "home.moqDescription": "MOQ 20 UNITS PER STYLE across selected sizes & colorways.",
    "home.globalShipping": "Global expedited shipping for studio & boutique partners.",
    "home.enterBuyingRoom": "ENTER BUYING ROOM",
    "home.collection": "COLLECTION",
    "home.ss26WholesaleOpen": "SS26 WHOLESALE OPEN",
    "home.minimumOrder": "MINIMUM ORDER",
    "home.moqUnits": "MOQ 20 UNITS / STYLE",
    "home.dispatch": "DISPATCH",
    "home.globalExpress": "GLOBAL EXPRESS DELIVERY",
    "home.marquee": "SS26 WHOLESALE BUYING WINDOW OPEN",
    "home.directFromShowroom": "DIRECT FROM SHOWROOM",
    "home.featuredStyles": "FEATURED STYLES",
    "home.all": "ALL",
    "home.viewCatalogue": "VIEW ENTIRE WHOLESALE CATALOGUE",
    "home.ss26Menswear": "SS26 MENSWEAR",
    "home.shivaDeconstructed": "SHIVA / MEN — DECONSTRUCTED ARMOR",
    "home.shivaDesc": "Explore ceremonial coats, deconstructed knitwear, and modular silhouettes designed for movement.",
    "home.exploreShiva": "EXPLORE SHIVA COLLECTION",
    "home.ss26Womenswear": "SS26 WOMENSWEAR",
    "home.shaktiSilhouettes": "SHAKTI / WOMEN — SILHOUETTES OF LIGHT",
    "home.shaktiDesc": "Fluid draping, high-frequency organic cottons, and architectural layering for the modern consciousness.",
    "home.exploreShakti": "EXPLORE SHAKTI COLLECTION",
    "products.inStock": "IN STOCK",
    "products.outOfStock": "OUT OF STOCK",
    "products.addToEnquiry": "ADD TO ENQUIRY",
    "products.viewDetails": "VIEW SPECIFICATIONS",
    "product.soldOut": "Sold out",
    "product.new": "NEW",
    "product.preorder": "PREORDER",
    "footer.collections": "Collections",
    "footer.information": "Information",
    "footer.tagline": "Neo-primitive fashion for ritual silhouettes, structured layers, and limited seasonal releases.",
    "footer.transmission": "TRANSMISSION",
    "footer.desc": "Join the Council for early access to drops, fabric lots, and wholesale updates.",
    "footer.contact": "CONTACT SUPPORT",
    "footer.rights": "© 2026 SHIV SHAKTI PROJECT. ALL RIGHTS RESERVED.",
    "footer.shakti": "Shakti",
    "footer.shiva": "Shiva",
    "footer.fabricSelling": "Fabric Selling",
    "footer.theCouncil": "The Council",
    "footer.shippingReturns": "Shipping & Returns",
    "footer.termsOfService": "Terms of Service",
    "footer.privacyPolicy": "Privacy Policy",
    "footer.contactLink": "Contact",
    "language.select": "SELECT LANGUAGE",
    "language.searchPlaceholder": "Search language or region...",
  },
  hi: {
    "nav.shiva": "शिव",
    "nav.shakti": "शक्ति",
    "nav.wholesale": "थोक संग्रह",
    "nav.fabric": "वस्त्र विक्रय",
    "nav.council": "परिषद",
    "nav.search": "खोजें",
    "nav.account": "खाता",
    "nav.bag": "पूछताछ बैग",
    "nav.languageRegion": "भाषा / क्षेत्र",
    "hero.subtitle": "SS26 थोक संग्रह",
    "hero.title": "आधुनिक सेरेमोनियल परिधान",
    "hero.description": "प्रकाश की परिषद के लिए अनुष्ठानिक बनावट और आधुनिक वास्तुकला परिधान।",
    "hero.cta": "थोक कैटलॉग देखें",
    "hero.lookbook": "मौसमी संग्रह",
    "home.categories": "श्रेणियां",
    "home.ss26Live": "SS26 लाइव",
    "home.newStuff": "*नया संग्रह",
    "home.wholesaleBuying": "थोक खरीदारी",
    "home.shivaMen": "शिव / पुरुष",
    "home.shaktiWomen": "शक्ति / महिलाएं",
    "home.armorCeremonial": "कवच / अनुष्ठानिक",
    "home.deconstructed": "डीकंस्ट्रक्टेड",
    "home.knitsHeavy": "निटवेयर / भारी",
    "home.knitsLight": "निटवेयर / हल्का",
    "home.robesCoats": "रोब्स और कोट",
    "home.wholesaleBuyingRoom": "थोक क्रय कक्ष",
    "home.moqDescription": "चयनित साइज़ और रंगों में प्रति स्टाइल न्यूनतम 20 यूनिट।",
    "home.globalShipping": "स्टूडियो और बुटीक पार्टनर्स के लिए वैश्विक एक्सप्रेस शिपिंग।",
    "home.enterBuyingRoom": "क्रय कक्ष में प्रवेश करें",
    "home.collection": "संग्रह",
    "home.ss26WholesaleOpen": "SS26 थोक खुला है",
    "home.minimumOrder": "न्यूनतम आर्डर",
    "home.moqUnits": "न्यूनतम 20 यूनिट / स्टाइल",
    "home.dispatch": "प्रेषण",
    "home.globalExpress": "वैश्विक एक्सप्रेस डिलीवरी",
    "home.marquee": "SS26 थोक खरीदारी विंडो खुली है",
    "home.directFromShowroom": "शोरूम से सीधे",
    "home.featuredStyles": "प्रमुख स्टाइल",
    "home.all": "सभी",
    "home.viewCatalogue": "संपूर्ण थोक कैटलॉग देखें",
    "home.ss26Menswear": "SS26 पुरुष संग्रह",
    "home.shivaDeconstructed": "शिव / पुरुष — डीकंस्ट्रक्टेड आर्मर",
    "home.shivaDesc": "गति के लिए डिज़ाइन किए गए अनुष्ठानिक कोट, डीकंस्ट्रक्टेड निटवेयर और मॉड्यूलर सिल्हूट्स।",
    "home.exploreShiva": "शिव संग्रह देखें",
    "home.ss26Womenswear": "SS26 महिला संग्रह",
    "home.shaktiSilhouettes": "शक्ति / महिलाएं — प्रकाश की सिल्हूट्स",
    "home.shaktiDesc": "आधुनिक चेतना के लिए फ्लुइड ड्रेपिंग, ऑर्गेनिक कॉटन और आर्किटेक्चरल लेयरिंग।",
    "home.exploreShakti": "शक्ति संग्रह देखें",
    "products.inStock": "उपलब्ध है",
    "products.outOfStock": "स्टॉक में नहीं",
    "products.addToEnquiry": "पूछताछ में जोड़ें",
    "products.viewDetails": "विवरण देखें",
    "product.soldOut": "बिक गया",
    "product.new": "नया",
    "product.preorder": "प्री-ऑर्डर",
    "footer.collections": "संग्रह",
    "footer.information": "जानकारी",
    "footer.tagline": "अनुष्ठानिक सिल्हूट्स, संरचित परतों और सीमित मौसमी रिलीज़ के लिए नव-आदिम फैशन।",
    "footer.transmission": "संदेश प्रसारण",
    "footer.desc": "नए कलेक्शन और थोक अपडेट तक शीघ्र पहुंच के लिए परिषद से जुड़ें।",
    "footer.contact": "सहायता से संपर्क करें",
    "footer.rights": "© 2026 शिव शक्ति प्रोजेक्ट। सर्वाधिकार सुरक्षित।",
    "footer.shakti": "शक्ति",
    "footer.shiva": "शिव",
    "footer.fabricSelling": "वस्त्र विक्रय",
    "footer.theCouncil": "परिषद",
    "footer.shippingReturns": "शिपिंग और रिटर्न",
    "footer.termsOfService": "सेवा की शर्तें",
    "footer.privacyPolicy": "गोपनीयता नीति",
    "footer.contactLink": "संपर्क",
    "language.select": "भाषा चुनें",
    "language.searchPlaceholder": "भाषा या क्षेत्र खोजें...",
  },
  ar: {
    "nav.shiva": "شيفا",
    "nav.shakti": "شاكتي",
    "nav.wholesale": "البيع بالجملة",
    "nav.fabric": "بيع الأقمشة",
    "nav.council": "المجلس",
    "nav.search": "بحث",
    "nav.account": "الحساب",
    "nav.bag": "حقيبة الاستفسار",
    "nav.languageRegion": "اللغة / المنطقة",
    "hero.subtitle": "مجموعة الجملة لموسم ربيع وصيف 26",
    "hero.title": "أزياء طليعية فاخرة",
    "hero.description": "تصاميم استثنائية وأنسجة فاخرة ومستوحاة من التقاليد العريقة لمجلس النور.",
    "hero.cta": "استعرض كتالوج الجملة",
    "hero.lookbook": "الأرشيف الفصلي",
    "home.categories": "الفئات",
    "home.ss26Live": "SS26 مباشر",
    "home.newStuff": "*جديد",
    "home.wholesaleBuying": "شراء بالجملة",
    "home.shivaMen": "شيفا / رجال",
    "home.shaktiWomen": "شاكتي / نساء",
    "home.armorCeremonial": "دروع / احتفالي",
    "home.deconstructed": "تفكيكي",
    "home.knitsHeavy": "تريكو / ثقيل",
    "home.knitsLight": "تريكو / خفيف",
    "home.robesCoats": "عباءات ومعاطف",
    "home.wholesaleBuyingRoom": "صالة الشراء بالجملة",
    "home.moqDescription": "الحد الأدنى 20 وحدة لكل تصميم عبر المقاسات والألوان المحددة.",
    "home.globalShipping": "شحن سريع عالمي للاستوديوهات والبوتيكات.",
    "home.enterBuyingRoom": "دخول صالة الشراء",
    "home.collection": "المجموعة",
    "home.ss26WholesaleOpen": "SS26 الجملة مفتوح",
    "home.minimumOrder": "الحد الأدنى للطلب",
    "home.moqUnits": "الحد الأدنى 20 وحدة / تصميم",
    "home.dispatch": "الشحن",
    "home.globalExpress": "توصيل سريع عالمي",
    "home.marquee": "نافذة شراء الجملة SS26 مفتوحة",
    "home.directFromShowroom": "مباشرة من صالة العرض",
    "home.featuredStyles": "تصاميم مميزة",
    "home.all": "الكل",
    "home.viewCatalogue": "عرض كتالوج الجملة الكامل",
    "home.ss26Menswear": "أزياء رجالية SS26",
    "home.shivaDeconstructed": "شيفا / رجال — دروع تفكيكية",
    "home.shivaDesc": "معاطف احتفالية وتريكو تفكيكي وقصات معمارية مصممة للحركة.",
    "home.exploreShiva": "استكشف مجموعة شيفا",
    "home.ss26Womenswear": "أزياء نسائية SS26",
    "home.shaktiSilhouettes": "شاكتي / نساء — صور ظلية من نور",
    "home.shaktiDesc": "أقمشة انسيابية وقطن عضوي وطبقات معمارية للوعي المعاصر.",
    "home.exploreShakti": "استكشف مجموعة شاكتي",
    "products.inStock": "متوفر في المخزون",
    "products.outOfStock": "غير متوفر",
    "products.addToEnquiry": "إضافة إلى الاستفسار",
    "products.viewDetails": "عرض المواصفات",
    "product.soldOut": "نفذ",
    "product.new": "جديد",
    "product.preorder": "طلب مسبق",
    "footer.collections": "المجموعات",
    "footer.information": "المعلومات",
    "footer.tagline": "أزياء بدائية جديدة لقصات طقوسية وطبقات منظمة وإصدارات موسمية محدودة.",
    "footer.transmission": "الإشعارات",
    "footer.desc": "انضم إلى المجلس للحصول على وصول مبكر للإصدارات وتحديثات الجملة.",
    "footer.contact": "تواصل مع الدعم",
    "footer.rights": "© 2026 مشروع شيفا شاكتي. جميع الحقوق محفوظة.",
    "footer.shakti": "شاكتي",
    "footer.shiva": "شيفا",
    "footer.fabricSelling": "بيع الأقمشة",
    "footer.theCouncil": "المجلس",
    "footer.shippingReturns": "الشحن والإرجاع",
    "footer.termsOfService": "شروط الخدمة",
    "footer.privacyPolicy": "سياسة الخصوصية",
    "footer.contactLink": "اتصل بنا",
    "language.select": "اختر اللغة",
    "language.searchPlaceholder": "ابحث عن اللغة أو المنطقة...",
  },
  es: {
    "nav.shiva": "SHIVA", "nav.shakti": "SHAKTI", "nav.wholesale": "MAYORISTA", "nav.fabric": "VENTA DE TELAS", "nav.council": "CONSEJO", "nav.search": "BUSCAR", "nav.account": "CUENTA", "nav.bag": "BOLSA", "nav.languageRegion": "Idioma / Región",
    "hero.subtitle": "COLECCIÓN MAYORISTA SS26", "hero.title": "VANGUARDIA DECONSTRUIDA", "hero.description": "Siluetas ceremoniales, texturas rituales y arquitectura textil para el Consejo de la Luz.", "hero.cta": "EXPLORAR CATÁLOGO MAYORISTA", "hero.lookbook": "ARCHIVO DE TEMPORADA",
    "home.categories": "CATEGORÍAS", "home.ss26Live": "SS26 EN VIVO", "home.newStuff": "*NOVEDADES", "home.wholesaleBuying": "COMPRA MAYORISTA", "home.shivaMen": "SHIVA / HOMBRE", "home.shaktiWomen": "SHAKTI / MUJER", "home.armorCeremonial": "ARMADURA / CEREMONIAL", "home.deconstructed": "DECONSTRUIDO", "home.knitsHeavy": "PUNTO / PESADO", "home.knitsLight": "PUNTO / LIGERO", "home.robesCoats": "TÚNICAS Y ABRIGOS",
    "home.wholesaleBuyingRoom": "SALA DE COMPRA MAYORISTA", "home.moqDescription": "Pedido mínimo 20 unidades por estilo en tallas y colores seleccionados.", "home.globalShipping": "Envío exprés global para estudios y boutiques asociadas.", "home.enterBuyingRoom": "ENTRAR A LA SALA",
    "home.collection": "COLECCIÓN", "home.ss26WholesaleOpen": "MAYORISTA SS26 ABIERTO", "home.minimumOrder": "PEDIDO MÍNIMO", "home.moqUnits": "MÍN. 20 UNIDADES / ESTILO", "home.dispatch": "ENVÍO", "home.globalExpress": "ENVÍO EXPRÉS GLOBAL",
    "home.marquee": "VENTANA DE COMPRA MAYORISTA SS26 ABIERTA", "home.directFromShowroom": "DIRECTO DEL SHOWROOM", "home.featuredStyles": "ESTILOS DESTACADOS", "home.all": "TODOS", "home.viewCatalogue": "VER CATÁLOGO MAYORISTA COMPLETO",
    "home.ss26Menswear": "MODA MASCULINA SS26", "home.shivaDeconstructed": "SHIVA / HOMBRE — ARMADURA DECONSTRUIDA", "home.shivaDesc": "Abrigos ceremoniales, punto deconstruido y siluetas modulares diseñadas para el movimiento.", "home.exploreShiva": "EXPLORAR COLECCIÓN SHIVA",
    "home.ss26Womenswear": "MODA FEMENINA SS26", "home.shaktiSilhouettes": "SHAKTI / MUJER — SILUETAS DE LUZ", "home.shaktiDesc": "Drapeados fluidos, algodones orgánicos y capas arquitectónicas para la conciencia moderna.", "home.exploreShakti": "EXPLORAR COLECCIÓN SHAKTI",
    "products.inStock": "EN STOCK", "products.outOfStock": "AGOTADO", "products.addToEnquiry": "AÑADIR A CONSULTA", "products.viewDetails": "VER ESPECIFICACIONES",
    "product.soldOut": "Agotado", "product.new": "NUEVO", "product.preorder": "PREVENTA",
    "footer.collections": "Colecciones", "footer.information": "Información", "footer.tagline": "Moda neo-primitiva para siluetas rituales, capas estructuradas y lanzamientos estacionales limitados.",
    "footer.transmission": "TRANSMISIÓN", "footer.desc": "Únete al Consejo para obtener acceso anticipado a colecciones y novedades mayoristas.", "footer.contact": "CONTACTAR SOPORTE", "footer.rights": "© 2026 SHIV SHAKTI PROJECT. TODOS LOS DERECHOS RESERVADOS.",
    "footer.shakti": "Shakti", "footer.shiva": "Shiva", "footer.fabricSelling": "Venta de Telas", "footer.theCouncil": "El Consejo", "footer.shippingReturns": "Envíos y Devoluciones", "footer.termsOfService": "Términos de Servicio", "footer.privacyPolicy": "Política de Privacidad", "footer.contactLink": "Contacto",
    "language.select": "SELECCIONAR IDIOMA", "language.searchPlaceholder": "Buscar idioma o región...",
  },
  fr: {
    "nav.shiva": "SHIVA", "nav.shakti": "SHAKTI", "nav.wholesale": "GROSSISTE", "nav.fabric": "VENTE DE TISSUS", "nav.council": "CONSEIL", "nav.search": "RECHERCHER", "nav.account": "COMPTE", "nav.bag": "PANIER", "nav.languageRegion": "Langue / Région",
    "hero.subtitle": "COLLECTION GROSSISTE SS26", "hero.title": "AVANT-GARDE DÉCONSTRUITE", "hero.description": "Silhouettes cérémonielles, textures rituelles et draperies architecturales pour le Conseil de la Lumière.", "hero.cta": "EXPLORER LE CATALOGUE GROSSISTE", "hero.lookbook": "ARCHIVES SAISONNIÈRES",
    "home.categories": "CATÉGORIES", "home.ss26Live": "SS26 EN DIRECT", "home.newStuff": "*NOUVEAUTÉS", "home.wholesaleBuying": "ACHAT EN GROS", "home.shivaMen": "SHIVA / HOMME", "home.shaktiWomen": "SHAKTI / FEMME", "home.armorCeremonial": "ARMURE / CÉRÉMONIEL", "home.deconstructed": "DÉCONSTRUIT", "home.knitsHeavy": "MAILLES / ÉPAISSES", "home.knitsLight": "MAILLES / LÉGÈRES", "home.robesCoats": "ROBES ET MANTEAUX",
    "home.wholesaleBuyingRoom": "SALLE D'ACHAT GROSSISTE", "home.moqDescription": "Commande min. 20 unités par modèle dans les tailles et coloris sélectionnés.", "home.globalShipping": "Expédition express mondiale pour studios et boutiques partenaires.", "home.enterBuyingRoom": "ENTRER DANS LA SALLE",
    "home.collection": "COLLECTION", "home.ss26WholesaleOpen": "GROSSISTE SS26 OUVERT", "home.minimumOrder": "COMMANDE MINIMUM", "home.moqUnits": "MIN. 20 UNITÉS / MODÈLE", "home.dispatch": "EXPÉDITION", "home.globalExpress": "LIVRAISON EXPRESS MONDIALE",
    "home.marquee": "FENÊTRE D'ACHAT GROSSISTE SS26 OUVERTE", "home.directFromShowroom": "DIRECT DU SHOWROOM", "home.featuredStyles": "MODÈLES EN VEDETTE", "home.all": "TOUS", "home.viewCatalogue": "VOIR LE CATALOGUE GROSSISTE COMPLET",
    "home.ss26Menswear": "MODE HOMME SS26", "home.shivaDeconstructed": "SHIVA / HOMME — ARMURE DÉCONSTRUITE", "home.shivaDesc": "Manteaux cérémoniels, tricots déconstruits et silhouettes modulaires conçues pour le mouvement.", "home.exploreShiva": "EXPLORER LA COLLECTION SHIVA",
    "home.ss26Womenswear": "MODE FEMME SS26", "home.shaktiSilhouettes": "SHAKTI / FEMME — SILHOUETTES DE LUMIÈRE", "home.shaktiDesc": "Drapés fluides, cotons biologiques et superpositions architecturales pour la conscience moderne.", "home.exploreShakti": "EXPLORER LA COLLECTION SHAKTI",
    "products.inStock": "EN STOCK", "products.outOfStock": "RUPTURE DE STOCK", "products.addToEnquiry": "AJOUTER À LA DEMANDE", "products.viewDetails": "VOIR LES SPÉCIFICATIONS",
    "product.soldOut": "Épuisé", "product.new": "NOUVEAU", "product.preorder": "PRÉCOMMANDE",
    "footer.collections": "Collections", "footer.information": "Informations", "footer.tagline": "Mode néo-primitive pour silhouettes rituelles, couches structurées et sorties saisonnières limitées.",
    "footer.transmission": "TRANSMISSION", "footer.desc": "Rejoignez le Conseil pour un accès prioritaire aux nouvelles collections et mises à jour.", "footer.contact": "CONTACTER LE SUPPORT", "footer.rights": "© 2026 PROJET SHIV SHAKTI. TOUS DROITS RÉSERVÉS.",
    "footer.shakti": "Shakti", "footer.shiva": "Shiva", "footer.fabricSelling": "Vente de Tissus", "footer.theCouncil": "Le Conseil", "footer.shippingReturns": "Livraison et Retours", "footer.termsOfService": "Conditions de Service", "footer.privacyPolicy": "Politique de Confidentialité", "footer.contactLink": "Contact",
    "language.select": "CHOISIR LA LANGUE", "language.searchPlaceholder": "Rechercher une langue...",
  },
  de: {
    "nav.shiva": "SHIVA", "nav.shakti": "SHAKTI", "nav.wholesale": "GROSSHANDEL", "nav.fabric": "STOFFVERKAUF", "nav.council": "RAT", "nav.search": "SUCHE", "nav.account": "KONTO", "nav.bag": "ANFRAGE", "nav.languageRegion": "Sprache / Region",
    "hero.subtitle": "SS26 GROSSHANDELSKOLLEKTION", "hero.title": "DEKONSTRUIERTE AVANTGARDE", "hero.description": "Zeremonielle Silhouetten, rituelle Texturen und architektonische Drapierungen für den Rat des Lichts.", "hero.cta": "GROSSHANDELSKATALOG ENTDECKEN", "hero.lookbook": "SAISONARCHIV",
    "home.categories": "KATEGORIEN", "home.ss26Live": "SS26 LIVE", "home.newStuff": "*NEU", "home.wholesaleBuying": "GROSSHANDELSEINKAUF", "home.shivaMen": "SHIVA / HERREN", "home.shaktiWomen": "SHAKTI / DAMEN", "home.armorCeremonial": "RÜSTUNG / ZEREMONIELL", "home.deconstructed": "DEKONSTRUIERT", "home.knitsHeavy": "STRICK / SCHWER", "home.knitsLight": "STRICK / LEICHT", "home.robesCoats": "ROBEN & MÄNTEL",
    "home.wholesaleBuyingRoom": "GROSSHANDELSRAUM", "home.moqDescription": "Mindestbestellung 20 Einheiten pro Stil in ausgewählten Größen und Farben.", "home.globalShipping": "Weltweiter Expressversand für Studio- und Boutique-Partner.", "home.enterBuyingRoom": "RAUM BETRETEN",
    "home.collection": "KOLLEKTION", "home.ss26WholesaleOpen": "SS26 GROSSHANDEL OFFEN", "home.minimumOrder": "MINDESTBESTELLUNG", "home.moqUnits": "MIN. 20 EINHEITEN / STIL", "home.dispatch": "VERSAND", "home.globalExpress": "WELTWEITER EXPRESSVERSAND",
    "home.marquee": "SS26 GROSSHANDELSFENSTER GEÖFFNET", "home.directFromShowroom": "DIREKT AUS DEM SHOWROOM", "home.featuredStyles": "AUSGEWÄHLTE STILE", "home.all": "ALLE", "home.viewCatalogue": "GESAMTEN GROSSHANDELSKATALOG ANSEHEN",
    "home.ss26Menswear": "SS26 HERRENMODE", "home.shivaDeconstructed": "SHIVA / HERREN — DEKONSTRUIERTE RÜSTUNG", "home.shivaDesc": "Zeremonielle Mäntel, dekonstruierte Strickwaren und modulare Silhouetten für Bewegung.", "home.exploreShiva": "SHIVA KOLLEKTION ENTDECKEN",
    "home.ss26Womenswear": "SS26 DAMENMODE", "home.shaktiSilhouettes": "SHAKTI / DAMEN — SILHOUETTEN DES LICHTS", "home.shaktiDesc": "Fließende Draperien, Bio-Baumwolle und architektonische Schichtungen für das moderne Bewusstsein.", "home.exploreShakti": "SHAKTI KOLLEKTION ENTDECKEN",
    "products.inStock": "AUF LAGER", "products.outOfStock": "AUSVERKAUFT", "products.addToEnquiry": "ZUR ANFRAGE HINZUFÜGEN", "products.viewDetails": "SPEZIFIKATIONEN ANSEHEN",
    "product.soldOut": "Ausverkauft", "product.new": "NEU", "product.preorder": "VORBESTELLUNG",
    "footer.collections": "Kollektionen", "footer.information": "Informationen", "footer.tagline": "Neo-primitive Mode für rituelle Silhouetten, strukturierte Schichten und limitierte saisonale Veröffentlichungen.",
    "footer.transmission": "ÜBERTRAGUNG", "footer.desc": "Treten Sie dem Rat bei für exklusiven Zugang zu neuen Kollektionen und Großhandels-Updates.", "footer.contact": "SUPPORT KONTAKTIEREN", "footer.rights": "© 2026 SHIV SHAKTI PROJECT. ALLE RECHTE VORBEHALTEN.",
    "footer.shakti": "Shakti", "footer.shiva": "Shiva", "footer.fabricSelling": "Stoffverkauf", "footer.theCouncil": "Der Rat", "footer.shippingReturns": "Versand & Rückgabe", "footer.termsOfService": "Nutzungsbedingungen", "footer.privacyPolicy": "Datenschutzrichtlinie", "footer.contactLink": "Kontakt",
    "language.select": "SPRACHE WÄHLEN", "language.searchPlaceholder": "Sprache oder Region suchen...",
  },
  ja: {
    "nav.shiva": "SHIVA", "nav.shakti": "SHAKTI", "nav.wholesale": "ホールセール", "nav.fabric": "ファブリック販売", "nav.council": "カウンシル", "nav.search": "検索", "nav.account": "アカウント", "nav.bag": "お問い合わせバッグ", "nav.languageRegion": "言語 / 地域",
    "hero.subtitle": "SS26 ホールセールコレクション", "hero.title": "アバンギャルドの再構築", "hero.description": "光の評議会のためにデザインされた儀礼的シルエットと上質なテクスチャー。", "hero.cta": "カタログを見る", "hero.lookbook": "アーカイブ",
    "home.categories": "カテゴリー", "home.ss26Live": "SS26 ライブ", "home.newStuff": "*新着", "home.wholesaleBuying": "ホールセール仕入れ", "home.shivaMen": "SHIVA / メンズ", "home.shaktiWomen": "SHAKTI / レディース", "home.armorCeremonial": "アーマー / 儀礼", "home.deconstructed": "デコンストラクション", "home.knitsHeavy": "ニット / ヘビー", "home.knitsLight": "ニット / ライト", "home.robesCoats": "ローブ＆コート",
    "home.wholesaleBuyingRoom": "ホールセール バイング ルーム", "home.moqDescription": "1スタイルにつき最低20点、選択サイズ・カラーにて。", "home.globalShipping": "スタジオ・ブティックパートナー向け国際エクスプレス配送。", "home.enterBuyingRoom": "バイングルームへ",
    "home.collection": "コレクション", "home.ss26WholesaleOpen": "SS26 ホールセール受付中", "home.minimumOrder": "最低注文数", "home.moqUnits": "最低20点 / スタイル", "home.dispatch": "発送", "home.globalExpress": "国際エクスプレス配送",
    "home.marquee": "SS26 ホールセール受注窓口オープン", "home.directFromShowroom": "ショールームから直接", "home.featuredStyles": "注目のスタイル", "home.all": "すべて", "home.viewCatalogue": "ホールセールカタログ全体を見る",
    "home.ss26Menswear": "SS26 メンズウェア", "home.shivaDeconstructed": "SHIVA / メンズ — デコンストラクテッド アーマー", "home.shivaDesc": "セレモニアルコート、デコンストラクテッドニット、動きのためのモジュラーシルエット。", "home.exploreShiva": "SHIVAコレクションを見る",
    "home.ss26Womenswear": "SS26 レディースウェア", "home.shaktiSilhouettes": "SHAKTI / レディース — 光のシルエット", "home.shaktiDesc": "流動的なドレープ、オーガニックコットン、モダンな意識のためのアーキテクチュラルレイヤリング。", "home.exploreShakti": "SHAKTIコレクションを見る",
    "products.inStock": "在庫あり", "products.outOfStock": "在庫切れ", "products.addToEnquiry": "お問い合わせに追加", "products.viewDetails": "詳細を見る",
    "product.soldOut": "完売", "product.new": "新着", "product.preorder": "予約",
    "footer.collections": "コレクション", "footer.information": "インフォメーション", "footer.tagline": "儀礼的シルエット、構造化レイヤー、限定シーズナルリリースのためのネオプリミティブファッション。",
    "footer.transmission": "ニュースレター", "footer.desc": "新コレクションやホールセール情報へ早期アクセスするためにカウンシルに参加してください。", "footer.contact": "サポートにお問い合わせ", "footer.rights": "© 2026 SHIV SHAKTI PROJECT. ALL RIGHTS RESERVED.",
    "footer.shakti": "Shakti", "footer.shiva": "Shiva", "footer.fabricSelling": "ファブリック販売", "footer.theCouncil": "カウンシル", "footer.shippingReturns": "配送と返品", "footer.termsOfService": "利用規約", "footer.privacyPolicy": "プライバシーポリシー", "footer.contactLink": "お問い合わせ",
    "language.select": "言語を選択", "language.searchPlaceholder": "言語や地域を検索...",
  },
  zh: {
    "nav.shiva": "湿婆 (SHIVA)", "nav.shakti": "萨克蒂 (SHAKTI)", "nav.wholesale": "批发目录", "nav.fabric": "面料定制", "nav.council": "理事会", "nav.search": "搜索", "nav.account": "账户", "nav.bag": "咨询袋", "nav.languageRegion": "语言 / 地区",
    "hero.subtitle": "SS26 批发系列", "hero.title": "解构前卫美学", "hero.description": "专为光明理事会打造的仪式感剪裁、独家理疗质感与建筑学立体垂坠设计。", "hero.cta": "浏览批发总目录", "hero.lookbook": "季度档案",
    "home.categories": "分类", "home.ss26Live": "SS26 上线", "home.newStuff": "*新品", "home.wholesaleBuying": "批发选购", "home.shivaMen": "湿婆 / 男装", "home.shaktiWomen": "萨克蒂 / 女装", "home.armorCeremonial": "概念战甲 / 典礼装", "home.deconstructed": "解构", "home.knitsHeavy": "针织 / 厚款", "home.knitsLight": "针织 / 薄款", "home.robesCoats": "长袍与外套",
    "home.wholesaleBuyingRoom": "批发选款室", "home.moqDescription": "每款起订20件，可选择尺码与配色。", "home.globalShipping": "面向工作室与精品店合作伙伴的全球快递。", "home.enterBuyingRoom": "进入选款室",
    "home.collection": "系列", "home.ss26WholesaleOpen": "SS26 批发开放", "home.minimumOrder": "最低订量", "home.moqUnits": "最低20件 / 款式", "home.dispatch": "发货", "home.globalExpress": "全球快递配送",
    "home.marquee": "SS26 批发订购窗口已开放", "home.directFromShowroom": "展厅直供", "home.featuredStyles": "精选款式", "home.all": "全部", "home.viewCatalogue": "查看完整批发目录",
    "home.ss26Menswear": "SS26 男装", "home.shivaDeconstructed": "湿婆 / 男装 — 解构战甲", "home.shivaDesc": "探索仪式感外套、解构针织和为运动而设计的模块化廓形。", "home.exploreShiva": "探索SHIVA系列",
    "home.ss26Womenswear": "SS26 女装", "home.shaktiSilhouettes": "萨克蒂 / 女装 — 光的廓形", "home.shaktiDesc": "流动垂坠、有机棉面料和为现代意识打造的建筑感层次。", "home.exploreShakti": "探索SHAKTI系列",
    "products.inStock": "现货供应", "products.outOfStock": "暂时缺货", "products.addToEnquiry": "加入订购清单", "products.viewDetails": "查看详细规格",
    "product.soldOut": "已售罄", "product.new": "新品", "product.preorder": "预售",
    "footer.collections": "系列", "footer.information": "信息", "footer.tagline": "为仪式感廓形、结构化层次和限量季节性发布打造的新原始主义时装。",
    "footer.transmission": "专线通报", "footer.desc": "加入理事会抢先获得最新设计面世、独家面料与成衣批发资讯。", "footer.contact": "联系客服支持", "footer.rights": "© 2026 SHIV SHAKTI PROJECT. 保留所有权利。",
    "footer.shakti": "萨克蒂", "footer.shiva": "湿婆", "footer.fabricSelling": "面料销售", "footer.theCouncil": "理事会", "footer.shippingReturns": "配送与退货", "footer.termsOfService": "服务条款", "footer.privacyPolicy": "隐私政策", "footer.contactLink": "联系我们",
    "language.select": "选择语言", "language.searchPlaceholder": "搜索语言或地区...",
  },
  ru: {
    "nav.shiva": "ШИВА", "nav.shakti": "ШАКТИ", "nav.wholesale": "ОПТОВАЯ КОЛЛЕКЦИЯ", "nav.fabric": "ПРОДАЖА ТКАНЕЙ", "nav.council": "СОВЕТ", "nav.search": "ПОИСК", "nav.account": "АККАУНТ", "nav.bag": "КОРЗИНА ЗАПРОСОВ", "nav.languageRegion": "Язык / Регион",
    "hero.subtitle": "ОПТОВАЯ КОЛЛЕКЦИЯ SS26", "hero.title": "ДЕКОНСТРУИРОВАННЫЙ АВАНГАРД", "hero.description": "Церемониальные силуэты, ритуальные текстуры и архитектурная драпировка для Совета Света.", "hero.cta": "ОТКРЫТЬ ОПТОВЫЙ КАТАЛОГ", "hero.lookbook": "СЕЗОННЫЙ АРХИВ",
    "home.categories": "КАТЕГОРИИ", "home.ss26Live": "SS26 LIVE", "home.newStuff": "*НОВИНКИ", "home.wholesaleBuying": "ОПТОВЫЕ ЗАКУПКИ", "home.shivaMen": "ШИВА / МУЖЧИНЫ", "home.shaktiWomen": "ШАКТИ / ЖЕНЩИНЫ", "home.armorCeremonial": "БРОНЯ / ЦЕРЕМОНИАЛЬНОЕ", "home.deconstructed": "ДЕКОНСТРУКЦИЯ", "home.knitsHeavy": "ТРИКОТАЖ / ПЛОТНЫЙ", "home.knitsLight": "ТРИКОТАЖ / ЛЁГКИЙ", "home.robesCoats": "МАНТИИ И ПАЛЬТО",
    "home.wholesaleBuyingRoom": "ЗАЛ ОПТОВЫХ ЗАКУПОК", "home.moqDescription": "Мин. заказ 20 единиц на стиль в выбранных размерах и расцветках.", "home.globalShipping": "Международная экспресс-доставка для студий и бутиков.", "home.enterBuyingRoom": "ВОЙТИ В ЗАЛ",
    "home.collection": "КОЛЛЕКЦИЯ", "home.ss26WholesaleOpen": "OПТ SS26 ОТКРЫТ", "home.minimumOrder": "МИНИМАЛЬНЫЙ ЗАКАЗ", "home.moqUnits": "МИН. 20 ЕДИНИЦ / СТИЛЬ", "home.dispatch": "ОТПРАВКА", "home.globalExpress": "МЕЖДУНАРОДНАЯ ЭКСПРЕСС-ДОСТАВКА",
    "home.marquee": "ОКНО ОПТОВЫХ ЗАКУПОК SS26 ОТКРЫТО", "home.directFromShowroom": "НАПРЯМУЮ ИЗ ШОУРУМА", "home.featuredStyles": "ИЗБРАННЫЕ МОДЕЛИ", "home.all": "ВСЕ", "home.viewCatalogue": "СМОТРЕТЬ ВЕСЬ ОПТОВЫЙ КАТАЛОГ",
    "home.ss26Menswear": "МУЖСКАЯ МОДА SS26", "home.shivaDeconstructed": "ШИВА / МУЖЧИНЫ — ДЕКОНСТРУИРОВАННАЯ БРОНЯ", "home.shivaDesc": "Церемониальные пальто, деконструированный трикотаж и модульные силуэты для движения.", "home.exploreShiva": "СМОТРЕТЬ КОЛЛЕКЦИЮ ШИВА",
    "home.ss26Womenswear": "ЖЕНСКАЯ МОДА SS26", "home.shaktiSilhouettes": "ШАКТИ / ЖЕНЩИНЫ — СИЛУЭТЫ СВЕТА", "home.shaktiDesc": "Текучие драпировки, органический хлопок и архитектурные наслоения для современного сознания.", "home.exploreShakti": "СМОТРЕТЬ КОЛЛЕКЦИЮ ШАКТИ",
    "products.inStock": "В НАЛИЧИИ", "products.outOfStock": "НЕТ В НАЛИЧИИ", "products.addToEnquiry": "ДОБАВИТЬ В ЗАПРОС", "products.viewDetails": "ПОДРОБНЕЕ",
    "product.soldOut": "Продано", "product.new": "НОВИНКА", "product.preorder": "ПРЕДЗАКАЗ",
    "footer.collections": "Коллекции", "footer.information": "Информация", "footer.tagline": "Нео-примитивная мода для ритуальных силуэтов, структурированных слоёв и лимитированных сезонных релизов.",
    "footer.transmission": "ТРАНСМИССИЯ", "footer.desc": "Присоединяйтесь к Совету для раннего доступа к новым коллекциям и оптовым обновлениям.", "footer.contact": "СВЯЗАТЬСЯ С ПОДДЕРЖКОЙ", "footer.rights": "© 2026 SHIV SHAKTI PROJECT. ВСЕ ПРАВА ЗАЩИЩЕНЫ.",
    "footer.shakti": "Шакти", "footer.shiva": "Шива", "footer.fabricSelling": "Продажа Тканей", "footer.theCouncil": "Совет", "footer.shippingReturns": "Доставка и Возвраты", "footer.termsOfService": "Условия Обслуживания", "footer.privacyPolicy": "Политика Конфиденциальности", "footer.contactLink": "Контакты",
    "language.select": "ВЫБРАТЬ ЯЗЫК", "language.searchPlaceholder": "Поиск языка или региона...",
  },
  ur: {
    "nav.shiva": "شیوا", "nav.shakti": "شکتی", "nav.wholesale": "ہول سیل", "nav.fabric": "کپڑے کی فروخت", "nav.council": "کونسل", "nav.search": "تلاش", "nav.account": "اکاؤنٹ", "nav.bag": "انکوائری بیگ", "nav.languageRegion": "زبان / خطہ",
    "hero.subtitle": "SS26 ہول سیل کلیکشن", "hero.title": "جدید ایونٹ گارڈ لباس", "hero.description": "مجلس نور کے لیے شاندار تقریباتی ملبوسات اور روایتی بناوٹ۔", "hero.cta": "ہول سیل کیٹلاگ دیکھیں", "hero.lookbook": "موسمی آرکائیو",
    "home.categories": "زمرے", "home.ss26Live": "SS26 لائیو", "home.newStuff": "*نیا", "home.wholesaleBuying": "ہول سیل خریداری", "home.shivaMen": "شیوا / مرد", "home.shaktiWomen": "شکتی / خواتین", "home.armorCeremonial": "بکتر / تقریباتی", "home.deconstructed": "ڈی کنسٹرکٹڈ", "home.knitsHeavy": "نٹویئر / بھاری", "home.knitsLight": "نٹویئر / ہلکا", "home.robesCoats": "چوغے اور کوٹ",
    "home.wholesaleBuyingRoom": "ہول سیل خریداری کمرہ", "home.moqDescription": "ہر اسٹائل میں کم از کم 20 یونٹ منتخب سائز اور رنگوں میں۔", "home.globalShipping": "اسٹوڈیو اور بوٹیک پارٹنرز کے لیے عالمی ایکسپریس شپنگ۔", "home.enterBuyingRoom": "خریداری کمرے میں داخل ہوں",
    "home.collection": "کلیکشن", "home.ss26WholesaleOpen": "SS26 ہول سیل کھلا ہے", "home.minimumOrder": "کم از کم آرڈر", "home.moqUnits": "کم از کم 20 یونٹ / اسٹائل", "home.dispatch": "ڈسپیچ", "home.globalExpress": "عالمی ایکسپریس ڈیلیوری",
    "home.marquee": "SS26 ہول سیل خریداری ونڈو کھلی ہے", "home.directFromShowroom": "شو روم سے براہ راست", "home.featuredStyles": "نمایاں اسٹائلز", "home.all": "سب", "home.viewCatalogue": "مکمل ہول سیل کیٹلاگ دیکھیں",
    "home.ss26Menswear": "SS26 مردانہ لباس", "home.shivaDeconstructed": "شیوا / مرد — ڈی کنسٹرکٹڈ بکتر", "home.shivaDesc": "تقریباتی کوٹ، ڈی کنسٹرکٹڈ نٹویئر، اور حرکت کے لیے ماڈیولر سلیوٹس۔", "home.exploreShiva": "شیوا کلیکشن دیکھیں",
    "home.ss26Womenswear": "SS26 خواتین کا لباس", "home.shaktiSilhouettes": "شکتی / خواتین — روشنی کے سلیوٹس", "home.shaktiDesc": "بہتا ہوا ڈریپنگ، آرگینک کاٹن، اور جدید شعور کے لیے آرکیٹیکچرل لیئرنگ۔", "home.exploreShakti": "شکتی کلیکشن دیکھیں",
    "products.inStock": "اسٹاک میں موجود", "products.outOfStock": "اسٹاک ختم", "products.addToEnquiry": "انکوائری میں شامل کریں", "products.viewDetails": "تفصیلات دیکھیں",
    "product.soldOut": "فروخت ہو گیا", "product.new": "نیا", "product.preorder": "پری آرڈر",
    "footer.collections": "کلیکشنز", "footer.information": "معلومات", "footer.tagline": "رسمی سلیوٹس، ساختی تہوں اور محدود موسمی ریلیز کے لیے نو پرائمیٹو فیشن۔",
    "footer.transmission": "نشریات", "footer.desc": "نئی کلیکشنز اور ہول سیل اپڈیٹس تک جلد رسائی کے لیے کونسل میں شامل ہوں۔", "footer.contact": "سپورٹ سے رابطہ کریں", "footer.rights": "© 2026 شیو شکتی پروجیکٹ۔ جملہ حقوق محفوظ ہیں۔",
    "footer.shakti": "شکتی", "footer.shiva": "شیوا", "footer.fabricSelling": "کپڑے کی فروخت", "footer.theCouncil": "کونسل", "footer.shippingReturns": "شپنگ اور واپسی", "footer.termsOfService": "سروس کی شرائط", "footer.privacyPolicy": "رازداری کی پالیسی", "footer.contactLink": "رابطہ",
    "language.select": "زبان منتخب کریں", "language.searchPlaceholder": "زبان تلاش کریں...",
  },
};

export function getTranslation(langCode: string, key: TranslationKey): string {
  const code = langCode.split("-")[0];
  const dictCore = TRANSLATIONS[langCode] || TRANSLATIONS[code];
  if (dictCore && dictCore[key]) return dictCore[key];

  const dict86 = TRANSLATIONS_ALL[langCode] || TRANSLATIONS_ALL[code];
  if (dict86 && dict86[key]) return dict86[key];

  return TRANSLATIONS.en[key] || key;
}
