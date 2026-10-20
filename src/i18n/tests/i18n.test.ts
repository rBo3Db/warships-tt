import { describe, it, expect } from 'vitest';
import {
  UI_TRANSLATIONS,
  getUiTranslation,
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGES,
  detectBrowserLanguage,
  getLanguageTitle,
} from '../index';

const REQUIRED_KEYS = [
  'title',
  'language',
  'nations',
  'allNations',
  'selectNationForTree',
  'classes',
  'allTypes',
  'tiers',
  'allTiers',
  'status',
  'allStatuses',
  'onlyResearchable',
  'onlyPremium',
  'ships',
  'found',
  'noShips',
  'noImage',
  'premium',
  'special',
  'loading',
  'techTree',
  'researchable',
  'premiums',
  'viewTree',
  'viewGrid',
  'searchPlaceholder',
  'searchClear',
  'foundInOtherNations',
  'scrollToTop',
  'connectionError',
  'serverErrorDesc',
  'syncFailedBanner',
  'shipsLoadError',
  'retry',
  'dismiss',
  'sortBy',
  'sortTierAsc',
  'sortTierDesc',
  'sortNameAsc',
  'sortNameDesc',
  'sortType',
] as const;

describe('i18n system', () => {
  it('contains all 19 expected languages in UI_TRANSLATIONS', () => {
    const langCodes = Object.keys(UI_TRANSLATIONS);
    expect(langCodes).toHaveLength(19);
    expect(langCodes).toContain('en');
    expect(langCodes).toContain('ru');
    expect(langCodes).toContain('de');
    expect(langCodes).toContain('fr');
    expect(langCodes).toContain('ja');
    expect(langCodes).toContain('zh_cn');
    expect(FALLBACK_LANGUAGES).toEqual(['en', 'ru']);
  });

  it('ensures every locale defines all required keys with non-empty strings', () => {
    for (const [lang, translations] of Object.entries(UI_TRANSLATIONS)) {
      for (const key of REQUIRED_KEYS) {
        const val = translations[key as keyof typeof translations];
        expect(
          val,
          `Language "${lang}" is missing or has empty string for key "${key}"`
        ).toBeDefined();
        expect(typeof val).toBe('string');
        expect(val.trim().length).toBeGreaterThan(0);
      }
    }
  });

  describe('getUiTranslation', () => {
    it('returns exact translation for known language', () => {
      const ru = getUiTranslation('ru');
      expect(ru.connectionError).toBe('Ошибка подключения');
      expect(ru.retry).toBe('Попробовать снова');
    });

    it('falls back to default language for unknown language', () => {
      const fallback = getUiTranslation('unknown_lang');
      expect(fallback.connectionError).toBe('Connection Error');
      expect(fallback.retry).toBe('Try Again');
    });
  });

  describe('detectBrowserLanguage', () => {
    it('matches exact dialect if supported', () => {
      expect(detectBrowserLanguage('es-MX', UI_TRANSLATIONS)).toBe('es_mx');
    });

    it('falls back to base language when dialect not supported', () => {
      expect(detectBrowserLanguage('ru-RU', UI_TRANSLATIONS)).toBe('ru');
      expect(detectBrowserLanguage('de-AT', UI_TRANSLATIONS)).toBe('de');
    });

    it('falls back to DEFAULT_LANGUAGE if entirely unsupported', () => {
      expect(detectBrowserLanguage('xx-YY', UI_TRANSLATIONS)).toBe(DEFAULT_LANGUAGE);
    });
  });

  describe('getLanguageTitle', () => {
    it('translates language name to current language', () => {
      expect(getLanguageTitle('en', 'ru')).toBe('Английский');
      expect(getLanguageTitle('ru', 'en')).toBe('Russian');
      expect(getLanguageTitle('de', 'en')).toBe('German');
      expect(getLanguageTitle('de', 'ru')).toBe('Немецкий');
    });

    it('falls back to uppercase code when code is unknown and Intl fails', () => {
      expect(getLanguageTitle('999_invalid', 'en')).toBe('999_INVALID');
    });
  });
});
