import type { RefObject } from 'react';
import type { Vehicle, ShipStatus } from '../../types/vehicle';
import { useI18n } from '../../context';
import { Loader } from '../ui/Loader';
import { ErrorCard } from '../ui/ErrorCard';
import { CatalogFilters } from './CatalogFilters';
import { ShipCard } from './ShipCard';
import styles from './Catalog.module.css';

export interface CatalogProps {
  ships: Vehicle[];
  totalFilteredCount: number;
  displayLimit: number;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
  selectedStatus: ShipStatus;
  onSelectStatus: (status: ShipStatus) => void;
  selectedTier: number | null;
  onSelectTier: (tier: number | null) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export function Catalog({
  ships,
  totalFilteredCount,
  displayLimit,
  loadMoreRef,
  selectedType,
  onSelectType,
  selectedStatus,
  onSelectStatus,
  selectedTier,
  onSelectTier,
  isLoading = false,
  errorMessage = null,
  onRetry,
}: CatalogProps) {
  const { ui } = useI18n();

  return (
    <>
      <CatalogFilters
        selectedType={selectedType}
        onSelectType={onSelectType}
        selectedStatus={selectedStatus}
        onSelectStatus={onSelectStatus}
        selectedTier={selectedTier}
        onSelectTier={onSelectTier}
      />

      {errorMessage ? (
        <ErrorCard
          title={ui.shipsLoadError}
          message={errorMessage}
          retryLabel={ui.retry}
          onRetry={onRetry}
        />
      ) : isLoading ? (
        <div className={styles.loadingContainer}>
          <Loader />
        </div>
      ) : totalFilteredCount === 0 ? (
        <div className={styles.empty}>{ui.noShips}</div>
      ) : (
        <div className={styles.grid}>
          {ships.map((ship) => (
            <ShipCard key={ship.id} ship={ship} />
          ))}

          {/* Infinite scroll sentinel */}
          {displayLimit < totalFilteredCount && (
            <div ref={loadMoreRef} className={styles.sentinel}>
              <span className={styles.loadingText}>{ui.loading}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Catalog;
