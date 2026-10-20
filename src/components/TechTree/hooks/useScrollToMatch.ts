import { useEffect, type RefObject } from 'react';

/**
 * Automatically scrolls horizontally to the first matching ship node during search.
 */
export function useScrollToMatch(
  containerRef: RefObject<HTMLElement | null>,
  isSearchActive: boolean,
  matchingShipIds?: Set<string>
) {
  useEffect(() => {
    if (!isSearchActive || !matchingShipIds || matchingShipIds.size === 0) return;
    const container = containerRef.current;
    if (!container) return;

    const firstMatchedEl = container.querySelector<HTMLElement>('[data-ship-matched="true"]');
    if (firstMatchedEl) {
      firstMatchedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [containerRef, isSearchActive, matchingShipIds]);
}

export default useScrollToMatch;
