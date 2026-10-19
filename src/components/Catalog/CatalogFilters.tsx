import type { ShipStatus, ShipSortOption } from '../../types/vehicle';
import { TypeFilter, StatusFilter, TierFilter, SortFilter, TIERS } from './filters';
import styles from './Catalog.module.css';

export { TIERS };

export interface CatalogFiltersProps {
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
  selectedStatus: ShipStatus;
  onSelectStatus: (status: ShipStatus) => void;
  selectedTier: number | null;
  onSelectTier: (tier: number | null) => void;
  selectedSort: ShipSortOption;
  onSelectSort: (sort: ShipSortOption) => void;
}

export function CatalogFilters({
  selectedType,
  onSelectType,
  selectedStatus,
  onSelectStatus,
  selectedTier,
  onSelectTier,
  selectedSort,
  onSelectSort,
}: CatalogFiltersProps) {
  return (
    <div className={styles.filtersContainer}>
      <TypeFilter selectedType={selectedType} onSelectType={onSelectType} />
      <StatusFilter selectedStatus={selectedStatus} onSelectStatus={onSelectStatus} />
      <TierFilter selectedTier={selectedTier} onSelectTier={onSelectTier} />
      <SortFilter selectedSort={selectedSort} onSelectSort={onSelectSort} />
    </div>
  );
}

export default CatalogFilters;

