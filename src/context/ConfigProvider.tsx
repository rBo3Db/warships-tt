import { useMemo, type ReactNode } from 'react';
import type { Nation } from '../types/nation';
import type { VehicleTypesMap } from '../types/vehicle';
import { buildMediaUrl, buildFlagUrl } from '../utils/media';
import { ConfigContext, type ConfigContextValue } from './ConfigContext';

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

export default ConfigProvider;
