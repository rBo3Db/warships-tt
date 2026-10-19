import { useI18n, useConfig } from '../../context';
import styles from './NationsBar.module.css';

export interface NationsBarProps {
  selectedNation: string | null;
  onSelectNation: (nationName: string | null) => void;
}

export function NationsBar({
  selectedNation,
  onSelectNation,
}: NationsBarProps) {
  const { lang, ui } = useI18n();
  const { nations, getFlagUrl } = useConfig();

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{ui.nations}</h2>
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
        {nations.map((nation) => {
          const title = nation.localization?.mark?.[lang] || nation.name;
          const flagUrl = getFlagUrl(nation.icons.large || nation.icons.default);
          const isSelected = selectedNation === nation.name;

          return (
            <button
              key={nation.id}
              type="button"
              className={`${styles.item} ${isSelected ? styles.itemSelected : ''}`}
              onClick={() => onSelectNation(nation.name)}
            >
              <img
                src={flagUrl}
                alt={title}
                className={styles.flag}
                loading="lazy"
              />
              <span>{title}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default NationsBar;
