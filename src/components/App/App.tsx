import { useState, useEffect } from 'react';
import {
  fetchAppData,
  getCachedAppDataSync,
  syncAppData,
  type AppData,
} from '../../services/nationsService';
import { Loader } from '../ui/Loader';
import { Encyclopedia } from '../Encyclopedia';

export function App() {
  // 1. Synchronously read from localStorage on frame 0.
  // If user has visited before, appData is available immediately with 0ms delay!
  const [appData, setAppData] = useState<AppData | null>(() => getCachedAppDataSync());

  useEffect(() => {
    if (!appData) {
      // Cold start: cache is empty, load all data with Loader
      fetchAppData().then((data) => {
        setAppData(data);
      });
    } else {
      // Warm start: UI already rendered on frame 0, sync in background silently
      syncAppData((partial) => {
        setAppData((prev) => (prev ? { ...prev, ...partial } : null));
      });
    }
  }, []);

  // Cold start fallback: only shows when cache is completely empty
  if (!appData) {
    return <Loader />;
  }

  // Instant render: zero spinner flash on page reload
  return <Encyclopedia appData={appData} />;
}

export default App;

