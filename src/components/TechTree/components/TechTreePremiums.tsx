import type { Vehicle } from '../../../types/vehicle';
import { useI18n } from '../../../context/I18nContext';
import { useConfig } from '../../../context/ConfigContext';
import { toRomanTier } from '../../../utils/roman';
import {
  getShipTitle,
  getShipIconPath,
  getVehicleTypeIconPath,
  getVehicleTypeFallbackIcon,
  isPremiumShip,
  isSpecialShip,
} from '../../../utils/ship';
import { ShipBadges } from '../../ui/ShipBadges';
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
  const { lang, ui } = useI18n();
  const { vehicleTypes, getMediaUrl } = useConfig();

  if (ships.length === 0) return null;

  return (
    <div className={styles.premiumsContainer}>
      <h3 className={styles.sectionHeading}>{ui.premiums}</h3>
      <div className={styles.premiumsGrid}>
        {ships.map((ship) => {
          const shipTitle = getShipTitle(ship, lang);
          const typeInfo = vehicleTypes[ship.type];
          const isPremium = isPremiumShip(ship);
          const isSpecial = isSpecialShip(ship);
          const typeIconPath = getVehicleTypeIconPath(typeInfo, { isPremium, isSpecial });
          const typeIcon = (typeIconPath ? getMediaUrl(typeIconPath) : '') || getVehicleTypeFallbackIcon(ship.type);
          const imgUrl = getMediaUrl(getShipIconPath(ship));

          const isMatch = isSearchActive && Boolean(matchingShipIds?.has(ship.id));
          const isDimmed = isSearchActive && !isMatch;

          return (
            <div
              key={ship.id}
              data-ship-matched={isMatch ? 'true' : 'false'}
              className={`${styles.premiumCard} ${isMatch ? styles.nodeCardMatch : ''} ${
                isDimmed ? styles.nodeCardDimmed : ''
              }`}
            >
              <div className={styles.nodeHeader}>
                <div className={styles.premiumTierWrapper}>
                  <span>{toRomanTier(ship.level)}</span>
                  {typeIcon && (
                    <img src={typeIcon} alt={ship.type} className={styles.premiumTypeIcon} />
                  )}
                </div>
                <ShipBadges isPremium={isPremium} isSpecial={isSpecial} />
              </div>

              {imgUrl && (
                <img
                  src={imgUrl}
                  alt={shipTitle}
                  className={styles.nodeThumb}
                  loading="lazy"
                />
              )}

              <p className={styles.nodeName} title={shipTitle}>
                {shipTitle}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TechTreePremiums;
