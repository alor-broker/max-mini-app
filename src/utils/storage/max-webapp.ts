export interface MaxWebApp {
  platform?: string;
  version?: string;
  initData?: string;
  DeviceStorage: {
    setItem: (key: string, value: string, callback?: (error: unknown, success?: boolean) => void) => Promise<void> | void;
    getItem: (key: string, callback?: (error: unknown, value: string | null) => void) => Promise<string | null> | string | null | void;
    removeItem: (key: string, callback?: (error: unknown, success?: boolean) => void) => Promise<void> | void;
    clear: (callback?: (error: unknown, success?: boolean) => void) => Promise<void> | void;
  };
}

declare global {
  interface Window {
    WebApp?: MaxWebApp;
  }
}

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
