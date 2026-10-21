import { createContext, useContext } from 'react';
import type { UiTranslations } from '../i18n';

export interface I18nContextValue {
  lang: string;
  setLang: (lang: string) => void;
  ui: UiTranslations;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}

export { I18nProvider, type I18nProviderProps } from './I18nProvider';
