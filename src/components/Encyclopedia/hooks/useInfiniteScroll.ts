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

  const [prevChunkSize, setPrevChunkSize] = useState(chunkSize);
  const [prevResetDeps, setPrevResetDeps] = useState(resetDeps);

  // Reset display limit immediately during render when dependencies or chunkSize change
  const areDepsEqual =
    resetDeps.length === prevResetDeps.length &&
    resetDeps.every((dep, i) => Object.is(dep, prevResetDeps[i]));

  if (chunkSize !== prevChunkSize || !areDepsEqual) {
    setPrevChunkSize(chunkSize);
    setPrevResetDeps(resetDeps);
    setDisplayLimit(chunkSize);
  }

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
