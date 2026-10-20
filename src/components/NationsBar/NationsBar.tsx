import { useConfig } from '../../context';
import { NationButton } from './components/NationButton';
import styles from './NationsBar.module.css';

export interface NationsBarProps {
  selectedNation: string | null;
  onSelectNation: (nationName: string | null) => void;
}

export function NationsBar({
  selectedNation,
  onSelectNation,
}: NationsBarProps) {
  const { nations } = useConfig();

  return (
    <nav className={styles.menuContainer}>
      <div className={styles.innerContent}>
        <div className={styles.list}>
          {/* Individual nation buttons */}
          {nations.map((nation) => (
            <NationButton
              key={nation.id}
              nation={nation}
              isSelected={selectedNation === nation.name}
              onSelect={onSelectNation}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

export default NationsBar;
