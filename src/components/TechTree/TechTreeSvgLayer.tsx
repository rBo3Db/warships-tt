import type { SvgLineCoords } from './useTechTreeLines';
import styles from './TechTree.module.css';

export interface TechTreeSvgLayerProps {
  lines: SvgLineCoords[];
  activeLinkKeys: Set<string>;
  matchingShipIds?: Set<string>;
  isSearchActive: boolean;
  hasHoveredShip: boolean;
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

      {lines.map((line) => {
        const key = `${line.fromId}->${line.toId}`;
        const isActive = activeLinkKeys.has(key);
        const isLineSearchMatch =
          isSearchActive &&
          Boolean(matchingShipIds && (matchingShipIds.has(line.fromId) || matchingShipIds.has(line.toId)));

        const isDimmed =
          (hasHoveredShip && !isActive) ||
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
  );
}

export default TechTreeSvgLayer;
