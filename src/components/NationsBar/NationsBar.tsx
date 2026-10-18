import type { Nation } from '../../types/nation';
import type { UiTranslations } from '../../utils/i18n';
import { buildFlagUrl } from '../../services/nationsService';
import styles from './NationsBar.module.css';

interface NationsBarProps {
  nations: Nation[];
  selectedNation: string | null;
  onSelectNation: (nationName: string | null) => void;
  mediaPath: string;
  selectedLang: string;
  ui: UiTranslations;
}

export function NationsBar({
  nations,
  selectedNation,
  onSelectNation,
  mediaPath,
  selectedLang,
  ui,
}: NationsBarProps) {
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
          const title = nation.localization?.mark?.[selectedLang] || nation.name;
          const flagUrl = buildFlagUrl(mediaPath, nation.icons.large || nation.icons.default);
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
