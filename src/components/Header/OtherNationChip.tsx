import type { Vehicle } from '../../types/vehicle';
import { useI18n, useConfig } from '../../context';
import { toRomanTier } from '../../utils/roman';
import { getShipTitle } from '../../utils/ship';
import styles from './Header.module.css';

export interface OtherNationChipProps {
  ship: Vehicle;
  onJumpToShip: (ship: Vehicle) => void;
}

export function OtherNationChip({ ship, onJumpToShip }: OtherNationChipProps) {
  const { lang } = useI18n();
  const { getNation, getFlagUrl } = useConfig();

  const nat = getNation(ship.nation);
  const flag = nat ? getFlagUrl(nat.icons.small || nat.icons.default) : null;
  const shipTitle = getShipTitle(ship, lang);

  return (
    <button
      type="button"
      className={styles.otherNationChip}
      onClick={() => onJumpToShip(ship)}
    >
      {flag && <img src={flag} alt={ship.nation} className={styles.flag} />}
      <span>
        {shipTitle} ({toRomanTier(ship.level)})
      </span>
    </button>
  );
}

export default OtherNationChip;
