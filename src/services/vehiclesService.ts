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

export { buildMediaUrl } from '../utils/media';

// ---------------------------------------------------------------------------
// Vehicle Types
// ---------------------------------------------------------------------------

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

let activeVehicleTypesPromise: Promise<string | null> | null = null;

export async function fetchVehicleTypesRaw(): Promise<string | null> {
  if (activeVehicleTypesPromise) {
    return activeVehicleTypesPromise;
  }
  activeVehicleTypesPromise = (async () => {
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
    } finally {
      activeVehicleTypesPromise = null;
    }
  })();
  return activeVehicleTypesPromise;
}

/**
 * Synchronously retrieves cached vehicle types from localStorage (0ms delay for frame 0).
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
  hasInitialSync = false,
  onError?: (err: Error) => void
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

  try {
    const freshText = await fetchVehicleTypesRaw();
    if (!freshText) {
      throw new Error('Failed to fetch vehicle_types');
    }

    if (cachedRaw && cachedRaw === freshText) {
      return;
    }

    await setCachedItem(STORAGE_KEYS.VEHICLE_TYPES, freshText);
    const types = parseVehicleTypes(freshText);
    if (Object.keys(types).length > 0) {
      onUpdate(types);
    }
  } catch (err) {
    console.warn('[Sync] Error syncing vehicle types:', err);
    onError?.(err instanceof Error ? err : new Error(String(err)));
  }
}

// ---------------------------------------------------------------------------
// Vehicles
// ---------------------------------------------------------------------------

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
let activeVehiclesPromise: Promise<string | null> | null = null;

export async function fetchVehiclesRaw(): Promise<string | null> {
  if (activeVehiclesPromise) {
    return activeVehiclesPromise;
  }
  activeVehiclesPromise = (async () => {
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
    } finally {
      activeVehiclesPromise = null;
    }
  })();
  return activeVehiclesPromise;
}

/**
 * Synchronously retrieves cached vehicles from localStorage (0ms delay for frame 0).
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
  hasInitialSync = false,
  onError?: (err: Error) => void
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

  try {
    const freshText = await fetchVehiclesRaw();
    if (!freshText) {
      throw new Error('Failed to fetch vehicles from network');
    }

    if (cachedRaw && cachedRaw === freshText) {
      return;
    }

    await setCachedVehiclesString(freshText);
    const vehicles = parseAndNormalizeVehicles(freshText);
    if (vehicles.length > 0) {
      onUpdate(vehicles);
    }
  } catch (err) {
    console.warn('[Sync] Error syncing vehicles:', err);
    onError?.(err instanceof Error ? err : new Error(String(err)));
  }
}
