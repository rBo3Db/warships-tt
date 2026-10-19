import type { RefObject } from 'react';
import type { Vehicle } from '../../types/vehicle';
import { useI18n } from '../../context';
import { Loader } from '../ui/Loader';
import { ErrorCard } from '../ui/ErrorCard';
import { ShipCard } from './ShipCard';
import styles from './Catalog.module.css';

export interface CatalogProps {
  ships: Vehicle[];
  totalFilteredCount: number;
  displayLimit: number;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export function Catalog({
  ships,
  totalFilteredCount,
  displayLimit,
  loadMoreRef,
  isLoading = false,
  errorMessage = null,
  onRetry,
}: CatalogProps) {
  const { ui } = useI18n();

  if (errorMessage) {
    return (
      <ErrorCard
        title={ui.shipsLoadError}
        message={errorMessage}
        retryLabel={ui.retry}
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader />
      </div>
    );
  }

  if (totalFilteredCount === 0) {
    return <div className={styles.empty}>{ui.noShips}</div>;
  }

  return (
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
  );
}

export default Catalog;

