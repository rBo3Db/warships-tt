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

export interface TechTreePremiumCardProps {
  ship: Vehicle;
  isMatch: boolean;
  isDimmed: boolean;
}

export function TechTreePremiumCard({
  ship,
  isMatch,
  isDimmed,
}: TechTreePremiumCardProps) {
  const { lang } = useI18n();
  const { vehicleTypes, getMediaUrl } = useConfig();

  const shipTitle = getShipTitle(ship, lang);
  const typeInfo = vehicleTypes[ship.type];
  const isPremium = isPremiumShip(ship);
  const isSpecial = isSpecialShip(ship);
  const typeIconPath = getVehicleTypeIconPath(typeInfo, { isPremium, isSpecial });
  const typeIcon = (typeIconPath ? getMediaUrl(typeIconPath) : '') || getVehicleTypeFallbackIcon(ship.type);
  const imgUrl = getMediaUrl(getShipIconPath(ship));

  return (
    <div
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
}

export default TechTreePremiumCard;
