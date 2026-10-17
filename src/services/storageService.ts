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

/**
 * Gets cached vehicles JSON string from localStorage (or IndexedDB fallback)
 */
export async function getCachedVehiclesString(): Promise<string | null> {
  try {
    const fromLs = localStorage.getItem(LS_KEY);
    if (fromLs) return fromLs;
  } catch {
    // localStorage might be disabled or restricted
  }
  return getIdbItem(LS_KEY);
}

/**
 * Saves vehicles JSON string to localStorage.
 * If 3.6MB exceeds the browser's localStorage quota (often ~5MB), gracefully saves to IndexedDB.
 */
export async function setCachedVehiclesString(rawText: string): Promise<void> {
  try {
    localStorage.setItem(LS_KEY, rawText);
    // If successfully saved to localStorage, remove any previous IndexedDB fallback to save space
    await deleteIdbItem(LS_KEY);
    return;
  } catch (err) {
    console.warn('[Cache] localStorage quota exceeded, saving to IndexedDB instead:', err);
  }

  // Remove potential partial entry from localStorage and write to IndexedDB
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    // ignore
  }
  await setIdbItem(LS_KEY, rawText);
}
