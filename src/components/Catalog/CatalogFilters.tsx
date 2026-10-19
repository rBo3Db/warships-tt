import { useI18n, useConfig } from '../../context';
import { toRomanTier } from '../../utils/roman';
import { ShipStatus } from '../../types/vehicle';
import styles from './Catalog.module.css';

export const TIERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

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
  const { lang, ui } = useI18n();
  const { sortedVehicleTypes, getMediaUrl } = useConfig();

  return (
    <div className={styles.filtersContainer}>
      {/* Class filter */}
      <div className={styles.list}>
        <button
          type="button"
          className={`${styles.item} ${selectedType === null ? styles.itemSelected : ''}`}
          onClick={() => onSelectType(null)}
        >
          {ui.allTypes}
        </button>
        {sortedVehicleTypes.map(([typeKey, typeInfo]) => {
          const isSelected = selectedType === typeKey;
          const typeTitle = typeInfo.localization?.mark?.[lang] || typeKey;
          const iconUrl = getMediaUrl(typeInfo.icons?.default);

          return (
            <button
              key={typeKey}
              type="button"
              className={`${styles.item} ${isSelected ? styles.itemSelected : ''}`}
              onClick={() => onSelectType(isSelected ? null : typeKey)}
            >
              {iconUrl && (
                <img
                  src={iconUrl}
                  alt={typeTitle}
                  className={styles.typeIcon}
                  loading="lazy"
                />
              )}
              <span>{typeTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Status toggle: All / Researchable / Premium */}
      <div className={styles.list}>
        <button
          type="button"
          className={`${styles.item} ${selectedStatus === ShipStatus.ALL ? styles.itemSelected : ''}`}
          onClick={() => onSelectStatus(ShipStatus.ALL)}
        >
          {ui.allStatuses}
        </button>
        <button
          type="button"
          className={`${styles.item} ${selectedStatus === ShipStatus.RESEARCHABLE ? styles.itemSelected : ''}`}
          onClick={() =>
            onSelectStatus(
              selectedStatus === ShipStatus.RESEARCHABLE ? ShipStatus.ALL : ShipStatus.RESEARCHABLE
            )
          }
        >
          {ui.onlyResearchable}
        </button>
        <button
          type="button"
          className={`${styles.item} ${selectedStatus === ShipStatus.PREMIUM ? styles.itemSelected : ''}`}
          onClick={() =>
            onSelectStatus(
              selectedStatus === ShipStatus.PREMIUM ? ShipStatus.ALL : ShipStatus.PREMIUM
            )
          }
        >
          {ui.onlyPremium}
        </button>
      </div>

      {/* Tier filter: All / I ... XI */}
      <div className={styles.list}>
        <button
          type="button"
          className={`${styles.item} ${selectedTier === null ? styles.itemSelected : ''}`}
          onClick={() => onSelectTier(null)}
        >
          {ui.allTiers}
        </button>
        {TIERS.map((tier) => {
          const isSelected = selectedTier === tier;
          return (
            <button
              key={tier}
              type="button"
              className={`${styles.item} ${isSelected ? styles.itemSelected : ''}`}
              onClick={() => onSelectTier(isSelected ? null : tier)}
            >
              <span>{toRomanTier(tier)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CatalogFilters;
