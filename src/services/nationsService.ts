import type { Nation, NationsApiResponse } from '../types/nation';
import type { Vehicle, VehicleTypesMap } from '../types/vehicle';
import { API_CONFIG } from '../config/api';
import { fetchVehicleTypes, fetchVehicles } from './vehiclesService';

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
    console.error('Failed to fetch media_path from API:', err);
    return '';
  }
}

export async function fetchNations(): Promise<{ data: Nation[] }> {
  try {
    const response = await fetch(API_CONFIG.ENDPOINTS.NATIONS);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json: NationsApiResponse = await response.json();
    if (json.status === 'ok' && Array.isArray(json.data)) {
      return { data: json.data };
    }
    throw new Error('Invalid nations API response');
  } catch (err) {
    console.error('Failed to fetch nations from API:', err);
    return { data: [] };
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
