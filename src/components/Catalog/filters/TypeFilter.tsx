import { useI18n, useConfig } from '../../../context';
import { TypeFilterButton } from './TypeFilterButton';
import styles from '../Catalog.module.css';

export interface TypeFilterProps {
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
}

export function TypeFilter({ selectedType, onSelectType }: TypeFilterProps) {
  const { ui } = useI18n();
  const { sortedVehicleTypes } = useConfig();

  return (
    <div className={styles.list}>
      <button
        type="button"
        className={`${styles.item} ${selectedType === null ? styles.itemSelected : ''}`}
        onClick={() => onSelectType(null)}
      >
        {ui.allTypes}
      </button>
      {sortedVehicleTypes.map(([typeKey, typeInfo]) => (
        <TypeFilterButton
          key={typeKey}
          typeKey={typeKey}
          typeInfo={typeInfo}
          isSelected={selectedType === typeKey}
          onToggle={() => onSelectType(selectedType === typeKey ? null : typeKey)}
        />
      ))}
    </div>
  );
}

export default TypeFilter;
