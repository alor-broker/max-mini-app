
export interface MaxWebApp {
  DeviceStorage: {
    setItem: (key: string, value: string) => Promise<void> | void;
    getItem: (key: string) => Promise<string | null> | string | null;
    removeItem: (key: string) => Promise<void> | void;
    clear: () => Promise<void> | void;
  };
}

declare global {
  interface Window {
    WebApp?: MaxWebApp;
  }
}

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
    if (typeof window !== 'undefined' && window.WebApp?.DeviceStorage) {
      await window.WebApp.DeviceStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, value);
    }
  },

  /**
   * Retrieves a value by key.
   * @param key The key to look up.
   * @returns The stored value or null if not found.
   */
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window !== 'undefined' && window.WebApp?.DeviceStorage) {
      const value = await window.WebApp.DeviceStorage.getItem(key);
      // Ensure null is returned if the value is undefined or strictly null from the bridge
      return value !== undefined ? value : null;
    }
    return localStorage.getItem(key);
  },

  /**
   * Removes an item by key.
   * @param key The key to remove.
   */
  removeItem: async (key: string): Promise<void> => {
    if (typeof window !== 'undefined' && window.WebApp?.DeviceStorage) {
      await window.WebApp.DeviceStorage.removeItem(key);
    } else {
      localStorage.removeItem(key);
    }
  },

  /**
   * Clears all stored data.
   */
  clear: async (): Promise<void> => {
    if (typeof window !== 'undefined' && window.WebApp?.DeviceStorage) {
      await window.WebApp.DeviceStorage.clear();
    } else {
      localStorage.clear();
    }
  }
};
