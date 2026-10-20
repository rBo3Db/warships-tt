import type { TechTreeData } from '../../../utils/techTree';
import { TechTreeNode } from './TechTreeNode';
import { toRomanTier } from '../../../utils/roman';
import styles from '../TechTree.module.css';

export interface TechTreeGridProps {
  treeData: TechTreeData;
  hoveredShipId: string | null;
  activeLineage?: { nodeIds: Set<string> };
  activeNodeIds?: Set<string>;
  isSearchActive: boolean;
  matchingShipIds?: Set<string>;
  onHoverShip: (shipId: string | null) => void;
}

export function TechTreeGrid({
  treeData,
  hoveredShipId,
  activeLineage,
  activeNodeIds,
  isSearchActive,
  matchingShipIds,
  onHoverShip,
}: TechTreeGridProps) {
  const nodeIds = activeNodeIds ?? activeLineage?.nodeIds ?? new Set<string>();
  return (
    <div className={styles.treeGrid}>
      {/* Header row: Tiers 1..10+ */}
      <div className={styles.rowHeader}>
        <div className={styles.classLabel} />
        {treeData.tiers.map((tier) => (
          <div key={tier} className={styles.tierHeader}>
            {toRomanTier(tier)}
          </div>
        ))}
      </div>

      {/* Grid rows per ship class */}
      {treeData.classes.map((cls) => {
        // Hide row if empty
        const hasShips = treeData.tiers.some(
          (t) => (treeData.grid[cls]?.[t]?.length ?? 0) > 0
        );
        if (!hasShips) return null;

        return (
          <div key={cls} className={styles.row}>
            <div className={styles.classLabel}>{cls}</div>
            {treeData.tiers.map((tier) => {
              const cellShips = treeData.grid[cls]?.[tier] || [];

              return (
                <div key={tier} className={styles.cell}>
                  {cellShips.map((ship) => {
                    const isHovered = hoveredShipId === ship.id;
                    const isInLineage = nodeIds.has(ship.id);
                    const isMatch = isSearchActive && Boolean(matchingShipIds?.has(ship.id));
                    const isDimmed = isSearchActive && !isMatch;

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
