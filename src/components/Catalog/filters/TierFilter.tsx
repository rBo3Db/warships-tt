import { toRomanTier } from '../../../utils/roman';
import styles from '../Catalog.module.css';

export const TIERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

export interface TierFilterProps {
  selectedTier: number | null;
  onSelectTier: (tier: number | null) => void;
}

export function TierFilter({ selectedTier, onSelectTier }: TierFilterProps) {
  return (
    <div className={styles.list}>
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
  );
}

export default TierFilter;
