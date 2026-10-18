import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Nation } from '../../types/nation';
import type { Vehicle, VehicleTypesMap } from '../../types/vehicle';
import {
  getCachedNationsSync,
  loadAndSyncNations,
  getCachedMediaPathSync,
  loadAndSyncMediaPath,
  getCachedVehicleTypesSync,
  loadAndSyncVehicleTypes,
  getCachedVehiclesSync,
  loadAndSyncVehicles,
} from '../../services/nationsService';
import { getUiTranslation } from '../../utils/i18n';
import { Loader } from '../ui/Loader';
import { ErrorCard } from '../ui/ErrorCard';
import { CenteredContainer } from '../ui/CenteredContainer';
import { Encyclopedia } from '../Encyclopedia';

export function App() {
  // 1. Synchronously read each resource from localStorage on frame 0.
  const [nations, setNations] = useState<Nation[] | null>(() => getCachedNationsSync());
  const [mediaPath, setMediaPath] = useState<string | null>(() => getCachedMediaPathSync());
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypesMap | null>(() => getCachedVehicleTypesSync());
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(() => getCachedVehiclesSync());

  // Error tracking states
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);

  // Initial language for system messages
  const defaultLang = useMemo(() => {
    if (typeof navigator !== 'undefined') {
      const code = navigator.language.toLowerCase().split('-')[0];
      return code || 'en';
    }
    return 'en';
  }, []);

  const ui = useMemo(() => getUiTranslation(defaultLang), [defaultLang]);

  // Main loader and sync coordinator
  const loadAll = useCallback(() => {
    setGlobalError(null);
    setBannerError(null);

    const handleSyncError = () => {
      setBannerError(ui.syncFailedBanner);
    };

    loadAndSyncNations(
      setNations,
      nations !== null,
      () => {
        if (!nations) setGlobalError(ui.serverErrorDesc);
        else handleSyncError();
      }
    );

    loadAndSyncMediaPath(
      setMediaPath,
      mediaPath !== null,
      () => {
        if (!mediaPath) setGlobalError(ui.serverErrorDesc);
        else handleSyncError();
      }
    );

    loadAndSyncVehicleTypes(
      setVehicleTypes,
      vehicleTypes !== null,
      () => {
        if (!vehicleTypes) setGlobalError(ui.serverErrorDesc);
        else handleSyncError();
      }
    );

    loadAndSyncVehicles(
      (v) => {
        setVehicles(v);
        setVehiclesError(null);
      },
      vehicles !== null,
      () => {
        if (!vehicles) {
          setVehiclesError(ui.shipsLoadError);
        } else {
          handleSyncError();
        }
      }
    );
  }, [nations, mediaPath, vehicleTypes, vehicles, ui]);

  // Load and sync on mount
  useEffect(() => {
    loadAll();
  }, []);

  // Dedicated retry for catalog vehicles
  const handleRetryVehicles = useCallback(() => {
    setVehiclesError(null);
    loadAndSyncVehicles(
      (v) => {
        setVehicles(v);
        setVehiclesError(null);
      },
      false,
      () => setVehiclesError(ui.shipsLoadError)
    );
  }, [ui]);

  // Cold start fallback: only if literally nothing is in cache yet
  const isCompletelyEmpty = !nations && !mediaPath && !vehicleTypes && !vehicles;
  if (isCompletelyEmpty) {
    if (globalError) {
      return (
        <CenteredContainer>
          <ErrorCard
            title={ui.connectionError}
            message={globalError}
            retryLabel={ui.retry}
            onRetry={loadAll}
          />
        </CenteredContainer>
      );
    }
    return (
      <CenteredContainer>
        <Loader />
      </CenteredContainer>
    );
  }

  // Progressive rendering with non-blocking error banner & localized ship retry
  return (
    <Encyclopedia
      nations={nations}
      mediaPath={mediaPath}
      vehicleTypes={vehicleTypes}
      vehicles={vehicles}
      bannerError={bannerError}
      onRetryBanner={loadAll}
      onDismissBanner={() => setBannerError(null)}
      vehiclesError={vehiclesError}
      onRetryVehicles={handleRetryVehicles}
    />
  );
}

export default App;



