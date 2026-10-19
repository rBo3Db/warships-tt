import type { VehicleTypeInfo } from '../../../types/vehicle';
import { useI18n, useConfig } from '../../../context';
import styles from '../Catalog.module.css';

export interface TypeFilterButtonProps {
  typeKey: string;
  typeInfo: VehicleTypeInfo;
  isSelected: boolean;
  onToggle: () => void;
}

export function TypeFilterButton({
  typeKey,
  typeInfo,
  isSelected,
  onToggle,
}: TypeFilterButtonProps) {
  const { lang } = useI18n();
  const { getMediaUrl } = useConfig();

  const typeTitle = typeInfo.localization?.mark?.[lang] || typeKey;
  const iconUrl = getMediaUrl(typeInfo.icons?.default);

  return (
    <button
      type="button"
      className={`${styles.item} ${isSelected ? styles.itemSelected : ''}`}
      onClick={onToggle}
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
}

export default TypeFilterButton;
