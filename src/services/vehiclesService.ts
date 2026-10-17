import type {
  Vehicle,
  VehicleRaw,
  VehiclesApiResponse,
  VehicleTypesApiResponse,
  VehicleTypesMap,
} from '../types/vehicle';
import { FALLBACK_VEHICLE_TYPES } from '../data/vehicleTypesFallback';
import { FALLBACK_VEHICLES } from '../data/vehiclesFallback';
import { API_CONFIG } from '../config/api';

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

let cachedVehicleTypesPromise: Promise<VehicleTypesMap> | null = null;

export async function fetchVehicleTypes(): Promise<VehicleTypesMap> {
  if (cachedVehicleTypesPromise) {
    return cachedVehicleTypesPromise;
  }

  cachedVehicleTypesPromise = (async () => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.VEHICLE_TYPES);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json: VehicleTypesApiResponse = await response.json();
      if (json.status === 'ok' && json.data) {
        return json.data;
      }
      throw new Error('Invalid vehicle_types response');
    } catch (err) {
      console.warn('Failed to fetch vehicle_types from primary endpoint, trying direct origin:', err);
      try {
        const directUrl = `${API_CONFIG.ORIGIN_URL}/api/encyclopedia/en/vehicle_types_common/`;
        const directResp = await fetch(directUrl);
        if (directResp.ok) {
          const json: VehicleTypesApiResponse = await directResp.json();
          if (json.status === 'ok' && json.data) return json.data;
        }
      } catch {
        // ignore direct failure
      }
      console.warn('Using fallback vehicle types:', err);
      return FALLBACK_VEHICLE_TYPES;
    }
  })();

  return cachedVehicleTypesPromise;
}

let cachedVehiclesPromise: Promise<Vehicle[]> | null = null;

export async function fetchVehicles(): Promise<Vehicle[]> {
  if (cachedVehiclesPromise) {
    return cachedVehiclesPromise;
  }

  cachedVehiclesPromise = (async () => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.VEHICLES);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json: VehiclesApiResponse = await response.json();
      if (json.status === 'ok' && json.data) {
        return normalizeVehiclesMap(json.data);
      }
      throw new Error('Invalid vehicles dump response');
    } catch (err) {
      console.warn('Failed to fetch vehicles from primary endpoint, trying direct origin:', err);
      try {
        const directUrl = `${API_CONFIG.ORIGIN_URL}/api/encyclopedia/en/vehicles/`;
        const directResp = await fetch(directUrl);
        if (directResp.ok) {
          const json: VehiclesApiResponse = await directResp.json();
          if (json.status === 'ok' && json.data) {
            return normalizeVehiclesMap(json.data);
          }
        }
      } catch {
        // ignore direct failure
      }
      console.warn('Using fallback vehicles sample dataset:', err);
      return normalizeVehiclesMap(FALLBACK_VEHICLES);
    }
  })();

  return cachedVehiclesPromise;
}

export function buildMediaUrl(mediaPath: string, path?: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = mediaPath.endsWith('/') ? mediaPath : `${mediaPath}/`;
  return `${base}${path}`;
}
