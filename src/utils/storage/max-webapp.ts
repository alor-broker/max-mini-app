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
 * Detects whether the app is running inside the MAX messenger runtime.
 *
 * Cannot rely on `window.WebApp` or `window.WebApp.DeviceStorage` existing
 * because the bridge script (max-web-app.js) always creates those objects,
 * even in a regular browser where the native transport is unavailable.
 *
 * Instead we use heuristics: native platforms report a non-"web" platform,
 * the presence of initData, or MAX-specific URL search params.
 */
export const isLikelyMaxRuntime = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const { hostname, search } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return false;
  }

  const platform = window.WebApp?.platform;
  if (platform && platform !== 'web') {
    return true;
  }

  const initData = window.WebApp?.initData;
  if (typeof initData === 'string' && initData.length > 0) {
    return true;
  }

  const params = new URLSearchParams(search);
  return (
    params.has('WebAppVersion') ||
    params.has('webAppVersion') ||
    params.has('WebAppData') ||
    params.has('webAppData')
  );
};
