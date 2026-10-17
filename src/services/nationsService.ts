import type { Nation, NationsApiResponse } from '../types/nation';
import type { Vehicle, VehicleTypesMap } from '../types/vehicle';
import { FALLBACK_NATIONS } from '../data/nationsFallback';
import { API_CONFIG } from '../config/api';
import { fetchVehicleTypes, fetchVehicles } from './vehiclesService';

export const FALLBACK_MEDIA_PATH = 'https://wows-gloss-icons.wgcdn.co/icons/';

interface MediaPathApiResponse {
  status: string;
  data: string;
}

export async function fetchMediaPath(): Promise<string> {
  try {
    const response = await fetch(API_CONFIG.ENDPOINTS.MEDIA_PATH);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json: MediaPathApiResponse = await response.json();
    if (json.status === 'ok' && typeof json.data === 'string') {
      return json.data;
    }
    throw new Error('Invalid media path API response');
  } catch (err) {
    console.warn('Failed to fetch media_path, using fallback:', err);
    return FALLBACK_MEDIA_PATH;
  }
}

export async function fetchNations(): Promise<{ data: Nation[]; isFallback: boolean }> {
  try {
    const response = await fetch(API_CONFIG.ENDPOINTS.NATIONS);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json: NationsApiResponse = await response.json();
    if (json.status === 'ok' && Array.isArray(json.data)) {
      return { data: json.data, isFallback: false };
    }
    throw new Error('Invalid nations API response');
  } catch (err) {
    console.warn('API fetch failed or blocked by CORS, using provided dataset fallback:', err);
    return { data: FALLBACK_NATIONS, isFallback: true };
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
    fetchMediaPath(),
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

export function buildFlagUrl(mediaPath: string, iconPath: string): string {
  if (!iconPath) return '';
  if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) return iconPath;
  const base = mediaPath.endsWith('/') ? mediaPath : `${mediaPath}/`;
  return `${base}${iconPath}`;
}
