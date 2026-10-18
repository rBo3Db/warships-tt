import type { Vehicle } from '../../types/vehicle';
import type { Nation } from '../../types/nation';
import type { UiTranslations } from '../../utils/i18n';
import { getLanguageTitle } from '../../utils/language';
import { toRomanTier } from '../../utils/roman';
import { buildFlagUrl } from '../../services/nationsService';
import styles from './Header.module.css';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchClear: () => void;
  selectedLang: string;
  onLangChange: (lang: string) => void;
  languages: string[];
  ui: UiTranslations;
  otherNationMatches: Vehicle[];
  nations: Nation[];
  mediaPath: string;
  onJumpToShip: (ship: Vehicle) => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  onSearchClear,
  selectedLang,
  onLangChange,
  languages,
  ui,
  otherNationMatches,
  nations,
  mediaPath,
  onJumpToShip,
}: HeaderProps) {
  return (
    <>
      <header className={styles.topBar}>
        <h1 className={styles.title}>{ui.title}</h1>

        {/* Search Input */}
        <div className={styles.searchBar}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={ui.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={onSearchClear}
              title={ui.searchClear}
            >
              ✕
            </button>
          )}
        </div>

        {/* Language Selector */}
        <div className={styles.langPicker}>
          <label htmlFor="language-select">{ui.language} </label>
          <select
            id="language-select"
            value={selectedLang}
            onChange={(e) => onLangChange(e.target.value)}
          >
            {languages.map((code) => (
              <option key={code} value={code}>
                {getLanguageTitle(code, selectedLang)} ({code})
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Other nations search hints */}
      {otherNationMatches.length > 0 && (
        <div className={styles.otherNationsBanner}>
          <span>{ui.foundInOtherNations}</span>
          {otherNationMatches.map((ship) => {
            const nat = nations.find((n) => n.name === ship.nation);
            const flag = nat ? buildFlagUrl(mediaPath, nat.icons.small || nat.icons.default) : null;
            const shipTitle = ship.localization?.mark?.[selectedLang] || ship.name;
            return (
              <button
                key={ship.id}
                type="button"
                className={styles.otherNationChip}
                onClick={() => onJumpToShip(ship)}
              >
                {flag && <img src={flag} alt={ship.nation} className={styles.flag} />}
                <span>
                  {shipTitle} ({toRomanTier(ship.level)})
                </span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

export default Header;
