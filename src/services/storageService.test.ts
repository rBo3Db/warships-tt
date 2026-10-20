import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  STORAGE_KEYS,
  getCachedItemSync,
  getCachedItem,
  setCachedItem,
  getCachedVehiclesString,
  setCachedVehiclesString,
} from './storageService';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('synchronously reads items from localStorage', () => {
    localStorage.setItem(STORAGE_KEYS.NATIONS, '["japan"]');
    expect(getCachedItemSync(STORAGE_KEYS.NATIONS)).toBe('["japan"]');
    expect(getCachedItemSync('non_existent')).toBeNull();
  });

  it('asynchronously sets and gets item via localStorage', async () => {
    await setCachedItem(STORAGE_KEYS.MEDIA_PATH, 'https://media.test.com');
    const result = await getCachedItem(STORAGE_KEYS.MEDIA_PATH);
    expect(result).toBe('https://media.test.com');
  });

  it('supports vehicle cache aliases', async () => {
    await setCachedVehiclesString('{"v1":{}}');
    const result = await getCachedVehiclesString();
    expect(result).toBe('{"v1":{}}');
  });

  it('gracefully handles localStorage.getItem throwing an error', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Access denied');
    });

    expect(getCachedItemSync(STORAGE_KEYS.NATIONS)).toBeNull();
  });
});
