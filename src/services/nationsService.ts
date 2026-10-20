import type { Nation, NationsApiResponse } from '../types/nation';
import { API_CONFIG } from '../config/api';
import {
  STORAGE_KEYS,
  getCachedItem,
  setCachedItem,
  getCachedItemSync,
} from './storageService';

export { buildFlagUrl } from '../utils/media';

interface MediaPathApiResponse {
  status: string;
  data: string;
}

// ---------------------------------------------------------------------------
// Media Path
// ---------------------------------------------------------------------------

export function parseMediaPath(rawText: string): string {
  try {
    const json: MediaPathApiResponse = JSON.parse(rawText);
    if (json.status === 'ok' && typeof json.data === 'string') {
      return json.data;
    }
  } catch {
    // ignore
  }
  return '';
}

let activeMediaPathPromise: Promise<string | null> | null = null;

export async function fetchMediaPathRaw(): Promise<string | null> {
  if (activeMediaPathPromise) {
    return activeMediaPathPromise;
  }
  activeMediaPathPromise = (async () => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.MEDIA_PATH);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      if (text.includes('"status": "ok"') || text.includes('"status":"ok"')) {
        return text;
      }
      throw new Error('Invalid media path API response');
    } catch (err) {
      console.error('Failed to fetch media_path from API:', err);
      return null;
    } finally {
      activeMediaPathPromise = null;
    }
  })();
  return activeMediaPathPromise;
}

/**
 * Synchronously retrieves cached media path from localStorage (0ms delay for frame 0).
 */
export function getCachedMediaPathSync(): string | null {
  const raw = getCachedItemSync(STORAGE_KEYS.MEDIA_PATH);
  if (!raw) return null;
  const path = parseMediaPath(raw);
  return path || null;
}

/**
 * Loads media path from cache if not yet present, then syncs with backend.
 */
export async function loadAndSyncMediaPath(
  onUpdate: (path: string) => void,
  hasInitialSync = false,
  onError?: (err: Error) => void
): Promise<void> {
  let cachedRaw: string | null = null;
  if (!hasInitialSync) {
    cachedRaw = await getCachedItem(STORAGE_KEYS.MEDIA_PATH);
    if (cachedRaw) {
      const path = parseMediaPath(cachedRaw);
      if (path) onUpdate(path);
    }
  } else {
    cachedRaw = getCachedItemSync(STORAGE_KEYS.MEDIA_PATH);
  }

  try {
    const freshText = await fetchMediaPathRaw();
    if (!freshText) {
      throw new Error('Failed to fetch media_path');
    }

    if (cachedRaw && cachedRaw === freshText) {
      return;
    }

    await setCachedItem(STORAGE_KEYS.MEDIA_PATH, freshText);
    const path = parseMediaPath(freshText);
    if (path) {
      onUpdate(path);
    }
  } catch (err) {
    console.warn('[Sync] Error syncing media path:', err);
    onError?.(err instanceof Error ? err : new Error(String(err)));
  }
}

// ---------------------------------------------------------------------------
// Nations
// ---------------------------------------------------------------------------

export function parseNations(rawText: string): Nation[] {
  try {
    const json: NationsApiResponse = JSON.parse(rawText);
    if (json.status === 'ok' && Array.isArray(json.data)) {
      return json.data;
    }
  } catch {
    // ignore
  }
  return [];
}

let activeNationsPromise: Promise<string | null> | null = null;

export async function fetchNationsRaw(): Promise<string | null> {
  if (activeNationsPromise) {
    return activeNationsPromise;
  }
  activeNationsPromise = (async () => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.NATIONS);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      if (text.includes('"status": "ok"') || text.includes('"status":"ok"')) {
        return text;
      }
      throw new Error('Invalid nations API response');
    } catch (err) {
      console.error('Failed to fetch nations from API:', err);
      return null;
    } finally {
      activeNationsPromise = null;
    }
  })();
  return activeNationsPromise;
}

/**
 * Synchronously retrieves cached nations from localStorage (0ms delay for frame 0).
 */
export function getCachedNationsSync(): Nation[] | null {
  const raw = getCachedItemSync(STORAGE_KEYS.NATIONS);
  if (!raw) return null;
  const nations = parseNations(raw);
  return nations.length > 0 ? nations : null;
}

/**
 * Loads nations from cache if not yet present, then syncs with backend.
 */
export async function loadAndSyncNations(
  onUpdate: (nations: Nation[]) => void,
  hasInitialSync = false,
  onError?: (err: Error) => void
): Promise<void> {
  let cachedRaw: string | null = null;
  if (!hasInitialSync) {
    cachedRaw = await getCachedItem(STORAGE_KEYS.NATIONS);
    if (cachedRaw) {
      const nations = parseNations(cachedRaw);
      if (nations.length > 0) onUpdate(nations);
    }
  } else {
    cachedRaw = getCachedItemSync(STORAGE_KEYS.NATIONS);
  }

  try {
    const freshText = await fetchNationsRaw();
    if (!freshText) {
      throw new Error('Failed to fetch nations');
    }

    if (cachedRaw && cachedRaw === freshText) {
      return;
    }

    await setCachedItem(STORAGE_KEYS.NATIONS, freshText);
    const nations = parseNations(freshText);
    if (nations.length > 0) {
      onUpdate(nations);
    }
  } catch (err) {
    console.warn('[Sync] Error syncing nations:', err);
    onError?.(err instanceof Error ? err : new Error(String(err)));
  }
}
