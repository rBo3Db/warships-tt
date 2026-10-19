import { useI18n, useConfig } from '../../../context';
import styles from '../Catalog.module.css';

export interface TypeFilterProps {
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
}

export function TypeFilter({ selectedType, onSelectType }: TypeFilterProps) {
  const { lang, ui } = useI18n();
  const { sortedVehicleTypes, getMediaUrl } = useConfig();

  return (
    <div className={styles.list}>
      <button
        type="button"
        className={`${styles.item} ${selectedType === null ? styles.itemSelected : ''}`}
        onClick={() => onSelectType(null)}
      >
        {ui.allTypes}
      </button>
      {sortedVehicleTypes.map(([typeKey, typeInfo]) => {
        const isSelected = selectedType === typeKey;
        const typeTitle = typeInfo.localization?.mark?.[lang] || typeKey;
        const iconUrl = getMediaUrl(typeInfo.icons?.default);

        return (
          <button
            key={typeKey}
            type="button"
            className={`${styles.item} ${isSelected ? styles.itemSelected : ''}`}
            onClick={() => onSelectType(isSelected ? null : typeKey)}
          >
            {iconUrl && (
              <img
                src={iconUrl}
                alt={typeTitle}
                className={styles.typeIcon}
                loading="lazy"
              />
            )}
            <span>{typeTitle}</span>
          </button>
        );
      })}
    </div>
  );
}

export default TypeFilter;
