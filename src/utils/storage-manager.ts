
export interface MaxWebApp {
  platform?: string;
  version?: string;
  DeviceStorage: {
    setItem: (key: string, value: string, callback?: (error: Error | null, success: boolean) => void) => void;
    getItem: (key: string, callback: (error: Error | null, value: string | null) => void) => void;
    removeItem: (key: string, callback?: (error: Error | null, success: boolean) => void) => void;
    clear: (callback?: (error: Error | null, success: boolean) => void) => void;
  };
}

declare global {
  interface Window {
    WebApp?: MaxWebApp;
  }
}

const isDeviceStorageAvailable = (): boolean => {
  return typeof window !== 'undefined' &&
    !!window.WebApp?.DeviceStorage &&
    // Optional: Add version check if known, e.g. window.WebApp.version >= '...'
    true;
};

export const storageManager = {
  getItem: async (key: string): Promise<string | null> => {
    if (!isDeviceStorageAvailable()) {
      return localStorage.getItem(key);
    }

    return new Promise<string | null>((resolve) => {
      try {
        window.WebApp!.DeviceStorage.getItem(key, (error, value) => {
          if (error) {
            console.warn('[StorageManager] DeviceStorage.getItem error:', error);
            // Fallback to localStorage on error
            resolve(localStorage.getItem(key));
            return;
          }
          resolve((value?.length ?? 0) > 0 ? value : null);
        });
      } catch (e) {
        console.error('[StorageManager] DeviceStorage.getItem exception:', e);
        resolve(localStorage.getItem(key));
      }
    });
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (!isDeviceStorageAvailable()) {
      localStorage.setItem(key, value);
      return;
    }

    // Dual write for safety/fallback? 
    // The Telegram logic only writes to ONE.
    // usage: if (this.storage == null) { localStorage... } else { this.storage... }
    // We will follow that.

    return new Promise<void>((resolve) => {
      try {
        window.WebApp!.DeviceStorage.setItem(key, value, (error, success) => {
          if (error) {
            console.warn('[StorageManager] DeviceStorage.setItem error:', error);
            // Fallback to localStorage on error
            localStorage.setItem(key, value);
          }
          resolve();
        });
      } catch (e) {
        console.error('[StorageManager] DeviceStorage.setItem exception:', e);
        localStorage.setItem(key, value);
        resolve();
      }
    });
  },

  removeItem: async (key: string): Promise<void> => {
    if (!isDeviceStorageAvailable()) {
      localStorage.removeItem(key);
      return;
    }

    return new Promise<void>((resolve) => {
      try {
        window.WebApp!.DeviceStorage.removeItem(key, (error, success) => {
          if (error) {
            console.warn('[StorageManager] DeviceStorage.removeItem error:', error);
            localStorage.removeItem(key);
          }
          resolve();
        });
      } catch (e) {
        console.error('[StorageManager] DeviceStorage.removeItem exception:', e);
        localStorage.removeItem(key);
        resolve();
      }
    });
  },

  clear: async (): Promise<void> => {
    if (!isDeviceStorageAvailable()) {
      localStorage.clear();
      return;
    }

    return new Promise<void>((resolve) => {
      try {
        window.WebApp!.DeviceStorage.clear((error, success) => {
          if (error) {
            console.warn('[StorageManager] DeviceStorage.clear error:', error);
            localStorage.clear();
          }
          resolve();
        });
      } catch (e) {
        console.error('[StorageManager] DeviceStorage.clear exception:', e);
        localStorage.clear();
        resolve();
      }
    });
  }
};
