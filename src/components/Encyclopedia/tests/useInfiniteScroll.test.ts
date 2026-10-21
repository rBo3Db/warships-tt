import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

describe('useInfiniteScroll', () => {
  const items = Array.from({ length: 100 }, (_, i) => `item_${i + 1}`);

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with visibleItems up to chunkSize', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({ items, chunkSize: 20 })
    );

    expect(result.current.visibleItems.length).toBe(20);
    expect(result.current.hasMore).toBe(true);
  });

  it('resets display limit when resetDeps change', () => {
    let filter = 'all';
    const { result, rerender } = renderHook(() =>
      useInfiniteScroll({ items, chunkSize: 20, resetDeps: [filter] })
    );

    expect(result.current.visibleItems.length).toBe(20);

    // change filter dependency
    filter = 'battleships';
    rerender();

    expect(result.current.visibleItems.length).toBe(20);
  });

  it('attaches IntersectionObserver and disconnects on unmount', () => {
    let observerCallback: ((entries: IntersectionObserverEntry[]) => void) | null = null;
    const disconnectMock = vi.fn();
    const observeMock = vi.fn();

    class MockObserver implements IntersectionObserver {
      readonly root: Element | Document | null = null;
      readonly rootMargin: string = '';
      readonly thresholds: ReadonlyArray<number> = [];
      takeRecords = vi.fn().mockReturnValue([]);

      constructor(cb: (entries: IntersectionObserverEntry[]) => void) {
        observerCallback = cb;
      }
      observe = observeMock;
      unobserve = vi.fn();
      disconnect = disconnectMock;
    }

    vi.stubGlobal('IntersectionObserver', MockObserver);

    const { result, unmount } = renderHook(() =>
      useInfiniteScroll({ items, chunkSize: 20 })
    );

    const dummyNode = document.createElement('div');
    act(() => {
      result.current.loadMoreRef(dummyNode);
    });

    expect(observeMock).toHaveBeenCalledWith(dummyNode);

    // Trigger intersection
    act(() => {
      if (observerCallback) {
        observerCallback([{ isIntersecting: true } as unknown as IntersectionObserverEntry]);
      }
    });

    expect(result.current.visibleItems.length).toBe(40);

    unmount();
    expect(disconnectMock).toHaveBeenCalled();
  });
});
