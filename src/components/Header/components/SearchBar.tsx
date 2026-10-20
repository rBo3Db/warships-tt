import { useI18n } from '../../../context';
import styles from '../Header.module.css';

export interface SearchBarProps {
  query?: string;
  value?: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function SearchBar({ query, value, onChange, onClear }: SearchBarProps) {
  const { ui } = useI18n();
  const searchVal = query ?? value ?? '';

  return (
    <div className={styles.searchWrapper}>
      <input
        type="text"
        className={styles.searchInput}
        placeholder={ui.searchPlaceholder}
        value={searchVal}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ui.searchPlaceholder}
      />
      {searchVal && (
        <button
          type="button"
          className={styles.searchClear}
          onClick={onClear}
          aria-label={ui.searchClear}
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;
