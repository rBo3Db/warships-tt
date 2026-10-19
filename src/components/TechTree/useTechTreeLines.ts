import { useState, useRef, useCallback, useLayoutEffect, type RefObject } from 'react';
import type { TreeLink } from '../../utils/techTree';

export interface SvgLineCoords {
  fromId: string;
  toId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface UseTechTreeLinesResult {
  containerRef: RefObject<HTMLDivElement | null>;
  svgLines: SvgLineCoords[];
  updateLines: () => void;
}

/**
 * Calculates SVG line coordinates connecting nodes within the scrollable tech tree container.
 */
export function useTechTreeLines(
  links: TreeLink[],
  additionalDeps: unknown[] = []
): UseTechTreeLinesResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [svgLines, setSvgLines] = useState<SvgLineCoords[]>([]);

  const updateLines = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const cRect = container.getBoundingClientRect();
    const lines: SvgLineCoords[] = [];

    for (const link of links) {
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
  }, [links]);

  useLayoutEffect(() => {
    updateLines();
    const handleResize = () => updateLines();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateLines, ...additionalDeps]);

  return { containerRef, svgLines, updateLines };
}
