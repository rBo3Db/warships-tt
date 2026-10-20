import { useConfig } from '../../../context';
import { TypeFilterButton } from './TypeFilterButton';
import styles from '../Catalog.module.css';

export interface TypeFilterProps {
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
}

export function TypeFilter({ selectedType, onSelectType }: TypeFilterProps) {
  const { sortedVehicleTypes } = useConfig();

  return (
    <div className={styles.list}>
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
