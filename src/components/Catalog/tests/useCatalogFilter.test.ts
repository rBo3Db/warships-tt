import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCatalogFilter } from '../hooks/useCatalogFilter';
import { ShipStatus, ShipSortOption, type Vehicle } from '../../../types/vehicle';

const createShip = (overrides: Partial<Vehicle>): Vehicle => ({
  id: 's_1',
  name: 'Yamato',
  level: 10,
  nation: 'japan',
  type: 'Battleship',
  tags: ['upgradeable'],
  icons: {},
  localization: { mark: { en: overrides.name || 'Yamato' }, shortmark: {} },
  ...overrides,
});

describe('useCatalogFilter hook', () => {
  const ships: Vehicle[] = [
    createShip({ id: '1', name: 'Yamato', level: 10, type: 'Battleship', tags: ['upgradeable'] }),
    createShip({ id: '2', name: 'Fubuki', level: 6, type: 'Destroyer', tags: ['upgradeable'] }),
    createShip({ id: '3', name: 'Atago', level: 8, type: 'Cruiser', tags: ['uiPremium'] }),
    createShip({ id: '4', name: 'Iowa', level: 9, type: 'Battleship', tags: ['upgradeable'] }),
  ];

  it('initializes with all ships visible up to chunkSize', () => {
    const { result } = renderHook(() =>
      useCatalogFilter({ ships, selectedLang: 'en', chunkSize: 2 })
    );

    expect(result.current.totalFilteredCount).toBe(4);
    expect(result.current.visibleShips).toHaveLength(2);
  });

  it('filters by ship type when selectedType is set', () => {
    const { result } = renderHook(() =>
      useCatalogFilter({ ships, selectedLang: 'en' })
    );

    act(() => {
      result.current.setSelectedType('Cruiser');
    });

    expect(result.current.totalFilteredCount).toBe(1);
    expect(result.current.visibleShips[0].id).toBe('3');
  });

  it('filters by status when selectedStatus is set', () => {
    const { result } = renderHook(() =>
      useCatalogFilter({ ships, selectedLang: 'en' })
    );

    act(() => {
      result.current.setSelectedStatus(ShipStatus.PREMIUM);
    });

    expect(result.current.totalFilteredCount).toBe(1);
    expect(result.current.visibleShips[0].name).toBe('Atago');
  });

  it('filters by tier when selectedTier is set', () => {
    const { result } = renderHook(() =>
      useCatalogFilter({ ships, selectedLang: 'en' })
    );

    act(() => {
      result.current.setSelectedTier(10);
    });

    expect(result.current.totalFilteredCount).toBe(1);
    expect(result.current.visibleShips[0].name).toBe('Yamato');
  });

  it('sorts ships correctly by tier ascending and descending', () => {
    const { result } = renderHook(() =>
      useCatalogFilter({ ships, selectedLang: 'en' })
    );

    // Default tier asc
    expect(result.current.visibleShips.map((s) => s.level)).toEqual([6, 8, 9, 10]);

    // Tier desc
    act(() => {
      result.current.setSelectedSort(ShipSortOption.TIER_DESC);
    });
    expect(result.current.visibleShips.map((s) => s.level)).toEqual([10, 9, 8, 6]);
  });
});
