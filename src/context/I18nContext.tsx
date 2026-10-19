import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { getUiTranslation, UI_TRANSLATIONS, detectBrowserLanguage, type UiTranslations } from '../utils/i18n';

export interface I18nContextValue {
  lang: string;
  setLang: (lang: string) => void;
  ui: UiTranslations;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [lang, setLang] = useState<string>(() => detectBrowserLanguage(undefined, UI_TRANSLATIONS));

  const ui = useMemo(() => getUiTranslation(lang), [lang]);

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLang, ui }),
    [lang, ui]
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
