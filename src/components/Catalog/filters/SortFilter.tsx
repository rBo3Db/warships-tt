import { useI18n } from '../../../context';
import { ShipSortOption } from '../../../types/vehicle';
import styles from '../Catalog.module.css';

export interface SortFilterProps {
  selectedSort: ShipSortOption;
  onSelectSort: (sort: ShipSortOption) => void;
}

export function SortFilter({ selectedSort, onSelectSort }: SortFilterProps) {
  const { ui } = useI18n();

  const options: Array<{ id: ShipSortOption; label: string }> = [
    { id: ShipSortOption.TIER_ASC, label: ui.sortTierAsc },
    { id: ShipSortOption.TIER_DESC, label: ui.sortTierDesc },
    { id: ShipSortOption.NAME_ASC, label: ui.sortNameAsc },
    { id: ShipSortOption.NAME_DESC, label: ui.sortNameDesc },
    { id: ShipSortOption.TYPE, label: ui.sortType },
  ];

  return (
    <div className={styles.list}>
      <span className={styles.sortLabel}>{ui.sortBy}</span>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`${styles.item} ${selectedSort === opt.id ? styles.itemSelected : ''}`}
          onClick={() => onSelectSort(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default SortFilter;
