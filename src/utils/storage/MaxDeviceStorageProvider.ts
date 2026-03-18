import { StorageProvider } from '../storage-manager';
import { MaxWebApp, MaxDeviceStorage } from './max-webapp';

const BRIDGE_READ_TIMEOUT_MS = 1500;
const BRIDGE_MUTATION_TIMEOUT_MS = 2500;
const BRIDGE_READY_WAIT_MS = 3000;
const BRIDGE_READY_POLL_MS = 50;
const BRIDGE_READ_RETRIES = 3;
const BRIDGE_MUTATION_RETRIES = 2;
const BRIDGE_RETRY_DELAY_MS = 250;

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

const sleep = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const stringifyError = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

const isRetryableBridgeError = (error: unknown): boolean => {
  const text = stringifyError(error).toLowerCase();
  return (
    text.includes('timeout') ||
    text.includes('transport') ||
    text.includes('not available') ||
    text.includes('temporar') ||
    text.includes('unsupportedevent')
  );
};

const normalizeBridgeValue = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const wrapped = value as { value?: unknown };
    if (typeof wrapped.value === 'string') {
      return wrapped.value;
    }
  }
  return null;
};

const isMissingKeyError = (error: unknown): boolean => {
  const text = stringifyError(error).toLowerCase();
  return (
    text.includes('device_storage_get_key.not_found') ||
    text.includes('get_key.not_found') ||
    text.includes('not_found')
  );
};

export class MaxDeviceStorageProvider implements StorageProvider {
  constructor(private readonly webAppRef: () => MaxWebApp | undefined = () => window.WebApp) {}

  private async getDeviceStorage(): Promise<MaxDeviceStorage> {
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

  async getItem(key: string): Promise<string | null> {
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= BRIDGE_READ_RETRIES; attempt++) {
      try {
        const deviceStorage = await this.getDeviceStorage();
        const value = await withTimeout(deviceStorage.getItem(key), BRIDGE_READ_TIMEOUT_MS);
        return normalizeBridgeValue(value);
      } catch (error) {
        lastError = error;

        if (isMissingKeyError(lastError)) {
          return null;
        }

        if (attempt < BRIDGE_READ_RETRIES && isRetryableBridgeError(lastError)) {
          await sleep(BRIDGE_RETRY_DELAY_MS);
          continue;
        }

        break;
      }
    }

    if (isMissingKeyError(lastError)) {
      return null;
    }

    throw lastError ?? new Error('DeviceStorage.getItem failed');
  }

  /**
   * Executes a write operation with retry logic.
   * All mutation operations (setItem, removeItem, clear) are idempotent
   * and safe to retry on transient bridge errors.
   */
  private async mutate(
    operation: 'setItem' | 'removeItem' | 'clear',
    key?: string,
    value?: string
  ): Promise<void> {
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= BRIDGE_MUTATION_RETRIES; attempt++) {
      try {
        const deviceStorage = await this.getDeviceStorage();

        let promise: Promise<unknown>;
        if (operation === 'setItem') {
          promise = deviceStorage.setItem(key!, value!);
        } else if (operation === 'removeItem') {
          promise = deviceStorage.removeItem(key!);
        } else {
          promise = deviceStorage.clear();
        }

        await withTimeout(promise, BRIDGE_MUTATION_TIMEOUT_MS);
        return;
      } catch (error) {
        lastError = error;

        if (attempt < BRIDGE_MUTATION_RETRIES && isRetryableBridgeError(error)) {
          console.warn(
            `[MaxDeviceStorageProvider] ${operation} attempt ${attempt} failed, retrying`,
            error
          );
          await sleep(BRIDGE_RETRY_DELAY_MS);
          continue;
        }

        break;
      }
    }

    throw lastError ?? new Error(`DeviceStorage.${operation} failed`);
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
