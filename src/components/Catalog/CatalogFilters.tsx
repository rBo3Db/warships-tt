import type { ShipStatus } from '../../types/vehicle';
import { TypeFilter, StatusFilter, TierFilter, TIERS } from './filters';
import styles from './Catalog.module.css';

export { TIERS };

export interface CatalogFiltersProps {
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
  selectedStatus: ShipStatus;
  onSelectStatus: (status: ShipStatus) => void;
  selectedTier: number | null;
  onSelectTier: (tier: number | null) => void;
}

export function CatalogFilters({
  selectedType,
  onSelectType,
  selectedStatus,
  onSelectStatus,
  selectedTier,
  onSelectTier,
}: CatalogFiltersProps) {
  return (
    <div className={styles.filtersContainer}>
      <TypeFilter selectedType={selectedType} onSelectType={onSelectType} />
      <StatusFilter selectedStatus={selectedStatus} onSelectStatus={onSelectStatus} />
      <TierFilter selectedTier={selectedTier} onSelectTier={onSelectTier} />
    </div>
  );
}

export default CatalogFilters;
