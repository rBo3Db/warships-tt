import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Nation } from '../../types/nation';
import type { VehicleTypesMap } from '../../types/vehicle';
import {
  getCachedNationsSync,
  loadAndSyncNations,
  getCachedMediaPathSync,
  loadAndSyncMediaPath,
  getCachedVehicleTypesSync,
  loadAndSyncVehicleTypes,
} from '../../services/nationsService';
import { getUiTranslation } from '../../utils/i18n';
import { DEFAULT_LANGUAGE } from '../../config/languages';

export interface AppBootstrapState {
  mediaPath: string | null;
  nations: Nation[] | null;
  vehicleTypes: VehicleTypesMap | null;
  availableLanguages: string[];
  isColdStart: boolean;
  bootstrapError: string | null;
  retryBootstrap: () => void;
}

export function useAppBootstrap(): AppBootstrapState {
  // Synchronously read metadata from cache on frame 0
  const [nations, setNations] = useState<Nation[] | null>(() => getCachedNationsSync());
  const [mediaPath, setMediaPath] = useState<string | null>(() => getCachedMediaPathSync());
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypesMap | null>(() => getCachedVehicleTypesSync());
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  // System language for initial bootstrap errors
  const defaultLang = useMemo(() => {
    if (typeof navigator !== 'undefined') {
      const code = navigator.language.toLowerCase().split('-')[0];
      return code || DEFAULT_LANGUAGE;
    }
    return DEFAULT_LANGUAGE;
  }, []);

  const ui = useMemo(() => getUiTranslation(defaultLang), [defaultLang]);

  // Languages discovered from nations metadata
  const availableLanguages = useMemo(() => {
    if (!nations) return [];
    return Array.from(
      new Set(nations.flatMap((n) => Object.keys(n.localization?.mark || {})))
    );
  }, [nations]);

  const loadBootstrapData = useCallback(() => {
    setBootstrapError(null);

    loadAndSyncNations(
      setNations,
      nations !== null,
      () => {
        if (!nations) setBootstrapError(ui.serverErrorDesc);
      }
    );

    loadAndSyncMediaPath(
      setMediaPath,
      mediaPath !== null,
      () => {
        if (!mediaPath) setBootstrapError(ui.serverErrorDesc);
      }
    );

    loadAndSyncVehicleTypes(
      setVehicleTypes,
      vehicleTypes !== null,
      () => {
        if (!vehicleTypes) setBootstrapError(ui.serverErrorDesc);
      }
    );
  }, [nations, mediaPath, vehicleTypes, ui]);

  useEffect(() => {
    loadBootstrapData();
  }, []);

  // Cold start fallback: only if essential metadata is completely missing from cache
  const isColdStart = !nations && !mediaPath && !vehicleTypes;

  return {
    mediaPath,
    nations,
    vehicleTypes,
    availableLanguages,
    isColdStart,
    bootstrapError,
    retryBootstrap: loadBootstrapData,
  };
}

export default useAppBootstrap;
