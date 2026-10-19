import { useI18n } from '../../../context';
import styles from './ShipBadges.module.css';

export interface ShipBadgesProps {
  isPremium?: boolean;
  isSpecial?: boolean;
  className?: string;
}

export function ShipBadges({ isPremium, isSpecial, className }: ShipBadgesProps) {
  const { ui } = useI18n();

  if (!isPremium && !isSpecial) {
    return null;
  }

  return (
    <div className={`${styles.badges} ${className || ''}`}>
      {isPremium && <span className={`${styles.badge} ${styles.premium}`}>{ui.premium}</span>}
      {isSpecial && <span className={`${styles.badge} ${styles.special}`}>{ui.special}</span>}
    </div>
  );
}

export default ShipBadges;
