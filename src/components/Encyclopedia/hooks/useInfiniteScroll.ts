import { useState, useRef, useEffect, useCallback, useMemo, type RefCallback } from 'react';

export interface UseInfiniteScrollOptions<T> {
  items: T[];
  chunkSize?: number;
  resetDeps?: unknown[];
  rootMargin?: string;
}

export interface UseInfiniteScrollResult<T> {
  visibleItems: T[];
  displayLimit: number;
  loadMoreRef: RefCallback<HTMLDivElement>;
  hasMore: boolean;
}

/**
 * Manages incremental chunk loading for long lists using IntersectionObserver with a callback ref.
 */
export function useInfiniteScroll<T>({
  items,
  chunkSize = 36,
  resetDeps = [],
  rootMargin = '400px',
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollResult<T> {
  const [displayLimit, setDisplayLimit] = useState(chunkSize);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const itemsLengthRef = useRef(items.length);
  itemsLengthRef.current = items.length;

  // Reset display limit when dependencies change (e.g. filters, search query, or viewMode)
  useEffect(() => {
    setDisplayLimit(chunkSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chunkSize, ...resetDeps]);

  // Robust callback ref: attaches observer whenever the sentinel DOM element mounts/remounts
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setDisplayLimit((prev) => {
              if (prev < itemsLengthRef.current) {
                return Math.min(prev + chunkSize, itemsLengthRef.current);
              }
              return prev;
            });
          }
        },
        { rootMargin }
      );

      observer.observe(node);
      observerRef.current = observer;
    },
    [chunkSize, rootMargin]
  );

  // Clean up observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

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
