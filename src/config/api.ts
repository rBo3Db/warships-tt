const isDev = import.meta.env.DEV;
const BASE_URL = isDev ? '' : 'https://vortex.worldofwarships.eu';

export const API_CONFIG = {
  BASE_URL,
  ORIGIN_URL: 'https://vortex.worldofwarships.eu',
  ENDPOINTS: {
    NATIONS: `${BASE_URL}/api/encyclopedia/en/nations/`,
    MEDIA_PATH: `${BASE_URL}/api/encyclopedia/en/media_path/`,
    VEHICLES: `${BASE_URL}/api/encyclopedia/en/vehicles/`,
    VEHICLE_TYPES: `${BASE_URL}/api/encyclopedia/en/vehicle_types_common/`,
  },
} as const;

