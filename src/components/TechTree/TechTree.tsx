import { useMemo, useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import type { Vehicle, VehicleTypesMap } from '../../types/vehicle';
import type { UiTranslations } from '../../utils/i18n';
import { Loader } from '../ui/Loader';
import { buildTechTreeData } from '../../utils/techTree';
import { toRomanTier } from '../../utils/roman';
import { buildMediaUrl } from '../../services/vehiclesService';
import styles from './TechTree.module.css';

interface TechTreeProps {
  nationShips: Vehicle[];
  selectedLang: string;
  mediaPath: string;
  vehicleTypes: VehicleTypesMap;
  ui: UiTranslations;
  searchQuery?: string;
  matchingShipIds?: Set<string>;
  isLoading?: boolean;
}

interface SvgLineCoords {
  fromId: string;
  toId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function TechTree({
  nationShips,
  selectedLang,
  mediaPath,
  vehicleTypes,
  ui,
  searchQuery = '',
  matchingShipIds,
  isLoading = false,
}: TechTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredShipId, setHoveredShipId] = useState<string | null>(null);
  const [svgLines, setSvgLines] = useState<SvgLineCoords[]>([]);

  const treeData = useMemo(() => buildTechTreeData(nationShips), [nationShips]);

  const isSearchActive = Boolean(searchQuery && searchQuery.trim().length > 0);

  // Recalculate line coordinates between nodes
  const updateLines = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const cRect = container.getBoundingClientRect();
    const lines: SvgLineCoords[] = [];

    for (const link of treeData.links) {
      const fromEl = container.querySelector<HTMLElement>(`[data-ship-node="${link.fromId}"]`);
      const toEl = container.querySelector<HTMLElement>(`[data-ship-node="${link.toId}"]`);

      if (fromEl && toEl) {
        const fRect = fromEl.getBoundingClientRect();
        const tRect = toEl.getBoundingClientRect();

        const x1 = fRect.right - cRect.left + container.scrollLeft;
        const y1 = fRect.top + fRect.height / 2 - cRect.top + container.scrollTop;
        const x2 = tRect.left - cRect.left + container.scrollLeft;
        const y2 = tRect.top + tRect.height / 2 - cRect.top + container.scrollTop;

        lines.push({
          fromId: link.fromId,
          toId: link.toId,
          x1,
          y1,
          x2,
          y2,
        });
      }
    }

    setSvgLines(lines);
  }, [treeData.links]);

  useLayoutEffect(() => {
    updateLines();
    const handleResize = () => updateLines();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateLines, selectedLang]);

  // Auto-scroll horizontally to the first matching ship when searching
  useEffect(() => {
    if (!isSearchActive || !matchingShipIds || matchingShipIds.size === 0) return;
    const container = containerRef.current;
    if (!container) return;
    const firstMatchedEl = container.querySelector<HTMLElement>('[data-ship-matched="true"]');
    if (firstMatchedEl) {
      firstMatchedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [isSearchActive, matchingShipIds]);

  // Calculate lineage (ancestors + descendants) for highlighting
  const activeLineage = useMemo(() => {
    if (!hoveredShipId) return { nodeIds: new Set<string>(), linkKeys: new Set<string>() };

    const nodeIds = new Set<string>([hoveredShipId]);
    const linkKeys = new Set<string>();

    // 1. Ancestors
    let current = [hoveredShipId];
    while (current.length > 0) {
      const nextBatch: string[] = [];
      for (const id of current) {
        for (const link of treeData.links) {
          if (link.toId === id) {
            nodeIds.add(link.fromId);
            linkKeys.add(`${link.fromId}->${link.toId}`);
            nextBatch.push(link.fromId);
          }
        }
      }
      current = nextBatch;
    }

    // 2. Descendants
    current = [hoveredShipId];
    while (current.length > 0) {
      const nextBatch: string[] = [];
      for (const id of current) {
        for (const link of treeData.links) {
          if (link.fromId === id) {
            nodeIds.add(link.toId);
            linkKeys.add(`${link.fromId}->${link.toId}`);
            nextBatch.push(link.toId);
          }
        }
      }
      current = nextBatch;
    }

    return { nodeIds, linkKeys };
  }, [hoveredShipId, treeData.links]);

  if (isLoading) {
    return (
      <div className={styles.wrapper} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Loader />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Scrollable Tree View with SVG connection lines */}
      <div ref={containerRef} className={styles.treeScrollContainer}>
        {/* SVG connection lines layer */}
        <svg className={styles.svgLayer}>
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#888" />
            </marker>
            <marker
              id="arrowActive"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#0066cc" />
            </marker>
          </defs>

          {svgLines.map((line) => {
            const key = `${line.fromId}->${line.toId}`;
            const isActive = activeLineage.linkKeys.has(key);
            const isLineSearchMatch =
              isSearchActive &&
              matchingShipIds &&
              (matchingShipIds.has(line.fromId) || matchingShipIds.has(line.toId));

            const isDimmed =
              (hoveredShipId !== null && !isActive) ||
              (isSearchActive && !isLineSearchMatch && !isActive);

            const dx = Math.max(30, (line.x2 - line.x1) * 0.45);
            const pathD = `M ${line.x1} ${line.y1} C ${line.x1 + dx} ${line.y1}, ${line.x2 - dx} ${line.y2}, ${line.x2} ${line.y2}`;

            return (
              <path
                key={key}
                d={pathD}
                fill="none"
                stroke={isActive || isLineSearchMatch ? '#0066cc' : isDimmed ? '#eee' : '#888'}
                strokeWidth={isActive || isLineSearchMatch ? 2.5 : 1.5}
                markerEnd={
                  isActive || isLineSearchMatch ? 'url(#arrowActive)' : isDimmed ? 'none' : 'url(#arrow)'
                }
              />
            );
          })}
        </svg>

        {/* Tree Grid: Tiers and Classes */}
        <div className={styles.treeGrid}>
          {/* Header row: Roman tier numerals */}
          <div className={styles.tierHeaders}>
            <div className={styles.tierHeaderCell} />
            {treeData.tiers.map((t) => (
              <div key={t} className={styles.tierHeaderCell}>
                {toRomanTier(t)}
              </div>
            ))}
          </div>

          {/* Rows for each ship class */}
          {treeData.classes.map((cls) => {
            const classInfo = vehicleTypes[cls];
            const classTitle = classInfo?.localization?.mark?.[selectedLang] || cls;
            const classIcon = buildMediaUrl(mediaPath, classInfo?.icons?.default);

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
                        const shipTitle =
                          ship.localization?.mark?.[selectedLang] ||
                          ship.localization?.shortmark?.[selectedLang] ||
                          ship.name;

                        const imgUrl = buildMediaUrl(
                          mediaPath,
                          ship.icons?.small || ship.icons?.medium || ship.icons?.default
                        );

                        const isHovered = hoveredShipId === ship.id;
                        const isInLineage = activeLineage.nodeIds.has(ship.id);
                        const isMatch = isSearchActive && Boolean(matchingShipIds?.has(ship.id));
                        const isDimmed =
                          (hoveredShipId !== null && !isInLineage) ||
                          (isSearchActive && !isMatch && !isInLineage);

                        return (
                          <div
                            key={ship.id}
                            data-ship-node={ship.id}
                            data-ship-matched={isMatch ? 'true' : 'false'}
                            className={`${styles.nodeCard} ${
                              isHovered || isInLineage ? styles.nodeCardActive : ''
                            } ${isMatch ? styles.nodeCardMatch : ''} ${
                              isDimmed ? styles.nodeCardDimmed : ''
                            }`}
                            onMouseEnter={() => setHoveredShipId(ship.id)}
                            onMouseLeave={() => setHoveredShipId(null)}
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
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium & Special ships section */}
      {treeData.premiums.length > 0 && (
        <div className={styles.premiumsContainer}>
          <h3 className={styles.sectionHeading}>{ui.premiums}</h3>
          <div className={styles.premiumsGrid}>
            {treeData.premiums.map((ship) => {
              const shipTitle =
                ship.localization?.mark?.[selectedLang] ||
                ship.localization?.shortmark?.[selectedLang] ||
                ship.name;

              const typeInfo = vehicleTypes[ship.type];
              const typeIcon = buildMediaUrl(mediaPath, typeInfo?.icons?.default);
              const imgUrl = buildMediaUrl(
                mediaPath,
                ship.icons?.small || ship.icons?.medium || ship.icons?.default
              );

              const isPremium = ship.tags?.includes('uiPremium');
              const isSpecial = ship.tags?.includes('special') || ship.tags?.includes('uiSpecial');

              const isMatch = isSearchActive && Boolean(matchingShipIds?.has(ship.id));
              const isDimmed = isSearchActive && !isMatch;

              return (
                <div
                  key={ship.id}
                  data-ship-matched={isMatch ? 'true' : 'false'}
                  className={`${styles.premiumCard} ${isMatch ? styles.nodeCardMatch : ''} ${
                    isDimmed ? styles.nodeCardDimmed : ''
                  }`}
                >
                  <div className={styles.nodeHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>{toRomanTier(ship.level)}</span>
                      {typeIcon && <img src={typeIcon} alt={ship.type} style={{ width: 14, height: 14 }} />}
                    </div>
                    <div>
                      {isPremium && <span className={styles.badge}>{ui.premium}</span>}
                      {isSpecial && <span className={styles.badge}>{ui.special}</span>}
                    </div>
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
            })}
          </div>
        </div>
      )}
    </div>
  );
}
