import type { Vehicle } from '../../../types/vehicle';
import { useI18n } from '../../../context';
import { OtherNationChip } from './OtherNationChip';
import styles from '../Header.module.css';

export interface OtherNationsBannerProps {
  matches: Vehicle[];
  onJumpToShip: (ship: Vehicle) => void;
}

export function OtherNationsBanner({
  matches,
  onJumpToShip,
}: OtherNationsBannerProps) {
  const { ui } = useI18n();

  if (matches.length === 0) return null;

  return (
    <div className={styles.otherNationsBanner}>
      <span className={styles.bannerLabel}>{ui.foundInOtherNations}</span>
      <div className={styles.chipList}>
        {matches.map((ship) => (
          <OtherNationChip
            key={ship.id}
            ship={ship}
            onJumpToShip={onJumpToShip}
          />
        ))}
      </div>
    </div>
  );
}

export default OtherNationsBanner;
