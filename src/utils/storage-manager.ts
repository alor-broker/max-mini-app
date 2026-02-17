
export interface MaxWebApp {
  DeviceStorage: {
    setItem: (key: string, value: string) => Promise<void>;
    getItem: (key: string) => Promise<string | null>;
    removeItem: (key: string) => Promise<void>;
    clear: () => Promise<void>;
  };
}

declare global {
  interface Window {
    WebApp?: MaxWebApp;
  }
}

const TIME_OUT_MS = 100;

const safeBridgeCall = async <T>(promise: Promise<T>): Promise<T> => {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Bridge call timed out'));
    }, TIME_OUT_MS);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
};

/**
 * StorageManager handles data persistence based on the environment.
 * If running inside Max Messenger, it uses window.WebApp.DeviceStorage.
 * Otherwise, falls back to localStorage.
 */
export const storageManager = {
  /**
   * Saves a key-value pair to storage.
   * @param key The key to store.
   * @param value The value to store.
   */
  setItem: async (key: string, value: string): Promise<void> => {
    console.log(`[StorageManager] setItem: ${key}`);
    // Check for platform explicitly if possible, or blindly rely on availability + timeout
    // In browser, platform might be 'unknown' or the bridge just hangs.
    if (typeof window !== 'undefined' && window.WebApp?.DeviceStorage) {
      console.log(`[StorageManager] Using DeviceStorage for ${key}`);
      try {
        await safeBridgeCall(window.WebApp.DeviceStorage.setItem(key, value));
      } catch (e) {
        console.warn(`[StorageManager] DeviceStorage.setItem failed or timed out for ${key}, falling back to localStorage`, e);
        // Fallback
        localStorage.setItem(key, value);
      }
    } else {
      console.log(`[StorageManager] Using localStorage for ${key}`);
      localStorage.setItem(key, value);
    }
  },

  /**
   * Retrieves a value by key.
   * @param key The key to look up.
   * @returns The stored value or null if not found.
   */
  getItem: async (key: string): Promise<string | null> => {
    console.log(`[StorageManager] getItem: ${key}`);
    if (typeof window !== 'undefined' && window.WebApp?.DeviceStorage) {
      console.log(`[StorageManager] Using DeviceStorage for ${key}`);
      try {
        const value = await safeBridgeCall(window.WebApp.DeviceStorage.getItem(key));
        const result = value !== undefined ? value : null;
        console.log(`[StorageManager] DeviceStorage result for ${key}:`, result);
        return result;
      } catch (e) {
        console.warn(`[StorageManager] DeviceStorage.getItem failed or timed out for ${key}, falling back to localStorage`, e);
        const result = localStorage.getItem(key);
        console.log(`[StorageManager] localStorage fallback result for ${key}:`, result);
        return result;
      }
    }
    const result = localStorage.getItem(key);
    console.log(`[StorageManager] localStorage result for ${key}:`, result);
    return result;
  },

  /**
   * Removes an item by key.
   * @param key The key to remove.
   */
  removeItem: async (key: string): Promise<void> => {
    console.log(`[StorageManager] removeItem: ${key}`);
    if (typeof window !== 'undefined' && window.WebApp?.DeviceStorage) {
      try {
        await safeBridgeCall(window.WebApp.DeviceStorage.removeItem(key));
      } catch (e) {
        console.warn(`[StorageManager] DeviceStorage.removeItem failed or timed out for ${key}, falling back to localStorage`, e);
        localStorage.removeItem(key);
      }
    } else {
      localStorage.removeItem(key);
    }
  },

  /**
   * Clears all stored data.
   */
  clear: async (): Promise<void> => {
    console.log(`[StorageManager] clear`);
    if (typeof window !== 'undefined' && window.WebApp?.DeviceStorage) {
      try {
        await safeBridgeCall(window.WebApp.DeviceStorage.clear());
      } catch (e) {
        console.warn('[StorageManager] DeviceStorage.clear failed or timed out, falling back to localStorage', e);
        localStorage.clear();
      }
    } else {
      localStorage.clear();
    }
  }
};
