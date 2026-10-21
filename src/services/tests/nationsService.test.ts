import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  parseMediaPath,
  getCachedMediaPathSync,
  loadAndSyncMediaPath,
  parseNations,
  getCachedNationsSync,
  loadAndSyncNations,
} from '../nationsService';
import { STORAGE_KEYS } from '../storageService';

describe('nationsService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('mediaPath', () => {
    it('parses valid media path API response', () => {
      const valid = JSON.stringify({ status: 'ok', data: 'https://vortex.worldofwarships.eu' });
      expect(parseMediaPath(valid)).toBe('https://vortex.worldofwarships.eu');
    });

    it('returns empty string on invalid json or bad status', () => {
      expect(parseMediaPath('invalid json')).toBe('');
      expect(parseMediaPath(JSON.stringify({ status: 'error', data: 'bad' }))).toBe('');
      expect(parseMediaPath(JSON.stringify({ status: 'ok', data: 123 }))).toBe('');
    });

    it('retrieves cached media path synchronously', () => {
      expect(getCachedMediaPathSync()).toBeNull();
      localStorage.setItem(
        STORAGE_KEYS.MEDIA_PATH,
        JSON.stringify({ status: 'ok', data: 'https://cached.media.com' })
      );
      expect(getCachedMediaPathSync()).toBe('https://cached.media.com');
    });

    it('loadAndSyncMediaPath emits cached value and updates on fresh response', async () => {
      const initialCached = JSON.stringify({ status: 'ok', data: 'https://cached.com' });
      localStorage.setItem(STORAGE_KEYS.MEDIA_PATH, initialCached);

      const freshResponse = JSON.stringify({ status: 'ok', data: 'https://fresh.com' });
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(freshResponse),
      }));

      const updates: string[] = [];
      await loadAndSyncMediaPath((p) => updates.push(p));

      expect(updates).toEqual(['https://cached.com', 'https://fresh.com']);
      expect(localStorage.getItem(STORAGE_KEYS.MEDIA_PATH)).toBe(freshResponse);
    });

    it('loadAndSyncMediaPath skips emission if fresh data is identical to cache', async () => {
      const cached = JSON.stringify({ status: 'ok', data: 'https://identical.com' });
      localStorage.setItem(STORAGE_KEYS.MEDIA_PATH, cached);

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(cached),
      }));

      const updates: string[] = [];
      await loadAndSyncMediaPath((p) => updates.push(p));

      // Only emitted once for initial cache, skipped for server response
      expect(updates).toEqual(['https://identical.com']);
    });
  });

  describe('nations', () => {
    const mockNations = [
      { name: 'japan', color: 123, tags: [], localization: { mark: { en: 'Japan' } } },
      { name: 'usa', color: 456, tags: [], localization: { mark: { en: 'USA' } } },
    ];

    it('parses valid nations API response', () => {
      const raw = JSON.stringify({ status: 'ok', data: mockNations });
      expect(parseNations(raw)).toHaveLength(2);
      expect(parseNations(raw)[0].name).toBe('japan');
    });

    it('returns empty array on malformed response', () => {
      expect(parseNations('corrupted')).toEqual([]);
      expect(parseNations(JSON.stringify({ status: 'error' }))).toEqual([]);
    });

    it('getCachedNationsSync returns nations or null', () => {
      expect(getCachedNationsSync()).toBeNull();
      localStorage.setItem(STORAGE_KEYS.NATIONS, JSON.stringify({ status: 'ok', data: mockNations }));
      expect(getCachedNationsSync()).toHaveLength(2);
    });

    it('loadAndSyncNations handles network errors via onError callback', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

      const updates: any[] = [];
      let caughtError: any = null;

      await loadAndSyncNations(
        (n) => updates.push(n),
        false,
        (err) => {
          caughtError = err;
        }
      );

      expect(caughtError).toBeInstanceOf(Error);
      expect(caughtError.message).toContain('Failed to fetch nations');
      expect(errorSpy).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
    });
  });
});
