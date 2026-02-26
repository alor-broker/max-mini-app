export interface MaxWebApp {
  platform?: string;
  version?: string;
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

export interface StorageProvider {
  setItem: (key: string, value: string) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

const BRIDGE_TIMEOUT_MS = 3000;
const BRIDGE_READY_WAIT_MS = 400;
const BRIDGE_READY_POLL_MS = 50;

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Bridge call timed out')), timeoutMs);
    });
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

const isThenable = (value: unknown): value is PromiseLike<unknown> => {
  return (
    (typeof value === 'object' || typeof value === 'function') &&
    value !== null &&
    typeof (value as { then?: unknown }).then === 'function'
  );
};

class BrowserStorageProvider implements StorageProvider {
  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }
}

class MaxDeviceStorageProvider implements StorageProvider {
  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.WebApp?.DeviceStorage;
  }

  private getDeviceStorage(): MaxWebApp['DeviceStorage'] {
    if (!this.isAvailable()) {
      throw new Error('MAX DeviceStorage is not available');
    }
    return window.WebApp!.DeviceStorage;
  }

  private async callCallbackStyle<T>(
    invoker: (callback: (error: unknown, value: T) => void) => void
  ): Promise<T> {
    return withTimeout(
      new Promise<T>((resolve, reject) => {
        try {
          invoker((error, value) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(value);
          });
        } catch (error) {
          reject(error);
        }
      }),
      BRIDGE_TIMEOUT_MS
    );
  }

  async getItem(key: string): Promise<string | null> {
    const deviceStorage = this.getDeviceStorage();
    const getter = deviceStorage.getItem.bind(deviceStorage) as MaxWebApp['DeviceStorage']['getItem'];

    if (getter.length >= 2) {
      return this.callCallbackStyle<string | null>((callback) => {
        getter(key, (error, value) => callback(error, value ?? null));
      });
    }

    const directResult = getter(key);
    if (typeof directResult === 'string' || directResult === null) {
      return directResult;
    }
    if (isThenable(directResult)) {
      return (await withTimeout(Promise.resolve(directResult as PromiseLike<string | null>), BRIDGE_TIMEOUT_MS)) ?? null;
    }

    return this.callCallbackStyle<string | null>((callback) => {
      getter(key, (error, value) => callback(error, value ?? null));
    });
  }

  private async callMutation(
    operation: 'setItem' | 'removeItem' | 'clear',
    key?: string,
    value?: string
  ): Promise<void> {
    const deviceStorage = this.getDeviceStorage();

    const useCallbackStyle =
      (operation === 'setItem' && deviceStorage.setItem.length >= 3) ||
      (operation === 'removeItem' && deviceStorage.removeItem.length >= 2) ||
      (operation === 'clear' && deviceStorage.clear.length >= 1);

    if (useCallbackStyle) {
      await this.callCallbackStyle<boolean>((callback) => {
        const wrapped = (error: unknown, success?: boolean) => callback(error, success ?? true);
        if (operation === 'setItem') {
          deviceStorage.setItem(key!, value!, wrapped);
          return;
        }
        if (operation === 'removeItem') {
          deviceStorage.removeItem(key!, wrapped);
          return;
        }
        deviceStorage.clear(wrapped);
      });
      return;
    }

    let directResult: unknown;
    if (operation === 'setItem') {
      directResult = deviceStorage.setItem(key!, value!);
    } else if (operation === 'removeItem') {
      directResult = deviceStorage.removeItem(key!);
    } else {
      directResult = deviceStorage.clear();
    }

    if (isThenable(directResult)) {
      await withTimeout(Promise.resolve(directResult), BRIDGE_TIMEOUT_MS);
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    await this.callMutation('setItem', key, value);
  }

  async removeItem(key: string): Promise<void> {
    await this.callMutation('removeItem', key);
  }

  async clear(): Promise<void> {
    await this.callMutation('clear');
  }
}

class StorageManager implements StorageProvider {
  constructor(
    private readonly browserProvider: BrowserStorageProvider,
    private readonly maxProvider: MaxDeviceStorageProvider
  ) {}

  private isLocalDevHost(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    const { hostname } = window.location;
    return hostname === 'localhost' || hostname === '127.0.0.1';
  }

  private hasMaxLaunchParams(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    const search = new URLSearchParams(window.location.search);
    return (
      search.has('WebAppVersion') ||
      search.has('webAppVersion') ||
      search.has('WebAppData') ||
      search.has('webAppData')
    );
  }

  private isLikelyMaxContext(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    if (this.isLocalDevHost()) {
      return false;
    }

    const platform = window.WebApp?.platform;
    if (platform && platform !== 'web') {
      return true;
    }

    const initData = (window.WebApp as { initData?: string } | undefined)?.initData;
    if (typeof initData === 'string' && initData.length > 0) {
      return true;
    }

    return this.hasMaxLaunchParams();
  }

  private async waitForBridgeReady(): Promise<void> {
    const startedAt = Date.now();
    while (Date.now() - startedAt < BRIDGE_READY_WAIT_MS) {
      if (this.maxProvider.isAvailable()) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, BRIDGE_READY_POLL_MS));
    }
  }

  private async resolveProvider(): Promise<StorageProvider> {
    if (this.isLikelyMaxContext()) {
      await this.waitForBridgeReady();
      if (this.maxProvider.isAvailable()) {
        return this.maxProvider;
      }
      throw new Error('MAX context detected but DeviceStorage is unavailable');
    }

    return this.browserProvider;
  }

  async setItem(key: string, value: string): Promise<void> {
    const provider = await this.resolveProvider();
    await provider.setItem(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    const provider = await this.resolveProvider();
    return provider.getItem(key);
  }

  async removeItem(key: string): Promise<void> {
    const provider = await this.resolveProvider();
    await provider.removeItem(key);
  }

  async clear(): Promise<void> {
    const provider = await this.resolveProvider();
    await provider.clear();
  }
}

export const storageManager = new StorageManager(
  new BrowserStorageProvider(),
  new MaxDeviceStorageProvider()
);
