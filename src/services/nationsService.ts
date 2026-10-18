import type { Nation, NationsApiResponse } from '../types/nation';
import type { Vehicle, VehicleTypesMap } from '../types/vehicle';
import { API_CONFIG } from '../config/api';
import {
  STORAGE_KEYS,
  getCachedItem,
  setCachedItem,
  getCachedItemSync,
} from './storageService';
import {
  fetchVehicleTypes,
  fetchVehicles,
  syncVehicleTypes,
  syncVehicles,
  parseVehicleTypes,
  parseAndNormalizeVehicles,
  getCachedVehicleTypesSync,
  loadAndSyncVehicleTypes,
  getCachedVehiclesSync,
  loadAndSyncVehicles,
} from './vehiclesService';

export {
  getCachedVehicleTypesSync,
  loadAndSyncVehicleTypes,
  getCachedVehiclesSync,
  loadAndSyncVehicles,
};

interface MediaPathApiResponse {
  status: string;
  data: string;
}

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

export async function fetchMediaPathRaw(): Promise<string | null> {
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
  }
}

let initialMediaPathFetchedFromNetwork = false;

export async function getInitialMediaPath(): Promise<string> {
  const cachedRaw = await getCachedItem(STORAGE_KEYS.MEDIA_PATH);
  if (cachedRaw) {
    const path = parseMediaPath(cachedRaw);
    if (path) return path;
  }

  const freshText = await fetchMediaPathRaw();
  if (freshText) {
    const path = parseMediaPath(freshText);
    if (path) {
      await setCachedItem(STORAGE_KEYS.MEDIA_PATH, freshText);
      initialMediaPathFetchedFromNetwork = true;
      return path;
    }
  }
  return '';
}

export async function fetchMediaPath(): Promise<string> {
  return getInitialMediaPath();
}

export async function syncMediaPath(onChanged: (path: string) => void): Promise<void> {
  if (initialMediaPathFetchedFromNetwork) {
    initialMediaPathFetchedFromNetwork = false;
    return;
  }

  const freshText = await fetchMediaPathRaw();
  if (!freshText) return;

  const cachedText = await getCachedItem(STORAGE_KEYS.MEDIA_PATH);
  if (cachedText && cachedText === freshText) {
    console.log('[Sync] Media path identical to server. Skipping re-render.');
    return;
  }

  console.log('[Sync] New media path received! Updating cache and re-rendering.');
  await setCachedItem(STORAGE_KEYS.MEDIA_PATH, freshText);
  const path = parseMediaPath(freshText);
  if (path) {
    onChanged(path);
  }
}

/**
 * Synchronously retrieves cached media path from localStorage (0ms delay)
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
  hasInitialSync = false
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

  const freshText = await fetchMediaPathRaw();
  if (!freshText) return;

  if (cachedRaw && cachedRaw === freshText) {
    console.log('[Sync] Media path identical to server. Skipping re-render.');
    return;
  }

  console.log('[Sync] New media path received! Updating cache and re-rendering.');
  await setCachedItem(STORAGE_KEYS.MEDIA_PATH, freshText);
  const path = parseMediaPath(freshText);
  if (path) {
    onUpdate(path);
  }
}

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

export async function fetchNationsRaw(): Promise<string | null> {
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
  }
}

let initialNationsFetchedFromNetwork = false;

export async function getInitialNations(): Promise<Nation[]> {
  const cachedRaw = await getCachedItem(STORAGE_KEYS.NATIONS);
  if (cachedRaw) {
    const nations = parseNations(cachedRaw);
    if (nations.length > 0) return nations;
  }

  const freshText = await fetchNationsRaw();
  if (freshText) {
    const nations = parseNations(freshText);
    if (nations.length > 0) {
      await setCachedItem(STORAGE_KEYS.NATIONS, freshText);
      initialNationsFetchedFromNetwork = true;
      return nations;
    }
  }
  return [];
}

export async function fetchNations(): Promise<{ data: Nation[] }> {
  const data = await getInitialNations();
  return { data };
}

export async function syncNations(onChanged: (nations: Nation[]) => void): Promise<void> {
  if (initialNationsFetchedFromNetwork) {
    initialNationsFetchedFromNetwork = false;
    return;
  }

  const freshText = await fetchNationsRaw();
  if (!freshText) return;

  const cachedText = await getCachedItem(STORAGE_KEYS.NATIONS);
  if (cachedText && cachedText === freshText) {
    console.log('[Sync] Nations identical to server. Skipping re-render.');
    return;
  }

  console.log('[Sync] New nations received! Updating cache and re-rendering.');
  await setCachedItem(STORAGE_KEYS.NATIONS, freshText);
  const nations = parseNations(freshText);
  if (nations.length > 0) {
    onChanged(nations);
  }
}

/**
 * Synchronously retrieves cached nations from localStorage (0ms delay)
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
  hasInitialSync = false
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

  const freshText = await fetchNationsRaw();
  if (!freshText) return;

  if (cachedRaw && cachedRaw === freshText) {
    console.log('[Sync] Nations identical to server. Skipping re-render.');
    return;
  }

  console.log('[Sync] New nations received! Updating cache and re-rendering.');
  await setCachedItem(STORAGE_KEYS.NATIONS, freshText);
  const nations = parseNations(freshText);
  if (nations.length > 0) {
    onUpdate(nations);
  }
}

export interface AppData {
  nations: Nation[];
  mediaPath: string;
  vehicleTypes: VehicleTypesMap;
  vehicles: Vehicle[];
}

export async function fetchAppData(): Promise<AppData> {
  const [nationsRes, mediaPath, vehicleTypes, vehicles] = await Promise.all([
    fetchNations(),
    getInitialMediaPath(),
    fetchVehicleTypes(),
    fetchVehicles(),
  ]);

  return {
    nations: nationsRes.data,
    mediaPath,
    vehicleTypes,
    vehicles,
  };
}

/**
 * Synchronously retrieves all 4 resources from localStorage.
 * If all 4 are present in localStorage, returns AppData immediately (0ms, frame 0, no network, no promise delay).
 */
export function getCachedAppDataSync(): AppData | null {
  try {
    const nationsRaw = getCachedItemSync(STORAGE_KEYS.NATIONS);
    const mediaPathRaw = getCachedItemSync(STORAGE_KEYS.MEDIA_PATH);
    const typesRaw = getCachedItemSync(STORAGE_KEYS.VEHICLE_TYPES);
    const vehiclesRaw = getCachedItemSync(STORAGE_KEYS.VEHICLES);

    if (!nationsRaw || !mediaPathRaw || !typesRaw || !vehiclesRaw) {
      return null;
    }

    const nations = parseNations(nationsRaw);
    const mediaPath = parseMediaPath(mediaPathRaw);
    const vehicleTypes = parseVehicleTypes(typesRaw);
    const vehicles = parseAndNormalizeVehicles(vehiclesRaw);

    if (
      nations.length === 0 ||
      !mediaPath ||
      Object.keys(vehicleTypes).length === 0 ||
      vehicles.length === 0
    ) {
      return null;
    }

    return {
      nations,
      mediaPath,
      vehicleTypes,
      vehicles,
    };
  } catch {
    return null;
  }
}

/**
 * Synchronizes all encyclopedia resources in parallel.
 * For each resource:
 * - Checks against local cache.
 * - If unchanged -> does nothing (no re-renders).
 * - If changed -> updates cache and emits update for that resource.
 */
export async function syncAppData(onUpdate: (partial: Partial<AppData>) => void): Promise<void> {
  await Promise.all([
    syncNations((nations) => onUpdate({ nations })),
    syncMediaPath((mediaPath) => onUpdate({ mediaPath })),
    syncVehicleTypes((vehicleTypes) => onUpdate({ vehicleTypes })),
    syncVehicles((vehicles) => onUpdate({ vehicles })),
  ]);
}


export function buildFlagUrl(mediaPath: string, iconPath: string): string {
  if (!iconPath) return '';
  if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) return iconPath;
  const base = mediaPath.endsWith('/') ? mediaPath : `${mediaPath}/`;
  return `${base}${iconPath}`;
}
