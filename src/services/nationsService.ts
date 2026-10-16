import type { Nation, NationsApiResponse } from '../types/nation';
import { FALLBACK_NATIONS } from '../data/nationsFallback';

export const API_URL = 'https://vortex.worldofwarships.eu/api/encyclopedia/en/nations/';

export const NATION_FLAG_EMOJIS: Record<string, string> = {
  ussr: '🇷🇺',
  japan: '🇯🇵',
  usa: '🇺🇸',
  uk: '🇬🇧',
  germany: '🇩🇪',
  france: '🇫🇷',
  italy: '🇮🇹',
  europe: '🇪🇺',
  pan_asia: '🌏',
  commonwealth: '🌐',
  pan_america: '🌎',
  netherlands: '🇳🇱',
  spain: '🇪🇸',
};

/**
 * Converts integer color format (e.g. 14764062) to hex color string (#e1481e)
 */
export function intToHexColor(colorInt: number): string {
  const hex = (colorInt & 0xffffff).toString(16).padStart(6, '0');
  return `#${hex}`;
}

export async function fetchNations(): Promise<{ data: Nation[]; isFallback: boolean }> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json: NationsApiResponse = await response.json();
    if (json.status === 'ok' && Array.isArray(json.data)) {
      return { data: json.data, isFallback: false };
    }
    throw new Error('Invalid API response shape');
  } catch (err) {
    console.warn('API fetch failed or blocked by CORS, using provided dataset fallback:', err);
    return { data: FALLBACK_NATIONS, isFallback: true };
  }
}
