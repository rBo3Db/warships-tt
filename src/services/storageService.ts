const LS_KEY = 'wows_vehicles_json';
const DB_NAME = 'wows_cache_db';
const STORE_NAME = 'cache_store';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getIdbItem(key: string): Promise<string | null> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function setIdbItem(key: string, value: string): Promise<void> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error('Failed to save to IndexedDB:', e);
  }
}

async function deleteIdbItem(key: string): Promise<void> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}

export const STORAGE_KEYS = {
  VEHICLES: 'wows_vehicles_json',
  NATIONS: 'wows_nations_json',
  MEDIA_PATH: 'wows_media_path_json',
  VEHICLE_TYPES: 'wows_vehicle_types_json',
} as const;

/**
 * Synchronously gets cached item from localStorage (0ms delay for instant first paint)
 */
export function getCachedItemSync(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Gets cached JSON string by key from localStorage (or IndexedDB fallback)
 */
export async function getCachedItem(key: string): Promise<string | null> {
  const fromLs = getCachedItemSync(key);
  if (fromLs) return fromLs;
  return getIdbItem(key);
}

/**
 * Saves JSON string by key to localStorage (with IndexedDB fallback on quota exceed)
 */
export async function setCachedItem(key: string, rawText: string): Promise<void> {
  try {
    localStorage.setItem(key, rawText);
    await deleteIdbItem(key);
    return;
  } catch (err) {
    console.warn(`[Cache] localStorage quota exceeded for key ${key}, saving to IndexedDB instead:`, err);
  }

  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
  await setIdbItem(key, rawText);
}

/**
 * Aliases for vehicles cache
 */
export async function getCachedVehiclesString(): Promise<string | null> {
  return getCachedItem(STORAGE_KEYS.VEHICLES);
}

export async function setCachedVehiclesString(rawText: string): Promise<void> {
  return setCachedItem(STORAGE_KEYS.VEHICLES, rawText);
}

