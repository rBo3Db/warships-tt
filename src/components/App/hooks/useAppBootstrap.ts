import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Nation } from '../../../types/nation';
import type { VehicleTypesMap } from '../../../types/vehicle';
import {
  getCachedNationsSync,
  loadAndSyncNations,
  getCachedMediaPathSync,
  loadAndSyncMediaPath,
} from '../../../services/nationsService';
import {
  getCachedVehicleTypesSync,
  loadAndSyncVehicleTypes,
} from '../../../services/vehiclesService';
import { getUiTranslation, detectBrowserLanguage } from '../../../i18n';

export interface AppBootstrapState {
  mediaPath: string | null;
  nations: Nation[] | null;
  vehicleTypes: VehicleTypesMap | null;
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
  const defaultLang = useMemo(() => detectBrowserLanguage(), []);

  const ui = useMemo(() => getUiTranslation(defaultLang), [defaultLang]);

  const nationsRef = useRef(nations);
  const mediaPathRef = useRef(mediaPath);
  const vehicleTypesRef = useRef(vehicleTypes);

  useEffect(() => {
    nationsRef.current = nations;
    mediaPathRef.current = mediaPath;
    vehicleTypesRef.current = vehicleTypes;
  }, [nations, mediaPath, vehicleTypes]);

  const loadBootstrapData = useCallback(() => {
    const handleSyncError = (hasCachedData: boolean) => {
      if (!hasCachedData) {
        setBootstrapError(ui.serverErrorDesc);
      }
    };

    const hasNations = nationsRef.current !== null;
    const hasMediaPath = mediaPathRef.current !== null;
    const hasVehicleTypes = vehicleTypesRef.current !== null;

    loadAndSyncNations(setNations, hasNations, () => handleSyncError(hasNations));
    loadAndSyncMediaPath(setMediaPath, hasMediaPath, () => handleSyncError(hasMediaPath));
    loadAndSyncVehicleTypes(setVehicleTypes, hasVehicleTypes, () => handleSyncError(hasVehicleTypes));
  }, [ui]);

  useEffect(() => {
    loadBootstrapData();
  }, [loadBootstrapData]);

  const retryBootstrap = useCallback(() => {
    setBootstrapError(null);
    loadBootstrapData();
  }, [loadBootstrapData]);

  // Cold start fallback: only if essential metadata is completely missing from cache
  const isColdStart = !nations && !mediaPath && !vehicleTypes;

  return {
    mediaPath,
    nations,
    vehicleTypes,
    isColdStart,
    bootstrapError,
    retryBootstrap,
  };
}

export default useAppBootstrap;
