import { useMemo } from 'react';
import { useI18n, useConfig } from '../../context';
import { getLanguageTitle } from '../../utils/language';
import { FALLBACK_LANGUAGES } from '../../config/languages';
import styles from './Header.module.css';

export function LanguagePicker() {
  const { lang, setLang, ui } = useI18n();
  const { nations } = useConfig();

  const languages = useMemo(() => {
    const list = Array.from(
      new Set(nations.flatMap((n) => Object.keys(n.localization?.mark || {})))
    );
    return list.length > 0 ? list : [...FALLBACK_LANGUAGES];
  }, [nations]);

  return (
    <div className={styles.langPicker}>
      <label htmlFor="language-select">{ui.language} </label>
      <select
        id="language-select"
        value={lang}
        onChange={(e) => setLang(e.target.value)}
      >
        {languages.map((code) => (
          <option key={code} value={code}>
            {getLanguageTitle(code, lang)} ({code})
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguagePicker;
