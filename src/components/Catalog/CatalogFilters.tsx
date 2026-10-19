import { useI18n, useConfig } from '../../context';
import { toRomanTier } from '../../utils/roman';
import styles from './Catalog.module.css';

export const TIERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

export interface CatalogFiltersProps {
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
  selectedStatus: 'all' | 'researchable' | 'premium';
  onSelectStatus: (status: 'all' | 'researchable' | 'premium') => void;
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
          className={`${styles.item} ${selectedStatus === 'all' ? styles.itemSelected : ''}`}
          onClick={() => onSelectStatus('all')}
        >
          {ui.allStatuses}
        </button>
        <button
          type="button"
          className={`${styles.item} ${selectedStatus === 'researchable' ? styles.itemSelected : ''}`}
          onClick={() => onSelectStatus(selectedStatus === 'researchable' ? 'all' : 'researchable')}
        >
          {ui.onlyResearchable}
        </button>
        <button
          type="button"
          className={`${styles.item} ${selectedStatus === 'premium' ? styles.itemSelected : ''}`}
          onClick={() => onSelectStatus(selectedStatus === 'premium' ? 'all' : 'premium')}
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
