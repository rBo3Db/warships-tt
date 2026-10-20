import { useI18n, useConfig } from '../../context';
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
  const { ui } = useI18n();
  const { nations } = useConfig();

  return (
    <nav className={styles.menuContainer}>
      <div className={styles.innerContent}>
        <div className={styles.list}>
          {/* All Nations button */}
          <button
            type="button"
            className={`${styles.item} ${selectedNation === null ? styles.itemSelected : ''}`}
            onClick={() => onSelectNation(null)}
          >
            <span>{ui.allNations}</span>
          </button>

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
