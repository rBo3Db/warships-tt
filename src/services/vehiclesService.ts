import type {
  Vehicle,
  VehicleRaw,
  VehiclesApiResponse,
  VehicleTypesApiResponse,
  VehicleTypesMap,
} from '../types/vehicle';
import { API_CONFIG } from '../config/api';
import {
  STORAGE_KEYS,
  getCachedItem,
  getCachedItemSync,
  setCachedItem,
  getCachedVehiclesString,
  setCachedVehiclesString,
} from './storageService';

export function parseVehicleTypes(rawText: string): VehicleTypesMap {
  try {
    const json: VehicleTypesApiResponse = JSON.parse(rawText);
    if (json.status === 'ok' && json.data) {
      return json.data;
    }
  } catch {
    // ignore
  }
  return {};
}

export async function fetchVehicleTypesRaw(): Promise<string | null> {
  try {
    const response = await fetch(API_CONFIG.ENDPOINTS.VEHICLE_TYPES);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    if (text.includes('"status": "ok"') || text.includes('"status":"ok"')) {
      return text;
    }
    throw new Error('Invalid vehicle_types response');
  } catch (err) {
    console.warn('Failed to fetch vehicle_types from primary endpoint, trying direct origin:', err);
    try {
      const directUrl = `${API_CONFIG.ORIGIN_URL}/api/encyclopedia/en/vehicle_types_common/`;
      const directResp = await fetch(directUrl);
      if (directResp.ok) {
        const text = await directResp.text();
        if (text.includes('"status": "ok"') || text.includes('"status":"ok"')) {
          return text;
        }
      }
    } catch {
      // ignore
    }
    console.error('Failed to fetch vehicle types from API:', err);
    return null;
  }
}

let initialTypesFetchedFromNetwork = false;

export async function getInitialVehicleTypes(): Promise<VehicleTypesMap> {
  const cachedRaw = await getCachedItem(STORAGE_KEYS.VEHICLE_TYPES);
  if (cachedRaw) {
    const types = parseVehicleTypes(cachedRaw);
    if (Object.keys(types).length > 0) return types;
  }

  const freshText = await fetchVehicleTypesRaw();
  if (freshText) {
    const types = parseVehicleTypes(freshText);
    if (Object.keys(types).length > 0) {
      await setCachedItem(STORAGE_KEYS.VEHICLE_TYPES, freshText);
      initialTypesFetchedFromNetwork = true;
      return types;
    }
  }
  return {};
}

export async function fetchVehicleTypes(): Promise<VehicleTypesMap> {
  return getInitialVehicleTypes();
}

export async function syncVehicleTypes(onChanged: (types: VehicleTypesMap) => void): Promise<void> {
  if (initialTypesFetchedFromNetwork) {
    initialTypesFetchedFromNetwork = false;
    return;
  }

  const freshText = await fetchVehicleTypesRaw();
  if (!freshText) return;

  const cachedText = await getCachedItem(STORAGE_KEYS.VEHICLE_TYPES);
  if (cachedText && cachedText === freshText) {
    console.log('[Sync] Vehicle types identical to server. Skipping re-render.');
    return;
  }

  console.log('[Sync] New vehicle types received! Updating cache and re-rendering.');
  await setCachedItem(STORAGE_KEYS.VEHICLE_TYPES, freshText);
  const types = parseVehicleTypes(freshText);
  if (Object.keys(types).length > 0) {
    onChanged(types);
  }
}

/**
 * Synchronously retrieves cached vehicle types from localStorage (0ms delay)
 */
export function getCachedVehicleTypesSync(): VehicleTypesMap | null {
  const raw = getCachedItemSync(STORAGE_KEYS.VEHICLE_TYPES);
  if (!raw) return null;
  const types = parseVehicleTypes(raw);
  return Object.keys(types).length > 0 ? types : null;
}

/**
 * Loads vehicle types from cache if not yet present, then syncs with backend.
 */
export async function loadAndSyncVehicleTypes(
  onUpdate: (types: VehicleTypesMap) => void,
  hasInitialSync = false
): Promise<void> {
  let cachedRaw: string | null = null;
  if (!hasInitialSync) {
    cachedRaw = await getCachedItem(STORAGE_KEYS.VEHICLE_TYPES);
    if (cachedRaw) {
      const types = parseVehicleTypes(cachedRaw);
      if (Object.keys(types).length > 0) onUpdate(types);
    }
  } else {
    cachedRaw = getCachedItemSync(STORAGE_KEYS.VEHICLE_TYPES);
  }

  const freshText = await fetchVehicleTypesRaw();
  if (!freshText) return;

  if (cachedRaw && cachedRaw === freshText) {
    console.log('[Sync] Vehicle types identical to server. Skipping re-render.');
    return;
  }

  console.log('[Sync] New vehicle types received! Updating cache and re-rendering.');
  await setCachedItem(STORAGE_KEYS.VEHICLE_TYPES, freshText);
  const types = parseVehicleTypes(freshText);
  if (Object.keys(types).length > 0) {
    onUpdate(types);
  }
}


const KNOWN_SHIP_TYPES = ['Cruiser', 'Battleship', 'Destroyer', 'Submarine', 'AirCarrier'];

function resolveShipType(tags: string[] = []): string {
  const found = tags.find((tag) => KNOWN_SHIP_TYPES.includes(tag));
  return found || 'Cruiser';
}

function normalizeVehiclesMap(data: Record<string, VehicleRaw>): Vehicle[] {
  return Object.entries(data).map(([id, raw]) => ({
    ...raw,
    id,
    type: resolveShipType(raw.tags),
  }));
}

let initialFetchedFromNetwork = false;

export function parseAndNormalizeVehicles(jsonText: string): Vehicle[] {
  try {
    const json: VehiclesApiResponse = JSON.parse(jsonText);
    if (json.status === 'ok' && json.data) {
      return normalizeVehiclesMap(json.data);
    }
  } catch (err) {
    console.warn('[Cache] Failed to parse vehicles JSON:', err);
  }
  return [];
}

/**
 * Retrieves cached vehicles from localStorage/IndexedDB if available.
 */
export async function getCachedVehicles(): Promise<Vehicle[] | null> {
  const cachedRaw = await getCachedVehiclesString();
  if (!cachedRaw) return null;
  const vehicles = parseAndNormalizeVehicles(cachedRaw);
  return vehicles.length > 0 ? vehicles : null;
}

/**
 * Fetches raw vehicles dump from backend API as text string.
 */
export async function fetchVehiclesRaw(): Promise<string | null> {
  try {
    const response = await fetch(API_CONFIG.ENDPOINTS.VEHICLES);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    if (text.includes('"status": "ok"') || text.includes('"status":"ok"')) {
      return text;
    }
    throw new Error('Invalid vehicles API response content');
  } catch (err) {
    console.warn('Primary vehicles endpoint failed, trying direct origin:', err);
    try {
      const directUrl = `${API_CONFIG.ORIGIN_URL}/api/encyclopedia/en/vehicles/`;
      const directResp = await fetch(directUrl);
      if (directResp.ok) {
        const text = await directResp.text();
        if (text.includes('"status": "ok"') || text.includes('"status":"ok"')) {
          return text;
        }
      }
    } catch {
      // ignore
    }
    console.error('Failed to fetch vehicles from network:', err);
    return null;
  }
}

/**
 * Returns cached vehicles immediately if available.
 * If not in cache, fetches from network and populates cache.
 */
export async function getInitialVehicles(): Promise<Vehicle[]> {
  const cached = await getCachedVehicles();
  if (cached && cached.length > 0) {
    return cached;
  }

  // Not in cache: perform initial network fetch
  const freshText = await fetchVehiclesRaw();
  if (freshText) {
    const vehicles = parseAndNormalizeVehicles(freshText);
    if (vehicles.length > 0) {
      await setCachedVehiclesString(freshText);
      initialFetchedFromNetwork = true;
      return vehicles;
    }
  }

  return [];
}

/**
 * Alias for getInitialVehicles for backward compatibility
 */
export async function fetchVehicles(): Promise<Vehicle[]> {
  return getInitialVehicles();
}

/**
 * Background synchronization:
 * 1. Fetches fresh vehicles file from backend.
 * 2. Compares with locally stored version.
 * 3. If identical -> does nothing (no re-render).
 * 4. If changed -> updates storage and invokes onChanged callback with new vehicles.
 */
export async function syncVehicles(onChanged: (newVehicles: Vehicle[]) => void): Promise<void> {
  // If we already fetched fresh data in this session during initial load, skip duplicate request
  if (initialFetchedFromNetwork) {
    initialFetchedFromNetwork = false;
    return;
  }

  const freshText = await fetchVehiclesRaw();
  if (!freshText) {
    console.warn('[Sync] Could not reach backend for vehicles update');
    return;
  }

  const cachedText = await getCachedVehiclesString();

  // Fast comparison: raw strings comparison
  if (cachedText && cachedText === freshText) {
    console.log('[Sync] Vehicles file is identical to server. Skipping re-render.');
    return;
  }

  console.log('[Sync] New vehicles file received from server! Updating cache and re-rendering.');
  await setCachedVehiclesString(freshText);
  const updatedVehicles = parseAndNormalizeVehicles(freshText);
  if (updatedVehicles.length > 0) {
    onChanged(updatedVehicles);
  }
}

/**
 * Synchronously retrieves cached vehicles from localStorage (0ms delay)
 */
export function getCachedVehiclesSync(): Vehicle[] | null {
  const raw = getCachedItemSync(STORAGE_KEYS.VEHICLES);
  if (!raw) return null;
  const vehicles = parseAndNormalizeVehicles(raw);
  return vehicles.length > 0 ? vehicles : null;
}

/**
 * Loads vehicles from cache/IndexedDB if not yet present, then syncs with backend.
 */
export async function loadAndSyncVehicles(
  onUpdate: (vehicles: Vehicle[]) => void,
  hasInitialSync = false
): Promise<void> {
  let cachedRaw: string | null = null;
  if (!hasInitialSync) {
    cachedRaw = await getCachedVehiclesString();
    if (cachedRaw) {
      const vehicles = parseAndNormalizeVehicles(cachedRaw);
      if (vehicles.length > 0) {
        onUpdate(vehicles);
      }
    }
  } else {
    cachedRaw = getCachedItemSync(STORAGE_KEYS.VEHICLES);
  }

  const freshText = await fetchVehiclesRaw();
  if (!freshText) {
    console.warn('[Sync] Could not reach backend for vehicles update');
    return;
  }

  if (cachedRaw && cachedRaw === freshText) {
    console.log('[Sync] Vehicles file is identical to server. Skipping re-render.');
    return;
  }

  console.log('[Sync] New vehicles file received from server! Updating cache and re-rendering.');
  await setCachedVehiclesString(freshText);
  const vehicles = parseAndNormalizeVehicles(freshText);
  if (vehicles.length > 0) {
    onUpdate(vehicles);
  }
}

export function buildMediaUrl(mediaPath: string, path?: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = mediaPath.endsWith('/') ? mediaPath : `${mediaPath}/`;
  return `${base}${path}`;
}
