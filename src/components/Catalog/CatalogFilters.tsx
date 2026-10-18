import type { VehicleTypeInfo } from '../../types/vehicle';
import type { UiTranslations } from '../../utils/i18n';
import { toRomanTier } from '../../utils/roman';
import { buildMediaUrl } from '../../services/vehiclesService';
import styles from './Catalog.module.css';

export const TIERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

interface CatalogFiltersProps {
  sortedTypes: [string, VehicleTypeInfo][];
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
  selectedStatus: 'all' | 'researchable' | 'premium';
  onSelectStatus: (status: 'all' | 'researchable' | 'premium') => void;
  selectedTier: number | null;
  onSelectTier: (tier: number | null) => void;
  selectedLang: string;
  mediaPath: string;
  ui: UiTranslations;
}

export function CatalogFilters({
  sortedTypes,
  selectedType,
  onSelectType,
  selectedStatus,
  onSelectStatus,
  selectedTier,
  onSelectTier,
  selectedLang,
  mediaPath,
  ui,
}: CatalogFiltersProps) {
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
        {sortedTypes.map(([typeKey, typeInfo]) => {
          const isSelected = selectedType === typeKey;
          const typeTitle = typeInfo.localization?.mark?.[selectedLang] || typeKey;
          const iconUrl = buildMediaUrl(mediaPath, typeInfo.icons?.default);

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
