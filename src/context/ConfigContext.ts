import { createContext, useContext } from 'react';
import type { Nation } from '../types/nation';
import type { VehicleTypesMap, VehicleTypeInfo } from '../types/vehicle';

export interface ConfigContextValue {
  mediaPath: string;
  nations: Nation[];
  vehicleTypes: VehicleTypesMap;
  sortedVehicleTypes: [string, VehicleTypeInfo][];
  getNation: (name: string) => Nation | undefined;
  getMediaUrl: (path?: string) => string;
  getFlagUrl: (iconPath?: string) => string;
}

export const ConfigContext = createContext<ConfigContextValue | null>(null);

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return ctx;
}

export { ConfigProvider, type ConfigProviderProps } from './ConfigProvider';
