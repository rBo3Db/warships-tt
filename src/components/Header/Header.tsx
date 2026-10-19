import type { Vehicle } from '../../types/vehicle';
import { useI18n } from '../../context';
import { SearchBar } from './SearchBar';
import { LanguagePicker } from './LanguagePicker';
import { OtherNationsBanner } from './OtherNationsBanner';
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
  const { ui } = useI18n();

  return (
    <>
      <header className={styles.topBar}>
        <h1 className={styles.title}>{ui.title}</h1>

        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          onClear={onSearchClear}
        />

        <LanguagePicker />
      </header>

      <OtherNationsBanner
        matches={otherNationMatches}
        onJumpToShip={onJumpToShip}
      />
    </>
  );
}

export default Header;
