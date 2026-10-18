import type { Vehicle, VehicleTypesMap } from '../../types/vehicle';
import type { Nation } from '../../types/nation';
import type { UiTranslations } from '../../utils/i18n';
import { toRomanTier } from '../../utils/roman';
import { buildMediaUrl } from '../../services/vehiclesService';
import { buildFlagUrl } from '../../services/nationsService';
import styles from './Catalog.module.css';

interface ShipCardProps {
  ship: Vehicle;
  selectedLang: string;
  mediaPath: string;
  vehicleTypes: VehicleTypesMap;
  nations: Nation[];
  ui: UiTranslations;
}

export function ShipCard({
  ship,
  selectedLang,
  mediaPath,
  vehicleTypes,
  nations,
  ui,
}: ShipCardProps) {
  const shipTitle =
    ship.localization?.mark?.[selectedLang] ||
    ship.localization?.shortmark?.[selectedLang] ||
    ship.name;

  const typeInfo = vehicleTypes[ship.type];
  const typeIconUrl = buildMediaUrl(mediaPath, typeInfo?.icons?.default);
  const shipImgUrl = buildMediaUrl(
    mediaPath,
    ship.icons?.medium || ship.icons?.large || ship.icons?.small || ship.icons?.default
  );

  const shipNation = nations.find((n) => n.name === ship.nation);
  const shipFlagUrl = shipNation
    ? buildFlagUrl(mediaPath, shipNation.icons.small || shipNation.icons.default)
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
              title={shipNation?.localization?.mark?.[selectedLang] || ship.nation}
              className={styles.nationFlag}
              loading="lazy"
            />
          )}
          {typeIconUrl && (
            <img
              src={typeIconUrl}
              alt={ship.type}
              className={styles.typeIcon}
              title={typeInfo?.localization?.mark?.[selectedLang] || ship.type}
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
