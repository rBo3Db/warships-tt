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
  const { ui, lang } = useI18n();
  const { nations, getNation, getFlagUrl } = useConfig();

  const selectedNationObj = selectedNation ? getNation(selectedNation) : null;
  const flagUrl = selectedNationObj
    ? getFlagUrl(selectedNationObj.icons.large || selectedNationObj.icons.default) || null
    : null;
  const selectedNationTitle = selectedNationObj
    ? selectedNationObj.localization?.mark?.[lang] || selectedNationObj.name
    : null;

  return (
    <nav className={styles.menuContainer}>
      {/* Background flag of the selected country on the menu */}
      {flagUrl && (
        <>
          <div
            className={styles.flagBackdrop}
            style={{ backgroundImage: `url("${flagUrl}")` }}
            aria-hidden="true"
          />
          <div className={styles.flagOverlay} aria-hidden="true" />
        </>
      )}

      <div className={styles.innerContent}>
        <div className={styles.header}>
          <h2 className={styles.sectionTitle}>{ui.nations}</h2>
        </div>

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
