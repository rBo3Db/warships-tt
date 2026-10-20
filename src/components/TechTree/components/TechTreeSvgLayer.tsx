import type { SvgLineCoords } from '../hooks/useTechTreeLines';
import styles from '../TechTree.module.css';

export interface TechTreeSvgLayerProps {
  lines: SvgLineCoords[];
  activeLinkKeys: Set<string>;
  matchingShipIds?: Set<string>;
  isSearchActive: boolean;
  hasHoveredShip: boolean;
}

function getSteppedPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): string {
  // Straight horizontal line if in the same row
  if (Math.abs(y1 - y2) < 3) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  // Pure 90-degree straight orthogonal lines
  const midX = (x1 + x2) / 2;
  return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
}

export function TechTreeSvgLayer({
  lines,
  activeLinkKeys,
  matchingShipIds,
  isSearchActive,
  hasHoveredShip,
}: TechTreeSvgLayerProps) {
  return (
    <svg className={styles.svgLayer}>
      <defs>
        {/* Inactive line arrow */}
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 1 2 L 7 5 L 1 8 Z" fill="#35424a" />
        </marker>

        {/* Active / highlighted line arrow */}
        <marker
          id="arrowActive"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 1 2 L 7 5 L 1 8 Z" fill="#ffffff" />
        </marker>
      </defs>

      {lines.map((line) => {
        const key = `${line.fromId}->${line.toId}`;
        const isActive = activeLinkKeys.has(key);
        const isLineSearchMatch =
          isSearchActive &&
          Boolean(matchingShipIds && (matchingShipIds.has(line.fromId) || matchingShipIds.has(line.toId)));

        const isDimmed =
          (hasHoveredShip && !isActive) ||
          (isSearchActive && !isLineSearchMatch && !isActive);

        const pathD = getSteppedPath(line.x1, line.y1, line.x2, line.y2);

        const strokeColor = isActive || isLineSearchMatch ? '#ffffff' : isDimmed ? '#1d242b' : '#35424a';
        const strokeWidth = isActive || isLineSearchMatch ? 2 : 1.5;

        return (
          <path
            key={key}
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            markerEnd={
              isActive || isLineSearchMatch ? 'url(#arrowActive)' : isDimmed ? 'none' : 'url(#arrow)'
            }
            style={{
              filter: isActive || isLineSearchMatch ? 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.4))' : 'none',
              transition: 'stroke 0.15s ease, stroke-width 0.15s ease',
            }}
          />
        );
      })}
    </svg>
  );
}

export default TechTreeSvgLayer;
