import { useState, useEffect } from 'react';
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
import { Loader } from '../ui/Loader';
import { Encyclopedia } from '../Encyclopedia';

export function App() {
  // 1. Synchronously read each resource from localStorage on frame 0.
  // Whichever resource exists in cache is immediately available with 0ms delay!
  const [nations, setNations] = useState<Nation[] | null>(() => getCachedNationsSync());
  const [mediaPath, setMediaPath] = useState<string | null>(() => getCachedMediaPathSync());
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypesMap | null>(() => getCachedVehicleTypesSync());
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(() => getCachedVehiclesSync());

  // 2. Each resource loads and syncs completely independently in parallel:
  // - Fast resources (mediaPath 100B, nations 5KB, types 2KB) finish in ~30ms and render instantly.
  // - Heavy vehicles (~3.6MB) load independently without blocking the Header, NationsBar, or language selector.
  useEffect(() => {
    loadAndSyncNations(setNations, nations !== null);
    loadAndSyncMediaPath(setMediaPath, mediaPath !== null);
    loadAndSyncVehicleTypes(setVehicleTypes, vehicleTypes !== null);
    loadAndSyncVehicles(setVehicles, vehicles !== null);
  }, []);

  // Cold start fallback: only shows if literally nothing is in cache yet (first ~30ms of brand new visit)
  const isCompletelyEmpty = !nations && !mediaPath && !vehicleTypes && !vehicles;
  if (isCompletelyEmpty) {
    return <Loader />;
  }

  // Progressive rendering:
  // Header and NationsBar appear immediately, while Catalog shows its own loader until vehicles arrive!
  return (
    <Encyclopedia
      nations={nations}
      mediaPath={mediaPath}
      vehicleTypes={vehicleTypes}
      vehicles={vehicles}
    />
  );
}

export default App;


