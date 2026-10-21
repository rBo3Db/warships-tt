import { DEFAULT_LANGUAGE } from './languages';

const BASE_URL = '';

export const API_CONFIG = {
  BASE_URL,
  ORIGIN_URL: 'https://vortex.worldofwarships.eu',
  ENDPOINTS: {
    NATIONS: `${BASE_URL}/api/encyclopedia/${DEFAULT_LANGUAGE}/nations/`,
    MEDIA_PATH: `${BASE_URL}/api/encyclopedia/${DEFAULT_LANGUAGE}/media_path/`,
    VEHICLES: `${BASE_URL}/api/encyclopedia/${DEFAULT_LANGUAGE}/vehicles/`,
    VEHICLE_TYPES: `${BASE_URL}/api/encyclopedia/${DEFAULT_LANGUAGE}/vehicle_types_common/`,
  },
} as const;
