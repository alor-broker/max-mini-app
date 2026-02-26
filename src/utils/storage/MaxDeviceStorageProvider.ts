import { StorageProvider } from '../storage-manager';
import { MaxWebApp } from './max-webapp';

const BRIDGE_READ_TIMEOUT_MS = 1200;
const BRIDGE_MUTATION_TIMEOUT_MS = 2500;
const BRIDGE_READY_WAIT_MS = 500;
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

export class MaxDeviceStorageProvider implements StorageProvider {
  constructor(private readonly webAppRef: () => MaxWebApp | undefined = () => window.WebApp) {}

  private async getDeviceStorage() {
    const startedAt = Date.now();
    while (Date.now() - startedAt < BRIDGE_READY_WAIT_MS) {
      const webApp = this.webAppRef();
      if (webApp?.DeviceStorage) {
        return webApp.DeviceStorage;
      }
      await new Promise((resolve) => setTimeout(resolve, BRIDGE_READY_POLL_MS));
    }
    throw new Error('MAX DeviceStorage is not available');
  }

  private async callBridge<T>(
    invoker: (callback: (error: unknown, value: T) => void) => unknown,
    timeoutMs: number
  ): Promise<T> {
    return withTimeout(
      new Promise<T>((resolve, reject) => {
        let settled = false;
        const done = (error: unknown, value: T) => {
          if (settled) return;
          settled = true;
          if (error) {
            reject(error);
            return;
          }
          resolve(value);
        };

        try {
          const directResult = invoker(done);
          if (isThenable(directResult)) {
            void Promise.resolve(directResult)
              .then((value) => done(null, value as T))
              .catch((error) => done(error, undefined as T));
          } else if (directResult !== undefined && directResult !== null) {
            done(null, directResult as T);
          }
        } catch (error) {
          done(error, undefined as T);
        }
      }),
      timeoutMs
    );
  }

  async getItem(key: string): Promise<string | null> {
    const deviceStorage = await this.getDeviceStorage();
    const getter = deviceStorage.getItem.bind(deviceStorage) as MaxWebApp['DeviceStorage']['getItem'];

    try {
      const value = await this.callBridge<string | null>((done) => {
        return getter(key, (error, callbackValue) => done(error, callbackValue ?? null));
      }, BRIDGE_READ_TIMEOUT_MS);
      return value ?? null;
    } catch {
      const fallback = getter(key);
      if (typeof fallback === 'string' || fallback === null) {
        return fallback;
      }
      if (isThenable(fallback)) {
        return (await withTimeout(Promise.resolve(fallback as PromiseLike<string | null>), BRIDGE_READ_TIMEOUT_MS)) ?? null;
      }
      return null;
    }
  }

  private async mutate(
    operation: 'setItem' | 'removeItem' | 'clear',
    key?: string,
    value?: string
  ): Promise<void> {
    const deviceStorage = await this.getDeviceStorage();

    const invokeWithCallback = (callback: (error: unknown, success?: boolean) => void): unknown => {
      if (operation === 'setItem') {
        return deviceStorage.setItem(key!, value!, callback);
      }
      if (operation === 'removeItem') {
        return deviceStorage.removeItem(key!, callback);
      }
      return deviceStorage.clear(callback);
    };

    try {
      await this.callBridge<boolean>((done) => {
        return invokeWithCallback((error, success) => done(error, success ?? true));
      }, BRIDGE_MUTATION_TIMEOUT_MS);
      return;
    } catch (error) {
      console.warn(`[MaxDeviceStorageProvider] ${operation} callback/promise ack failed, fallback call`, error);
    }

    let fallbackResult: unknown;
    if (operation === 'setItem') {
      fallbackResult = deviceStorage.setItem(key!, value!);
    } else if (operation === 'removeItem') {
      fallbackResult = deviceStorage.removeItem(key!);
    } else {
      fallbackResult = deviceStorage.clear();
    }

    if (isThenable(fallbackResult)) {
      await withTimeout(Promise.resolve(fallbackResult), BRIDGE_MUTATION_TIMEOUT_MS);
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    await this.mutate('setItem', key, value);
  }

  async removeItem(key: string): Promise<void> {
    await this.mutate('removeItem', key);
  }

  async clear(): Promise<void> {
    await this.mutate('clear');
  }
}
