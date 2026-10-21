import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

describe('useInfiniteScroll', () => {
  const items = Array.from({ length: 100 }, (_, i) => `item_${i + 1}`);

  let observerCallback: ((entries: IntersectionObserverEntry[]) => void) | null = null;
  let disconnectMock = vi.fn();
  let observeMock = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    observerCallback = null;
    disconnectMock = vi.fn();
    observeMock = vi.fn();

    class MockObserver {
      readonly root: Element | Document | null = null;
      readonly rootMargin: string = '';
      readonly thresholds: ReadonlyArray<number> = [];
      takeRecords = () => [];

      constructor(cb: (entries: IntersectionObserverEntry[]) => void) {
        observerCallback = cb;
      }
      observe = (target: Element) => {
        observeMock(target);
      };
      unobserve = () => {};
      disconnect = () => {
        disconnectMock();
      };
    }

    vi.stubGlobal('IntersectionObserver', MockObserver as unknown as typeof IntersectionObserver);
  });

  it('initializes with visibleItems up to chunkSize', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({ items, chunkSize: 20 })
    );

    expect(result.current.visibleItems.length).toBe(20);
    expect(result.current.hasMore).toBe(true);
  });

  it('attaches IntersectionObserver and disconnects on unmount', () => {
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

  it('resets display limit back to chunkSize when resetDeps change after scrolling', () => {
    let filter = 'all';
    const { result, rerender } = renderHook(() =>
      useInfiniteScroll({ items, chunkSize: 20, resetDeps: [filter] })
    );

    const dummyNode = document.createElement('div');
    act(() => {
      result.current.loadMoreRef(dummyNode);
    });

    // Expand items to 40
    act(() => {
      if (observerCallback) {
        observerCallback([{ isIntersecting: true } as unknown as IntersectionObserverEntry]);
      }
    });

    expect(result.current.visibleItems.length).toBe(40);

    // Change filter dependency
    filter = 'battleships';
    rerender();

    expect(result.current.visibleItems.length).toBe(20);
  });

  it('resets display limit when chunkSize changes', () => {
    let chunkSize = 20;
    const { result, rerender } = renderHook(() =>
      useInfiniteScroll({ items, chunkSize, resetDeps: ['static'] })
    );

    const dummyNode = document.createElement('div');
    act(() => {
      result.current.loadMoreRef(dummyNode);
    });

    // Expand to 40
    act(() => {
      if (observerCallback) {
        observerCallback([{ isIntersecting: true } as unknown as IntersectionObserverEntry]);
      }
    });
    expect(result.current.visibleItems.length).toBe(40);

    // Change chunkSize
    chunkSize = 10;
    rerender();

    expect(result.current.visibleItems.length).toBe(10);
  });

  it('does NOT reset display limit on re-renders when resetDeps values remain equal', () => {
    const { result, rerender } = renderHook(() =>
      // New array instance passed on every render, but contents are identical
      useInfiniteScroll({ items, chunkSize: 20, resetDeps: ['same_value', 123] })
    );

    const dummyNode = document.createElement('div');
    act(() => {
      result.current.loadMoreRef(dummyNode);
    });

    // Expand to 40
    act(() => {
      if (observerCallback) {
        observerCallback([{ isIntersecting: true } as unknown as IntersectionObserverEntry]);
      }
    });
    expect(result.current.visibleItems.length).toBe(40);

    // Rerender with equal values
    rerender();

    expect(result.current.visibleItems.length).toBe(40);
  });

  it('caps display limit at total items and updates hasMore accordingly', () => {
    const smallList = ['a', 'b', 'c'];
    const { result } = renderHook(() =>
      useInfiniteScroll({ items: smallList, chunkSize: 2 })
    );

    expect(result.current.visibleItems.length).toBe(2);
    expect(result.current.hasMore).toBe(true);

    const dummyNode = document.createElement('div');
    act(() => {
      result.current.loadMoreRef(dummyNode);
    });

    act(() => {
      if (observerCallback) {
        observerCallback([{ isIntersecting: true } as unknown as IntersectionObserverEntry]);
      }
    });

    expect(result.current.visibleItems.length).toBe(3);
    expect(result.current.hasMore).toBe(false);
  });
});
