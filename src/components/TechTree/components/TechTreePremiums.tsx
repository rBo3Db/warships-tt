import type { Vehicle } from '../../../types/vehicle';
import { useI18n } from '../../../context/I18nContext';
import { TechTreePremiumCard } from './TechTreePremiumCard';
import styles from '../TechTree.module.css';

export interface TechTreePremiumsProps {
  ships: Vehicle[];
  matchingShipIds?: Set<string>;
  isSearchActive: boolean;
}

export function TechTreePremiums({
  ships,
  matchingShipIds,
  isSearchActive,
}: TechTreePremiumsProps) {
  const { ui } = useI18n();

  if (ships.length === 0) return null;

  return (
    <div className={styles.premiumsContainer}>
      <h3 className={styles.sectionHeading}>{ui.premiums}</h3>
      <div className={styles.premiumsGrid}>
        {ships.map((ship) => {
          const isMatch = isSearchActive && Boolean(matchingShipIds?.has(ship.id));
          const isDimmed = isSearchActive && !isMatch;

          return (
            <TechTreePremiumCard
              key={ship.id}
              ship={ship}
              isMatch={isMatch}
              isDimmed={isDimmed}
            />
          );
        })}
      </div>
    </div>
  );
}

export default TechTreePremiums;
