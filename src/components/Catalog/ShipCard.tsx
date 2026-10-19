import type { Vehicle } from '../../types/vehicle';
import { useI18n, useConfig } from '../../context';
import { toRomanTier } from '../../utils/roman';
import {
  getShipTitle,
  isPremiumShip,
  isSpecialShip,
  getShipIconPath,
} from '../../utils/ship';
import { ShipBadges } from '../ui/ShipBadges';
import { ShipImage } from '../ui/ShipImage';
import styles from './Catalog.module.css';

export interface ShipCardProps {
  ship: Vehicle;
}

export function ShipCard({ ship }: ShipCardProps) {
  const { lang } = useI18n();
  const { vehicleTypes, getNation, getMediaUrl, getFlagUrl } = useConfig();

  const shipTitle = getShipTitle(ship, lang);
  const typeInfo = vehicleTypes[ship.type];
  const typeIconUrl = getMediaUrl(typeInfo?.icons?.default);
  const shipImgUrl = getMediaUrl(getShipIconPath(ship));

  const shipNation = getNation(ship.nation);
  const shipFlagUrl = shipNation
    ? getFlagUrl(shipNation.icons.small || shipNation.icons.default)
    : null;

  const isPremium = isPremiumShip(ship);
  const isSpecial = isSpecialShip(ship);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.tierType}>
          <span>{toRomanTier(ship.level)}</span>
          {shipFlagUrl && (
            <img
              src={shipFlagUrl}
              alt={ship.nation}
              title={shipNation?.localization?.mark?.[lang] || ship.nation}
              className={styles.nationFlag}
              loading="lazy"
            />
          )}
          {typeIconUrl && (
            <img
              src={typeIconUrl}
              alt={ship.type}
              className={styles.typeIcon}
              title={typeInfo?.localization?.mark?.[lang] || ship.type}
              loading="lazy"
            />
          )}
        </div>
        <ShipBadges isPremium={isPremium} isSpecial={isSpecial} />
      </div>

      <h3 className={styles.shipName} title={shipTitle}>
        {shipTitle}
      </h3>

      <ShipImage src={shipImgUrl} alt={shipTitle} />
    </div>
  );
}

export default ShipCard;
