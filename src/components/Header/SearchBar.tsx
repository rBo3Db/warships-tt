import { useI18n } from '../../context';
import styles from './Header.module.css';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder,
}: SearchBarProps) {
  const { ui } = useI18n();

  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        className={styles.searchInput}
        placeholder={placeholder || ui.searchPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className={styles.clearSearchBtn}
          onClick={onClear}
          title={ui.searchClear}
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;
