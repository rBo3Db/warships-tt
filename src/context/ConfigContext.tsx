import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Nation } from '../types/nation';
import type { VehicleTypesMap, VehicleTypeInfo } from '../types/vehicle';
import { buildMediaUrl } from '../services/vehiclesService';
import { buildFlagUrl } from '../services/nationsService';

export interface ConfigContextValue {
  mediaPath: string;
  nations: Nation[];
  vehicleTypes: VehicleTypesMap;
  sortedVehicleTypes: [string, VehicleTypeInfo][];
  getNation: (name: string) => Nation | undefined;
  getMediaUrl: (path?: string) => string;
  getFlagUrl: (iconPath?: string) => string;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export interface ConfigProviderProps {
  children: ReactNode;
  mediaPath: string;
  nations: Nation[];
  vehicleTypes: VehicleTypesMap;
}

export function ConfigProvider({
  children,
  mediaPath,
  nations,
  vehicleTypes,
}: ConfigProviderProps) {
  const nationsMap = useMemo(() => {
    const map = new Map<string, Nation>();
    for (const nation of nations) {
      map.set(nation.name, nation);
    }
    return map;
  }, [nations]);

  const sortedVehicleTypes = useMemo(() => {
    return Object.entries(vehicleTypes).sort(
      ([, a], [, b]) => a.sort_order - b.sort_order
    );
  }, [vehicleTypes]);

  const value = useMemo<ConfigContextValue>(() => {
    return {
      mediaPath,
      nations,
      vehicleTypes,
      sortedVehicleTypes,
      getNation: (name: string) => nationsMap.get(name),
      getMediaUrl: (path?: string) => buildMediaUrl(mediaPath, path),
      getFlagUrl: (iconPath?: string) => (iconPath ? buildFlagUrl(mediaPath, iconPath) : ''),
    };
  }, [mediaPath, nations, vehicleTypes, nationsMap, sortedVehicleTypes]);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return ctx;
}
