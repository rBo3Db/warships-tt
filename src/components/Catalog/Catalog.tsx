import type { Vehicle } from '../../types/vehicle';
import { useI18n } from '../../context';
import { Loader } from '../ui/Loader';
import { ErrorCard } from '../ui/ErrorCard';
import { ShipCard } from './components/ShipCard';
import { TypeFilter, StatusFilter, TierFilter } from './filters';
import { SortSelector } from './components/SortSelector';
import { useCatalogFilter } from './hooks/useCatalogFilter';
import styles from './Catalog.module.css';

export interface CatalogProps {
  ships: Vehicle[];
  searchQuery?: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export function Catalog({
  ships,
  searchQuery = '',
  isLoading = false,
  errorMessage = null,
  onRetry,
}: CatalogProps) {
  const { lang, ui } = useI18n();

  const {
    visibleShips,
    totalFilteredCount,
    loadMoreRef,
    hasMore,
    selectedType,
    setSelectedType,
    selectedTier,
    setSelectedTier,
    selectedStatus,
    setSelectedStatus,
    selectedSort,
    setSelectedSort,
  } = useCatalogFilter({
    ships,
    searchQuery,
    selectedLang: lang,
  });

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

  return (
    <>
      <div className={styles.filtersContainer}>
        <TypeFilter selectedType={selectedType} onSelectType={setSelectedType} />
        <StatusFilter selectedStatus={selectedStatus} onSelectStatus={setSelectedStatus} />
        <TierFilter selectedTier={selectedTier} onSelectTier={setSelectedTier} />
        <SortSelector selectedSort={selectedSort} onSelectSort={setSelectedSort} />
      </div>

      {totalFilteredCount === 0 ? (
        <div className={styles.empty}>{ui.noShips}</div>
      ) : (
        <div className={styles.grid}>
          {visibleShips.map((ship) => (
            <ShipCard key={ship.id} ship={ship} />
          ))}

          {/* Infinite scroll sentinel */}
          {hasMore && (
            <div
              ref={loadMoreRef}
              className={styles.sentinel}
              aria-hidden="true"
            />
          )}
        </div>
      )}
    </>
  );
}

export default Catalog;
