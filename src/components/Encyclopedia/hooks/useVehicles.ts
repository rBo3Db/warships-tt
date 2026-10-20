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
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const vehiclesRef = useRef<Vehicle[] | null>(vehicles);
  vehiclesRef.current = vehicles;

  const handleSyncError = useCallback(() => {
    const hasData =
      (vehiclesRef.current !== null && vehiclesRef.current.length > 0) ||
      getCachedVehiclesSync() !== null;

    if (hasData) {
      // Cached data is available: do NOT wipe the list, only show warning banner
      setVehiclesError(null);
      setBannerError(ui.syncFailedBanner);
    } else {
      // Nothing to display at all: show full error card
      setVehicles(null);
      setVehiclesError(ui.shipsLoadError);
      setBannerError(null);
    }
  }, [ui]);

  const syncVehiclesData = useCallback(() => {
    setVehiclesError(null);

    const hasCached = vehiclesRef.current !== null && vehiclesRef.current.length > 0;

    loadAndSyncVehicles(
      (freshVehicles) => {
        vehiclesRef.current = freshVehicles;
        setVehicles(freshVehicles);
        setVehiclesError(null);
        setBannerError(null);
      },
      hasCached,
      () => {
        handleSyncError();
      }
    );
  }, [handleSyncError]);

  // Load and sync on mount
  useEffect(() => {
    syncVehiclesData();
  }, [syncVehiclesData]);

  // Manual retry handler
  const retryVehicles = useCallback(() => {
    const hasCached = vehiclesRef.current !== null && vehiclesRef.current.length > 0;
    if (!hasCached) {
      setVehiclesError(null);
    }
    setBannerError(null);

    loadAndSyncVehicles(
      (freshVehicles) => {
        vehiclesRef.current = freshVehicles;
        setVehicles(freshVehicles);
        setVehiclesError(null);
        setBannerError(null);
      },
      hasCached,
      () => {
        handleSyncError();
      }
    );
  }, [handleSyncError]);

  const dismissBanner = useCallback(() => {
    setBannerError(null);
  }, []);

  return {
    vehicles,
    isLoading: vehicles === null && !vehiclesError,
    vehiclesError,
    bannerError,
    retryVehicles,
    dismissBanner,
  };
}

export default useVehicles;
