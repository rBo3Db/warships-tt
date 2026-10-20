import { useState, useRef, useEffect, useMemo, type RefObject } from 'react';

export interface UseInfiniteScrollOptions<T> {
  items: T[];
  chunkSize?: number;
  resetDeps?: unknown[];
  rootMargin?: string;
}

export interface UseInfiniteScrollResult<T> {
  visibleItems: T[];
  displayLimit: number;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  hasMore: boolean;
}

/**
 * Manages incremental chunk loading for long lists using IntersectionObserver.
 */
export function useInfiniteScroll<T>({
  items,
  chunkSize = 36,
  resetDeps = [],
  rootMargin = '400px',
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollResult<T> {
  const [displayLimit, setDisplayLimit] = useState(chunkSize);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Reset display limit when dependencies change (e.g. filters or search query)
  useEffect(() => {
    setDisplayLimit(chunkSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chunkSize, ...resetDeps]);

  // Observe scroll target to load the next chunk
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setDisplayLimit((prev) => {
            if (prev < items.length) {
              return Math.min(prev + chunkSize, items.length);
            }
            return prev;
          });
        }
      },
      { rootMargin }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [items.length, chunkSize, rootMargin]);

  const visibleItems = useMemo(() => {
    return items.slice(0, displayLimit);
  }, [items, displayLimit]);

  return {
    visibleItems,
    displayLimit,
    loadMoreRef,
    hasMore: displayLimit < items.length,
  };
}

export default useInfiniteScroll;
