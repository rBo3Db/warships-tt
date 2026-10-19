import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { getUiTranslation, type UiTranslations } from '../utils/i18n';

export interface I18nContextValue {
  lang: string;
  setLang: (lang: string) => void;
  languages: string[];
  ui: UiTranslations;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  children: ReactNode;
  availableLanguages?: string[];
  initialLang?: string;
}

export function I18nProvider({
  children,
  availableLanguages = [],
  initialLang,
}: I18nProviderProps) {
  const languages = useMemo(() => {
    return availableLanguages.length > 0 ? availableLanguages : ['en', 'ru'];
  }, [availableLanguages]);

  const [lang, setLang] = useState<string>(() => {
    if (initialLang) return initialLang;
    if (typeof navigator !== 'undefined') {
      const raw = navigator.language.toLowerCase().replace('-', '_');
      if (languages.includes(raw)) return raw;
      const base = raw.split('_')[0];
      if (languages.includes(base)) return base;
    }
    return languages.includes('en') ? 'en' : languages[0] || 'en';
  });

  const ui = useMemo(() => getUiTranslation(lang), [lang]);

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLang, languages, ui }),
    [lang, languages, ui]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}
