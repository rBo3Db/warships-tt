import { useState, useEffect, useCallback, useRef } from 'react';
import type { Vehicle } from '../../../types/vehicle';
import { getCachedVehiclesSync, loadAndSyncVehicles } from '../../../services/vehiclesService';
import { useI18n } from '../../../context';

export interface VehiclesState {
  vehicles: Vehicle[] | null;
  isLoading: boolean;
  vehiclesError: string | null;
  bannerError: string | null;
  retryVehicles: () => void;
  dismissBanner: () => void;
}

export function useVehicles(): VehiclesState {
  const { ui } = useI18n();

  // Read vehicles from cache on frame 0
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(() => getCachedVehiclesSync());
  const [hasVehiclesError, setHasVehiclesError] = useState(false);
  const [hasBannerError, setHasBannerError] = useState(false);

  const vehiclesRef = useRef<Vehicle[] | null>(vehicles);
  vehiclesRef.current = vehicles;

  const handleSyncError = useCallback(() => {
    const hasData =
      (vehiclesRef.current !== null && vehiclesRef.current.length > 0) ||
      getCachedVehiclesSync() !== null;

    if (hasData) {
      // Cached data is available: do NOT wipe the list, only show warning banner
      setHasVehiclesError(false);
      setHasBannerError(true);
    } else {
      // Nothing to display at all: show full error card
      setVehicles(null);
      setHasVehiclesError(true);
      setHasBannerError(false);
    }
  }, []);

  const syncData = useCallback(
    (isRetry = false) => {
      const hasCached = vehiclesRef.current !== null && vehiclesRef.current.length > 0;
      if (!hasCached || isRetry) {
        setHasVehiclesError(false);
      }
      setHasBannerError(false);

      loadAndSyncVehicles(
        (freshVehicles) => {
          vehiclesRef.current = freshVehicles;
          setVehicles(freshVehicles);
          setHasVehiclesError(false);
          setHasBannerError(false);
        },
        hasCached,
        () => {
          handleSyncError();
        }
      );
    },
    [handleSyncError]
  );

  // Load and sync strictly on mount
  useEffect(() => {
    syncData(false);
  }, [syncData]);

  const retryVehicles = useCallback(() => {
    syncData(true);
  }, [syncData]);

  const dismissBanner = useCallback(() => {
    setHasBannerError(false);
  }, []);

  // Compute localized messages dynamically during render
  const vehiclesError = hasVehiclesError ? ui.shipsLoadError : null;
  const bannerError = hasBannerError ? ui.syncFailedBanner : null;

  return {
    vehicles,
    isLoading: vehicles === null && !hasVehiclesError,
    vehiclesError,
    bannerError,
    retryVehicles,
    dismissBanner,
  };
}

export default useVehicles;
