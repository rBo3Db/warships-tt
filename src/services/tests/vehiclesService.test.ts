import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  parseVehicleTypes,
  getCachedVehicleTypesSync,
  parseAndNormalizeVehicles,
  getCachedVehiclesSync,
  loadAndSyncVehicles,
} from '../vehiclesService';
import { STORAGE_KEYS } from '../storageService';

describe('vehiclesService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('vehicle types', () => {
    const mockTypes = {
      Cruiser: { sort_order: 1, name: 'Cruiser', localization: { mark: { en: 'Cruisers' } } },
      Battleship: { sort_order: 2, name: 'Battleship', localization: { mark: { en: 'Battleships' } } },
    };

    it('parses valid vehicle types payload', () => {
      const raw = JSON.stringify({ status: 'ok', data: mockTypes });
      const parsed = parseVehicleTypes(raw);
      expect(parsed.Cruiser.sort_order).toBe(1);
    });

    it('returns empty object on parse failure', () => {
      expect(parseVehicleTypes('invalid')).toEqual({});
    });

    it('retrieves cached vehicle types synchronously', () => {
      expect(getCachedVehicleTypesSync()).toBeNull();
      localStorage.setItem(
        STORAGE_KEYS.VEHICLE_TYPES,
        JSON.stringify({ status: 'ok', data: mockTypes })
      );
      expect(getCachedVehicleTypesSync()).toBeDefined();
      expect(getCachedVehicleTypesSync()?.Cruiser).toBeDefined();
    });
  });

  describe('vehicles normalization and sync', () => {
    const mockVehiclesRaw = {
      v1: {
        level: 10,
        name: 'Yamato',
        nation: 'japan',
        tags: ['upgradeable', 'Battleship'],
        icons: {},
      },
      v2: {
        level: 8,
        name: 'Shimakaze',
        nation: 'japan',
        tags: ['upgradeable', 'Destroyer'],
        icons: {},
      },
    };

    it('normalizes raw object map to vehicle array with correct type and id', () => {
      const payload = JSON.stringify({ status: 'ok', data: mockVehiclesRaw });
      const list = parseAndNormalizeVehicles(payload);

      expect(list).toHaveLength(2);
      expect(list.find((v) => v.id === 'v1')?.type).toBe('Battleship');
      expect(list.find((v) => v.id === 'v2')?.type).toBe('Destroyer');
    });

    it('defaults type to Cruiser if no known tag found', () => {
      const payload = JSON.stringify({
        status: 'ok',
        data: {
          mystery: { level: 5, name: 'Mystery', nation: 'usa', tags: [], icons: {} },
        },
      });
      const list = parseAndNormalizeVehicles(payload);
      expect(list[0].type).toBe('Cruiser');
    });

    it('getCachedVehiclesSync returns null when nothing stored', () => {
      expect(getCachedVehiclesSync()).toBeNull();
    });

    it('loadAndSyncVehicles emits cached data and updates when fresh data arrives', async () => {
      const cached = JSON.stringify({
        status: 'ok',
        data: {
          old: { level: 1, name: 'Old', nation: 'japan', tags: ['Cruiser'], icons: {} },
        },
      });
      localStorage.setItem(STORAGE_KEYS.VEHICLES, cached);

      const fresh = JSON.stringify({ status: 'ok', data: mockVehiclesRaw });
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(fresh),
      }));

      const updates: any[] = [];
      await loadAndSyncVehicles((vehicles) => updates.push(vehicles));

      expect(updates).toHaveLength(2);
      expect(updates[0][0].name).toBe('Old');
      expect(updates[1]).toHaveLength(2);
      expect(localStorage.getItem(STORAGE_KEYS.VEHICLES)).toBe(fresh);
    });
  });
});
