import type { Vehicle } from '../../types/vehicle';
import { useI18n, useConfig } from '../../context';
import { toRomanTier } from '../../utils/roman';
import styles from './Catalog.module.css';

export interface ShipCardProps {
  ship: Vehicle;
}

export function ShipCard({ ship }: ShipCardProps) {
  const { lang, ui } = useI18n();
  const { vehicleTypes, getNation, getMediaUrl, getFlagUrl } = useConfig();

  const shipTitle =
    ship.localization?.mark?.[lang] ||
    ship.localization?.shortmark?.[lang] ||
    ship.name;

  const typeInfo = vehicleTypes[ship.type];
  const typeIconUrl = getMediaUrl(typeInfo?.icons?.default);
  const shipImgUrl = getMediaUrl(
    ship.icons?.medium || ship.icons?.large || ship.icons?.small || ship.icons?.default
  );

  const shipNation = getNation(ship.nation);
  const shipFlagUrl = shipNation
    ? getFlagUrl(shipNation.icons.small || shipNation.icons.default)
    : null;

  const isPremium = ship.tags?.includes('uiPremium');
  const isSpecial = ship.tags?.includes('special') || ship.tags?.includes('uiSpecial');

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
        <div>
          {isPremium && <span className={styles.badge}>{ui.premium}</span>}
          {isSpecial && <span className={styles.badge}>{ui.special}</span>}
        </div>
      </div>

      <h3 className={styles.shipName} title={shipTitle}>
        {shipTitle}
      </h3>

      {shipImgUrl ? (
        <img
          src={shipImgUrl}
          alt={shipTitle}
          className={styles.shipImage}
          loading="lazy"
        />
      ) : (
        <div className={styles.empty}>{ui.noImage}</div>
      )}
    </div>
  );
}

export default ShipCard;
