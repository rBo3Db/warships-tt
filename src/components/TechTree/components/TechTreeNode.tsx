import type { Vehicle } from '../../../types/vehicle';
import { useI18n, useConfig } from '../../../context';
import { toRomanTier } from '../../../utils/roman';
import { getShipTitle } from '../../../utils/ship';
import styles from '../TechTree.module.css';

export interface TechTreeNodeProps {
  ship: Vehicle;
  isHovered: boolean;
  isInLineage: boolean;
  isMatch: boolean;
  isDimmed: boolean;
  onHover: (shipId: string | null) => void;
}

export function TechTreeNode({
  ship,
  isHovered,
  isInLineage,
  isMatch,
  isDimmed,
  onHover,
}: TechTreeNodeProps) {
  const { lang } = useI18n();
  const { getMediaUrl } = useConfig();

  const shipTitle = getShipTitle(ship, lang);
  const imgUrl = getMediaUrl(ship.icons?.small || ship.icons?.medium || ship.icons?.default);

  return (
    <div
      data-ship-node={ship.id}
      data-ship-matched={isMatch ? 'true' : 'false'}
      className={`${styles.nodeCard} ${
        isHovered || isInLineage ? styles.nodeCardActive : ''
      } ${isMatch ? styles.nodeCardMatch : ''} ${
        isDimmed ? styles.nodeCardDimmed : ''
      }`}
      onMouseEnter={() => onHover(ship.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className={styles.nodeHeader}>
        <span className={styles.nodeTier}>{toRomanTier(ship.level)}</span>
        {ship.tags?.includes('superShip') && (
          <span className={styles.badge}>★</span>
        )}
      </div>

      <p className={styles.nodeName} title={shipTitle}>
        {shipTitle}
      </p>

      {imgUrl && (
        <img
          src={imgUrl}
          alt={shipTitle}
          className={styles.nodeThumb}
          loading="lazy"
        />
      )}
    </div>
  );
}

export default TechTreeNode;
