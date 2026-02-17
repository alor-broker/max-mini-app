
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
    // Always save to localStorage as a backup/cache because DeviceStorage might be flaky or fire-and-forget
    // preventing us from knowing if it actually succeeded.
    // This ensures that getItem's fallback to localStorage will always find the data.
    localStorage.setItem(key, value);

    if (typeof window !== 'undefined' && window.WebApp?.DeviceStorage) {
      console.log(`[StorageManager] Using DeviceStorage for ${key}`);
      try {
        await safeBridgeCall(window.WebApp.DeviceStorage.setItem(key, value));
      } catch (e) {
        console.warn(`[StorageManager] DeviceStorage.setItem failed or timed out for ${key} (data already saved to localStorage)`, e);
      }
    } else {
      console.log(`[StorageManager] Using localStorage for ${key}`);
    }
  },

  /**
   * Retrieves a value by key.
   * @param key The key to look up.
   * @returns The stored value or null if not found.
   */
  getItem: async (key: string): Promise<string | null> => {
    console.log(`[StorageManager] getItem: ${key}`);

    // Default to localStorage lookup function
    const getFromLocalStorage = () => {
      const value = localStorage.getItem(key);
      console.log(`[StorageManager] localStorage result for ${key}:`, value);
      return value;
    };

    if (typeof window !== 'undefined' && window.WebApp?.DeviceStorage) {
      console.log(`[StorageManager] Using DeviceStorage for ${key}`);
      try {
        const value = await safeBridgeCall(window.WebApp.DeviceStorage.getItem(key));

        // If value is found in DeviceStorage, return it
        if (value !== undefined && value !== null) {
          console.log(`[StorageManager] DeviceStorage result for ${key}:`, value);
          return value;
        }

        // If DeviceStorage returned null/undefined, it might mean the data was saved to 
        // localStorage during a previous failed write. Check localStorage.
        console.log(`[StorageManager] DeviceStorage returned empty for ${key}, checking localStorage fallback`);
        return getFromLocalStorage();

      } catch (e) {
        console.warn(`[StorageManager] DeviceStorage.getItem failed or timed out for ${key}, falling back to localStorage`, e);
        return getFromLocalStorage();
      }
    }

    return getFromLocalStorage();
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
