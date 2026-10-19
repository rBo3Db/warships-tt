import type { Vehicle } from '../../types/vehicle';
import { useI18n, useConfig } from '../../context';
import { getLanguageTitle } from '../../utils/language';
import { toRomanTier } from '../../utils/roman';
import styles from './Header.module.css';

export interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchClear: () => void;
  otherNationMatches: Vehicle[];
  onJumpToShip: (ship: Vehicle) => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  onSearchClear,
  otherNationMatches,
  onJumpToShip,
}: HeaderProps) {
  const { lang, setLang, languages, ui } = useI18n();
  const { getNation, getFlagUrl } = useConfig();

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
      </header>

      {/* Other nations search hints */}
      {otherNationMatches.length > 0 && (
        <div className={styles.otherNationsBanner}>
          <span>{ui.foundInOtherNations}</span>
          {otherNationMatches.map((ship) => {
            const nat = getNation(ship.nation);
            const flag = nat ? getFlagUrl(nat.icons.small || nat.icons.default) : null;
            const shipTitle = ship.localization?.mark?.[lang] || ship.name;
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
