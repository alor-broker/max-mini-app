export interface MaxDeviceStorage {
  setItem(key: string, value: string): Promise<unknown>;
  getItem(key: string): Promise<unknown>;
  removeItem(key: string): Promise<unknown>;
  clear(): Promise<unknown>;
}

export interface MaxWebApp {
  platform?: string;
  version?: string;
  initData?: string;
  DeviceStorage: MaxDeviceStorage;
}

declare global {
  interface Window {
    WebApp?: MaxWebApp;
  }
}

/**
 * Detects whether the app is running inside a **native** MAX messenger client
 * that supports DeviceStorage (iOS, Android, Desktop).
 *
 *  * Cannot rely on `window.WebApp` or `window.WebApp.DeviceStorage` existing
 * because the bridge script (max-web-app.js) always creates those objects,
 * 
 * The MAX web version (max.ru opened in a browser) also injects the bridge
 * script and sets URL params like `WebAppVersion` / `WebAppData`, but
 * DeviceStorage methods throw `UnsupportedEvent` there.
 *
 * Therefore we ONLY return `true` when the platform is explicitly a native
 * one — anything else (including `"web"` or absent) falls through to the
 * BrowserStorageProvider which uses localStorage.
 */
export const isLikelyMaxRuntime = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const platform = window.WebApp?.platform;

  // Native MAX clients report "ios", "android", or "desktop".
  // The web version reports "web" — DeviceStorage is NOT available there.
  // If platform is absent, we're outside MAX entirely.
  if (typeof platform === 'string' && platform.length > 0 && platform !== 'web') {
    return true;
  }

  return false;
};
