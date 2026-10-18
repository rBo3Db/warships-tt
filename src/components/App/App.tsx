import { useState, Suspense } from 'react';
import { fetchAppData } from '../../services/nationsService';
import { Loader } from '../ui/Loader';
import { Encyclopedia } from '../Encyclopedia';

export function App() {
  const [dataPromise] = useState(() => fetchAppData());

  return (
    <Suspense fallback={<Loader />}>
      <Encyclopedia dataPromise={dataPromise} />
    </Suspense>
  );
}

export default App;
