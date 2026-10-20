import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  doesShipMatch,
  useShipsFilter,
} from './useShipsFilter';
import { ShipStatus, ShipSortOption, type Vehicle } from '../../types/vehicle';

const createShip = (overrides: Partial<Vehicle>): Vehicle => ({
  id: 's_1',
  name: 'Yamato',
  level: 10,
  nation: 'japan',
  type: 'Battleship',
  tags: ['upgradeable'],
  icons: {},
  localization: { mark: {}, shortmark: {} },
  ...overrides,
});

describe('useShipsFilter', () => {
  describe('doesShipMatch', () => {
    const ship = createShip({
      level: 10,
      type: 'Battleship',
      name: 'Yamato',
      localization: {
        mark: { ru: 'Ямато', en: 'Yamato' },
      },
    });

    it('matches empty query', () => {
      expect(doesShipMatch(ship, '', 'ru')).toBe(true);
    });

    it('matches by localized name (ru)', () => {
      expect(doesShipMatch(ship, 'ямат', 'ru')).toBe(true);
    });

    it('matches by english name', () => {
      expect(doesShipMatch(ship, 'yamato', 'ru')).toBe(true);
    });

    it('matches by tier number and roman tier', () => {
      expect(doesShipMatch(ship, '10', 'ru')).toBe(true);
      expect(doesShipMatch(ship, 'X', 'ru')).toBe(true);
    });

    it('matches by ship type', () => {
      expect(doesShipMatch(ship, 'battle', 'ru')).toBe(true);
    });

    it('returns false for unrelated query', () => {
      expect(doesShipMatch(ship, 'bismarck', 'ru')).toBe(false);
    });
  });

  describe('filtering and sorting hook', () => {
    const ships: Vehicle[] = [
      createShip({ id: '1', name: 'Yamato', level: 10, nation: 'japan', type: 'Battleship', tags: ['upgradeable'] }),
      createShip({ id: '2', name: 'Fubuki', level: 6, nation: 'japan', type: 'Destroyer', tags: ['upgradeable'] }),
      createShip({ id: '3', name: 'Atago', level: 8, nation: 'japan', type: 'Cruiser', tags: ['uiPremium'] }),
      createShip({ id: '4', name: 'Iowa', level: 9, nation: 'usa', type: 'Battleship', tags: ['upgradeable'] }),
    ];

    it('filters ships by nation', () => {
      const { result } = renderHook(() =>
        useShipsFilter({
          vehicles: ships,
          selectedNation: 'japan',
          selectedType: null,
          selectedTier: null,
          selectedStatus: ShipStatus.ALL,
          searchQuery: '',
          selectedLang: 'en',
        })
      );

      expect(result.current.currentNationShips).toHaveLength(3);
      expect(result.current.filteredCatalogShips).toHaveLength(3);
    });

    it('filters ships by type and status', () => {
      const { result } = renderHook(() =>
        useShipsFilter({
          vehicles: ships,
          selectedNation: 'japan',
          selectedType: 'Cruiser',
          selectedTier: null,
          selectedStatus: ShipStatus.PREMIUM,
          searchQuery: '',
          selectedLang: 'en',
        })
      );

      expect(result.current.filteredCatalogShips).toHaveLength(1);
      expect(result.current.filteredCatalogShips[0].id).toBe('3');
    });

    it('finds matches in other nations when searching', () => {
      const { result } = renderHook(() =>
        useShipsFilter({
          vehicles: ships,
          selectedNation: 'japan',
          selectedType: null,
          selectedTier: null,
          selectedStatus: ShipStatus.ALL,
          searchQuery: 'Iowa',
          selectedLang: 'en',
        })
      );

      expect(result.current.filteredCatalogShips).toHaveLength(0);
      expect(result.current.otherNationMatches).toHaveLength(1);
      expect(result.current.otherNationMatches[0].id).toBe('4');
    });

    it('sorts ships correctly (tier asc & desc)', () => {
      const { result: asc } = renderHook(() =>
        useShipsFilter({
          vehicles: ships,
          selectedNation: 'japan',
          selectedType: null,
          selectedTier: null,
          selectedStatus: ShipStatus.ALL,
          selectedSort: ShipSortOption.TIER_ASC,
          searchQuery: '',
          selectedLang: 'en',
        })
      );

      expect(asc.current.filteredCatalogShips.map((s) => s.level)).toEqual([6, 8, 10]);

      const { result: desc } = renderHook(() =>
        useShipsFilter({
          vehicles: ships,
          selectedNation: 'japan',
          selectedType: null,
          selectedTier: null,
          selectedStatus: ShipStatus.ALL,
          selectedSort: ShipSortOption.TIER_DESC,
          searchQuery: '',
          selectedLang: 'en',
        })
      );

      expect(desc.current.filteredCatalogShips.map((s) => s.level)).toEqual([10, 8, 6]);
    });
  });
});
