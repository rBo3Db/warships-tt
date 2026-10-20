import type { TechTreeData } from '../../../utils/techTree';
import { useI18n, useConfig } from '../../../context';
import { toRomanTier } from '../../../utils/roman';
import { TechTreeNode } from './TechTreeNode';
import styles from '../TechTree.module.css';

export interface TechTreeGridProps {
  treeData: TechTreeData;
  hoveredShipId: string | null;
  onHoverShip: (shipId: string | null) => void;
  activeNodeIds: Set<string>;
  matchingShipIds?: Set<string>;
  isSearchActive: boolean;
}

export function TechTreeGrid({
  treeData,
  hoveredShipId,
  onHoverShip,
  activeNodeIds,
  matchingShipIds,
  isSearchActive,
}: TechTreeGridProps) {
  const { lang } = useI18n();
  const { vehicleTypes, getMediaUrl } = useConfig();

  return (
    <div className={styles.treeGrid}>
      {/* Header row: Roman tier numerals */}
      <div className={styles.tierHeaders}>
        <div className={styles.tierHeaderCell} />
        {treeData.tiers.map((tier) => (
          <div key={tier} className={styles.tierHeaderCell}>
            {toRomanTier(tier)}
          </div>
        ))}
      </div>

      {/* Rows for each ship class */}
      {treeData.classes.map((cls) => {
        const classInfo = vehicleTypes[cls];
        const classTitle = classInfo?.localization?.mark?.[lang] || cls;
        const classIcon = getMediaUrl(classInfo?.icons?.default);

        return (
          <div key={cls} className={styles.classRow}>
            {/* Class label column */}
            <div className={styles.classLabel}>
              {classIcon && <img src={classIcon} alt={classTitle} className={styles.classIcon} />}
              <span>{classTitle}</span>
            </div>

            {/* Cells for each tier in this class */}
            {treeData.tiers.map((tier) => {
              const shipsInCell = treeData.grid[cls]?.[tier] || [];

              return (
                <div key={tier} className={styles.tierCell}>
                  {shipsInCell.map((ship) => {
                    const isHovered = hoveredShipId === ship.id;
                    const isInLineage = activeNodeIds.has(ship.id);
                    const isMatch = isSearchActive && Boolean(matchingShipIds?.has(ship.id));
                    const isDimmed =
                      (hoveredShipId !== null && !isInLineage) ||
                      (isSearchActive && !isMatch && !isInLineage);

                    return (
                      <TechTreeNode
                        key={ship.id}
                        ship={ship}
                        isHovered={isHovered}
                        isInLineage={isInLineage}
                        isMatch={isMatch}
                        isDimmed={isDimmed}
                        onHover={onHoverShip}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default TechTreeGrid;
