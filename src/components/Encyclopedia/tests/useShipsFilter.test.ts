import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  doesShipMatch,
  useShipsFilter,
} from '../hooks/useShipsFilter';
import type { Vehicle } from '../../../types/vehicle';

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

  describe('nation partitioning and search matching', () => {
    const ships: Vehicle[] = [
      createShip({ id: '1', name: 'Yamato', level: 10, nation: 'japan', type: 'Battleship' }),
      createShip({ id: '2', name: 'Fubuki', level: 6, nation: 'japan', type: 'Destroyer' }),
      createShip({ id: '3', name: 'Atago', level: 8, nation: 'japan', type: 'Cruiser' }),
      createShip({ id: '4', name: 'Iowa', level: 9, nation: 'usa', type: 'Battleship' }),
    ];

    it('filters ships by nation', () => {
      const { result } = renderHook(() =>
        useShipsFilter({
          vehicles: ships,
          selectedNation: 'japan',
          searchQuery: '',
          selectedLang: 'en',
        })
      );

      expect(result.current.currentNationShips).toHaveLength(3);
      expect(result.current.currentNationShips.map((s) => s.id)).toEqual(['1', '2', '3']);
    });

    it('returns all ships if no nation is selected', () => {
      const { result } = renderHook(() =>
        useShipsFilter({
          vehicles: ships,
          selectedNation: null,
          searchQuery: '',
          selectedLang: 'en',
        })
      );

      expect(result.current.currentNationShips).toHaveLength(4);
    });

    it('finds matching ship IDs in current nation', () => {
      const { result } = renderHook(() =>
        useShipsFilter({
          vehicles: ships,
          selectedNation: 'japan',
          searchQuery: 'Yamato',
          selectedLang: 'en',
        })
      );

      expect(result.current.matchingShipIds.has('1')).toBe(true);
      expect(result.current.matchingShipIds.size).toBe(1);
    });

    it('finds matches in other nations when searching', () => {
      const { result } = renderHook(() =>
        useShipsFilter({
          vehicles: ships,
          selectedNation: 'japan',
          searchQuery: 'Iowa',
          selectedLang: 'en',
        })
      );

      expect(result.current.matchingShipIds.size).toBe(0);
      expect(result.current.otherNationMatches).toHaveLength(1);
      expect(result.current.otherNationMatches[0].id).toBe('4');
    });
  });
});
