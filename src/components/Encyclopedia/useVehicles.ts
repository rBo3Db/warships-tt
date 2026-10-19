import { useState, useEffect, useCallback } from 'react';
import type { Vehicle } from '../../types/vehicle';
import { getCachedVehiclesSync, loadAndSyncVehicles } from '../../services/nationsService';
import { useI18n } from '../../context';

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

  const syncVehiclesData = useCallback(() => {
    setVehiclesError(null);

    loadAndSyncVehicles(
      (freshVehicles) => {
        setVehicles(freshVehicles);
        setVehiclesError(null);
      },
      vehicles !== null,
      () => {
        if (!vehicles) {
          setVehiclesError(ui.shipsLoadError);
        } else {
          setBannerError(ui.syncFailedBanner);
        }
      }
    );
  }, [vehicles, ui]);

  // Load and sync on mount
  useEffect(() => {
    syncVehiclesData();
  }, []);

  // Manual retry handler
  const retryVehicles = useCallback(() => {
    setVehiclesError(null);
    loadAndSyncVehicles(
      (freshVehicles) => {
        setVehicles(freshVehicles);
        setVehiclesError(null);
      },
      false,
      () => setVehiclesError(ui.shipsLoadError)
    );
  }, [ui]);

  const dismissBanner = useCallback(() => {
    setBannerError(null);
  }, []);

  return {
    vehicles,
    isLoading: vehicles === null,
    vehiclesError,
    bannerError,
    retryVehicles,
    dismissBanner,
  };
}

export default useVehicles;
