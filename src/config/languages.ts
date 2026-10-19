export const SupportedLanguage = {
  EN: 'en',
  RU: 'ru',
} as const;

export type SupportedLanguage = (typeof SupportedLanguage)[keyof typeof SupportedLanguage];

export const DEFAULT_LANGUAGE: SupportedLanguage = SupportedLanguage.EN;

export const FALLBACK_LANGUAGES: readonly SupportedLanguage[] = [
  SupportedLanguage.EN,
  SupportedLanguage.RU,
];
