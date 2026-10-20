import type { Nation } from '../../../types/nation';
import { useI18n, useConfig } from '../../../context';
import styles from '../NationsBar.module.css';

export interface NationButtonProps {
  nation: Nation;
  isSelected: boolean;
  onSelect: (nationName: string) => void;
}

export function NationButton({ nation, isSelected, onSelect }: NationButtonProps) {
  const { lang } = useI18n();
  const { getFlagUrl } = useConfig();

  const title = nation.localization?.mark?.[lang] || nation.name;
  const flagUrl = getFlagUrl(nation.icons.large || nation.icons.default);

  return (
    <button
      type="button"
      className={`${styles.item} ${isSelected ? styles.itemSelected : ''}`}
      onClick={() => onSelect(nation.name)}
    >
      {flagUrl && (
        <img
          src={flagUrl}
          alt={title}
          className={styles.flag}
          loading="lazy"
        />
      )}
      <span className={styles.itemTitle}>{title}</span>
    </button>
  );
}

export default NationButton;
