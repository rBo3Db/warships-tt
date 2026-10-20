import type { ShipStatus, ShipSortOption } from '../../../types/vehicle';
import { CatalogFilters } from './CatalogFilters';
import { SortSelector } from './SortSelector';
import styles from '../Catalog.module.css';

export interface CatalogToolbarProps {
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
  selectedStatus: ShipStatus;
  onSelectStatus: (status: ShipStatus) => void;
  selectedTier: number | null;
  onSelectTier: (tier: number | null) => void;
  selectedSort: ShipSortOption;
  onSelectSort: (sort: ShipSortOption) => void;
}

export function CatalogToolbar({
  selectedType,
  onSelectType,
  selectedStatus,
  onSelectStatus,
  selectedTier,
  onSelectTier,
  selectedSort,
  onSelectSort,
}: CatalogToolbarProps) {
  return (
    <div className={styles.filtersContainer}>
      <CatalogFilters
        selectedType={selectedType}
        onSelectType={onSelectType}
        selectedStatus={selectedStatus}
        onSelectStatus={onSelectStatus}
        selectedTier={selectedTier}
        onSelectTier={onSelectTier}
      />
      <SortSelector selectedSort={selectedSort} onSelectSort={onSelectSort} />
    </div>
  );
}

export default CatalogToolbar;
