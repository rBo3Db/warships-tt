import { DEFAULT_LANGUAGE } from '../config/languages';
import type { UiTranslations } from './types';
import { en } from './locales/en';
import { ru } from './locales/ru';
import { de } from './locales/de';
import { fr } from './locales/fr';
import { es } from './locales/es';
import { es_mx } from './locales/es_mx';
import { pt_br } from './locales/pt_br';
import { it } from './locales/it';
import { pl } from './locales/pl';
import { nl } from './locales/nl';
import { cs } from './locales/cs';
import { tr } from './locales/tr';
import { uk } from './locales/uk';
import { ja } from './locales/ja';
import { ko } from './locales/ko';
import { th } from './locales/th';
import { zh_cn } from './locales/zh_cn';
import { zh_sg } from './locales/zh_sg';
import { zh_tw } from './locales/zh_tw';

export * from './types';
export * from '../config/languages';
export { detectBrowserLanguage, getLanguageTitle } from './language';

export const UI_TRANSLATIONS: Record<string, UiTranslations> = {
  en,
  ru,
  de,
  fr,
  es,
  es_mx,
  pt_br,
  it,
  pl,
  nl,
  cs,
  tr,
  uk,
  ja,
  ko,
  th,
  zh_cn,
  zh_sg,
  zh_tw,
};

export function getUiTranslation(lang: string): UiTranslations {
  const base = UI_TRANSLATIONS[DEFAULT_LANGUAGE];
  const current = UI_TRANSLATIONS[lang] || {};
  return { ...base, ...current };
}

export default getUiTranslation;
