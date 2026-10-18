import type { RefObject } from 'react';
import type { Vehicle, VehicleTypesMap, VehicleTypeInfo } from '../../types/vehicle';
import type { Nation } from '../../types/nation';
import type { UiTranslations } from '../../utils/i18n';
import { Loader } from '../ui/Loader';
import { ErrorCard } from '../ui/ErrorCard';
import { CatalogFilters } from './CatalogFilters';
import { ShipCard } from './ShipCard';
import styles from './Catalog.module.css';

interface CatalogProps {
  ships: Vehicle[];
  totalFilteredCount: number;
  displayLimit: number;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  sortedTypes: [string, VehicleTypeInfo][];
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
  selectedStatus: 'all' | 'researchable' | 'premium';
  onSelectStatus: (status: 'all' | 'researchable' | 'premium') => void;
  selectedTier: number | null;
  onSelectTier: (tier: number | null) => void;
  selectedLang: string;
  mediaPath: string;
  vehicleTypes: VehicleTypesMap;
  nations: Nation[];
  ui: UiTranslations;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export function Catalog({
  ships,
  totalFilteredCount,
  displayLimit,
  loadMoreRef,
  sortedTypes,
  selectedType,
  onSelectType,
  selectedStatus,
  onSelectStatus,
  selectedTier,
  onSelectTier,
  selectedLang,
  mediaPath,
  vehicleTypes,
  nations,
  ui,
  isLoading = false,
  errorMessage = null,
  onRetry,
}: CatalogProps) {
  return (
    <>
      <CatalogFilters
        sortedTypes={sortedTypes}
        selectedType={selectedType}
        onSelectType={onSelectType}
        selectedStatus={selectedStatus}
        onSelectStatus={onSelectStatus}
        selectedTier={selectedTier}
        onSelectTier={onSelectTier}
        selectedLang={selectedLang}
        mediaPath={mediaPath}
        ui={ui}
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
            <ShipCard
              key={ship.id}
              ship={ship}
              selectedLang={selectedLang}
              mediaPath={mediaPath}
              vehicleTypes={vehicleTypes}
              nations={nations}
              ui={ui}
            />
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
