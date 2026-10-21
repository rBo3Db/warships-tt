import { useState, useMemo, type ReactNode } from 'react';
import { getUiTranslation, UI_TRANSLATIONS, detectBrowserLanguage } from '../i18n';
import { I18nContext, type I18nContextValue } from './I18nContext';

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

export default I18nProvider;
