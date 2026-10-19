import { useMemo, useState } from 'react';
import type { Vehicle } from '../../types/vehicle';
import { useI18n } from '../../context';
import { Loader } from '../ui/Loader';
import { ErrorCard } from '../ui/ErrorCard';
import { CenteredContainer } from '../ui/CenteredContainer';
import { buildTechTreeData, calculateActiveLineage } from '../../utils/techTree';
import { useTechTreeLines } from './useTechTreeLines';
import { useScrollToMatch } from './useScrollToMatch';
import { TechTreeSvgLayer } from './TechTreeSvgLayer';
import { TechTreeGrid } from './TechTreeGrid';
import { TechTreePremiums } from './TechTreePremiums';
import styles from './TechTree.module.css';

export interface TechTreeProps {
  nationShips: Vehicle[];
  searchQuery?: string;
  matchingShipIds?: Set<string>;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export function TechTree({
  nationShips,
  searchQuery = '',
  matchingShipIds,
  isLoading = false,
  errorMessage,
  onRetry,
}: TechTreeProps) {
  const { lang, ui } = useI18n();
  const [hoveredShipId, setHoveredShipId] = useState<string | null>(null);

  const treeData = useMemo(() => buildTechTreeData(nationShips), [nationShips]);
  const isSearchActive = Boolean(searchQuery && searchQuery.trim().length > 0);

  // SVG connection lines between tech tree nodes
  const { containerRef, svgLines } = useTechTreeLines(treeData.links, [lang]);

  // Auto-scroll horizontally to the first matching ship when searching
  useScrollToMatch(containerRef, isSearchActive, matchingShipIds);

  // Calculate lineage (ancestors + descendants) for hover highlighting
  const activeLineage = useMemo(
    () => calculateActiveLineage(hoveredShipId, treeData.links),
    [hoveredShipId, treeData.links]
  );

  if (errorMessage) {
    return (
      <CenteredContainer minHeight="section" className={styles.wrapper}>
        <ErrorCard
          title={ui.shipsLoadError}
          message={errorMessage}
          retryLabel={ui.retry}
          onRetry={onRetry}
        />
      </CenteredContainer>
    );
  }

  if (isLoading) {
    return (
      <CenteredContainer minHeight="section" className={styles.wrapper}>
        <Loader />
      </CenteredContainer>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Scrollable Tree View with SVG connection lines */}
      <div ref={containerRef} className={styles.treeScrollContainer}>
        <TechTreeSvgLayer
          lines={svgLines}
          activeLinkKeys={activeLineage.linkKeys}
          matchingShipIds={matchingShipIds}
          isSearchActive={isSearchActive}
          hasHoveredShip={hoveredShipId !== null}
        />

        <TechTreeGrid
          treeData={treeData}
          hoveredShipId={hoveredShipId}
          onHoverShip={setHoveredShipId}
          activeNodeIds={activeLineage.nodeIds}
          matchingShipIds={matchingShipIds}
          isSearchActive={isSearchActive}
        />
      </div>

      {/* Premium & Special ships section */}
      <TechTreePremiums
        ships={treeData.premiums}
        matchingShipIds={matchingShipIds}
        isSearchActive={isSearchActive}
      />
    </div>
  );
}

export default TechTree;
