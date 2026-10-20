import { DEFAULT_LANGUAGE } from '../config/languages';

const LANGUAGE_DICTIONARY: Record<string, Record<string, string>> = {
  ru: {
    ru: 'Русский',
    en: 'Английский',
    de: 'Немецкий',
    fr: 'Французский',
    es: 'Испанский',
    es_mx: 'Испанский (Мексика)',
    pt_br: 'Португальский (Бразилия)',
    it: 'Итальянский',
    pl: 'Польский',
    nl: 'Нидерландский',
    cs: 'Чешский',
    tr: 'Турецкий',
    uk: 'Украинский',
    ja: 'Японский',
    ko: 'Корейский',
    th: 'Тайский',
    zh_cn: 'Китайский (упрощённый)',
    zh_sg: 'Китайский (Сингапур)',
    zh_tw: 'Китайский (традиционный)',
  },
  en: {
    ru: 'Russian',
    en: 'English',
    de: 'German',
    fr: 'French',
    es: 'Spanish',
    es_mx: 'Spanish (Mexico)',
    pt_br: 'Portuguese (Brazil)',
    it: 'Italian',
    pl: 'Polish',
    nl: 'Dutch',
    cs: 'Czech',
    tr: 'Turkish',
    uk: 'Ukrainian',
    ja: 'Japanese',
    ko: 'Korean',
    th: 'Thai',
    zh_cn: 'Chinese (Simplified)',
    zh_sg: 'Chinese (Singapore)',
    zh_tw: 'Chinese (Traditional)',
  },
  de: {
    ru: 'Russisch',
    en: 'Englisch',
    de: 'Deutsch',
    fr: 'Französisch',
    es: 'Spanisch',
    es_mx: 'Spanisch (Mexiko)',
    pt_br: 'Portugiesisch (Brasilien)',
    it: 'Italienisch',
    pl: 'Polnisch',
    nl: 'Niederländisch',
    cs: 'Tschechisch',
    tr: 'Türkisch',
    uk: 'Ukrainisch',
    ja: 'Japanisch',
    ko: 'Koreanisch',
    th: 'Thailändisch',
    zh_cn: 'Chinesisch (Vereinfacht)',
    zh_sg: 'Chinesisch (Singapur)',
    zh_tw: 'Chinesisch (Traditionell)',
  },
  fr: {
    ru: 'Russe',
    en: 'Anglais',
    de: 'Allemand',
    fr: 'Français',
    es: 'Espagnol',
    es_mx: 'Espagnol (Mexique)',
    pt_br: 'Portugais (Brésil)',
    it: 'Italien',
    pl: 'Polonais',
    nl: 'Néerlandais',
    cs: 'Tchèque',
    tr: 'Turc',
    uk: 'Ukrainien',
    ja: 'Japonais',
    ko: 'Coréen',
    th: 'Thaï',
    zh_cn: 'Chinois (simplifié)',
    zh_sg: 'Chinois (Singapour)',
    zh_tw: 'Chinois (traditionnel)',
  },
  es: {
    ru: 'Ruso',
    en: 'Inglés',
    de: 'Alemán',
    fr: 'Francés',
    es: 'Español',
    es_mx: 'Español (México)',
    pt_br: 'Portugués (Brasil)',
    it: 'Italiano',
    pl: 'Polaco',
    nl: 'Neerlandés',
    cs: 'Checo',
    tr: 'Turco',
    uk: 'Ucraniano',
    ja: 'Japonés',
    ko: 'Coreano',
    th: 'Tailandés',
    zh_cn: 'Chino (simplificado)',
    zh_sg: 'Chino (Singapur)',
    zh_tw: 'Chino (tradicional)',
  },
  es_mx: {
    ru: 'Ruso',
    en: 'Inglés',
    de: 'Alemán',
    fr: 'Francés',
    es: 'Español',
    es_mx: 'Español (México)',
    pt_br: 'Portugués (Brasil)',
    it: 'Italiano',
    pl: 'Polaco',
    nl: 'Neerlandés',
    cs: 'Checo',
    tr: 'Turco',
    uk: 'Ucraniano',
    ja: 'Japonés',
    ko: 'Coreano',
    th: 'Tailandés',
    zh_cn: 'Chino (simplificado)',
    zh_sg: 'Chino (Singapur)',
    zh_tw: 'Chino (tradicional)',
  },
  pt_br: {
    ru: 'Russo',
    en: 'Inglês',
    de: 'Alemão',
    fr: 'Francês',
    es: 'Espanhol',
    es_mx: 'Espanhol (México)',
    pt_br: 'Português (Brasil)',
    it: 'Italiano',
    pl: 'Polonês',
    nl: 'Holandês',
    cs: 'Tcheco',
    tr: 'Turco',
    uk: 'Ucraniano',
    ja: 'Japonês',
    ko: 'Coreano',
    th: 'Tailandês',
    zh_cn: 'Chinês (Simplificado)',
    zh_sg: 'Chinês (Singapura)',
    zh_tw: 'Chinês (Tradicional)',
  },
  it: {
    ru: 'Russo',
    en: 'Inglese',
    de: 'Tedesco',
    fr: 'Francese',
    es: 'Spagnolo',
    es_mx: 'Spagnolo (Messico)',
    pt_br: 'Portoghese (Brasile)',
    it: 'Italiano',
    pl: 'Polacco',
    nl: 'Olandese',
    cs: 'Ceco',
    tr: 'Turco',
    uk: 'Ucraino',
    ja: 'Giapponese',
    ko: 'Coreano',
    th: 'Tailandese',
    zh_cn: 'Cinese (semplificato)',
    zh_sg: 'Cinese (Singapore)',
    zh_tw: 'Cinese (tradizionale)',
  },
  pl: {
    ru: 'Rosyjski',
    en: 'Angielski',
    de: 'Niemiecki',
    fr: 'Francuski',
    es: 'Hiszpański',
    es_mx: 'Hiszpański (Meksyk)',
    pt_br: 'Portugalski (Brazylia)',
    it: 'Włoski',
    pl: 'Polski',
    nl: 'Holenderski',
    cs: 'Czeski',
    tr: 'Turecki',
    uk: 'Ukraiński',
    ja: 'Japoński',
    ko: 'Koreański',
    th: 'Tajski',
    zh_cn: 'Chiński (uproszczony)',
    zh_sg: 'Chiński (Singapur)',
    zh_tw: 'Chiński (tradycyjny)',
  },
  uk: {
    ru: 'Російська',
    en: 'Англійська',
    de: 'Німецька',
    fr: 'Французька',
    es: 'Іспанська',
    es_mx: 'Іспанська (Мексика)',
    pt_br: 'Португальська (Бразилія)',
    it: 'Італійська',
    pl: 'Польська',
    nl: 'Нідерландська',
    cs: 'Чеська',
    tr: 'Турецька',
    uk: 'Українська',
    ja: 'Японська',
    ko: 'Корейська',
    th: 'Тайська',
    zh_cn: 'Китайська (спрощена)',
    zh_sg: 'Китайська (Сінгапур)',
    zh_tw: 'Китайська (традиційна)',
  },
  ja: {
    ru: 'ロシア語',
    en: '英語',
    de: 'ドイツ語',
    fr: 'フランス語',
    es: 'スペイン語',
    es_mx: 'スペイン語 (メキシコ)',
    pt_br: 'ポルトガル語 (ブラジル)',
    it: 'イタリア語',
    pl: 'ポーランド語',
    nl: 'オランダ語',
    cs: 'チェコ語',
    tr: 'トルコ語',
    uk: 'ウクライナ語',
    ja: '日本語',
    ko: '韓国語',
    th: 'タイ語',
    zh_cn: '中国語 (簡体字)',
    zh_sg: '中国語 (シンガポール)',
    zh_tw: '中国語 (繁体字)',
  },
  zh_cn: {
    ru: '俄语',
    en: '英语',
    de: '德语',
    fr: '法语',
    es: '西班牙语',
    es_mx: '西班牙语 (墨西哥)',
    pt_br: '葡萄牙语 (巴西)',
    it: '意大利语',
    pl: '波兰语',
    nl: '荷兰语',
    cs: '捷克语',
    tr: '土耳其语',
    uk: '乌克兰语',
    ja: '日语',
    ko: '韩语',
    th: '泰语',
    zh_cn: '中文 (简体)',
    zh_sg: '中文 (新加坡)',
    zh_tw: '中文 (繁体)',
  },
  zh_sg: {
    ru: '俄语',
    en: '英语',
    de: '德语',
    fr: '法语',
    es: '西班牙语',
    es_mx: '西班牙语 (墨西哥)',
    pt_br: '葡萄牙语 (巴西)',
    it: '意大利语',
    pl: '波兰语',
    nl: '荷兰语',
    cs: '捷克语',
    tr: '土耳其语',
    uk: '乌克兰语',
    ja: '日语',
    ko: '韩语',
    th: '泰语',
    zh_cn: '中文 (简体)',
    zh_sg: '中文 (新加坡)',
    zh_tw: '中文 (繁体)',
  },
  zh_tw: {
    ru: '俄語',
    en: '英語',
    de: '德語',
    fr: '法語',
    es: '西班牙語',
    es_mx: '西班牙語 (墨西哥)',
    pt_br: '葡萄牙語 (巴西)',
    it: '義大利語',
    pl: '波蘭語',
    nl: '荷蘭語',
    cs: '捷克語',
    tr: '土耳其語',
    uk: '烏克蘭語',
    ja: '日語',
    ko: '韓語',
    th: '泰語',
    zh_cn: '中文 (簡體)',
    zh_sg: '中文 (新加坡)',
    zh_tw: '中文 (繁體)',
  },
};

function toBcp47(code: string): string {
  return code.replace('_', '-');
}

/**
 * Returns the name of targetCode translated into currentLang.
 * If currentLang is 'ru', targetCode 'en' -> 'Английский'.
 * If currentLang is 'en', targetCode 'en' -> 'English'.
 * If currentLang is 'de', targetCode 'en' -> 'Englisch'.
 */
export function getLanguageTitle(targetCode: string, currentLang: string = DEFAULT_LANGUAGE): string {
  // 1. Check explicit dictionary for current language
  const currentDict = LANGUAGE_DICTIONARY[currentLang];
  if (currentDict && currentDict[targetCode]) {
    return currentDict[targetCode];
  }

  // 2. Try browser Intl.DisplayNames in current language
  try {
    const currentBcp = toBcp47(currentLang);
    const targetBcp = toBcp47(targetCode);
    const name = new Intl.DisplayNames([currentBcp], { type: 'language' }).of(targetBcp);
    if (name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  } catch {
    // Ignore Intl errors
  }

  // 3. Fallback to English dictionary
  const enDict = LANGUAGE_DICTIONARY.en;
  if (enDict && enDict[targetCode]) {
    return enDict[targetCode];
  }

  return targetCode.toUpperCase();
}

/**
 * Detects the best matching language code based on browser language or custom input.
 * Supports exact dialect match ('es_mx'), base language match ('ru'), and falls back to default.
 *
 * @param browserLanguage Optional language code (defaults to navigator.language)
 * @param supportedLanguages Optional dictionary, array, or set of supported language codes
 * @param fallback Fallback language when no match is found (defaults to DEFAULT_LANGUAGE)
 */
export function detectBrowserLanguage(
  browserLanguage?: string,
  supportedLanguages?: Record<string, unknown> | readonly string[] | string[] | Set<string>,
  fallback: string = DEFAULT_LANGUAGE
): string {
  const navLang =
    browserLanguage ?? (typeof navigator !== 'undefined' ? navigator.language : undefined);

  if (!navLang) {
    return fallback;
  }

  const raw = navLang.toLowerCase().replace('-', '_');

  const isSupported = (code: string): boolean => {
    if (!supportedLanguages) return true;
    if (Array.isArray(supportedLanguages)) return supportedLanguages.includes(code);
    if (supportedLanguages instanceof Set) return supportedLanguages.has(code);
    return code in supportedLanguages;
  };

  if (isSupported(raw)) {
    return raw;
  }

  const base = raw.split('_')[0];
  if (isSupported(base)) {
    return base;
  }

  return fallback;
}
