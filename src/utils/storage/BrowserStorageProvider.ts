import { StorageProvider } from '../storage-manager';

const TRACKED_KEYS_REGISTRY = '__max_app_storage_keys__';

/**
 * Browser-backed StorageProvider that scopes `clear()` to only keys
 * that were written through this provider, matching the behaviour of
 * MAX DeviceStorage.clear() which only removes bot-owned keys.
 */
export class BrowserStorageProvider implements StorageProvider {
  private getTrackedKeys(): Set<string> {
    try {
      const raw = localStorage.getItem(TRACKED_KEYS_REGISTRY);
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
      return new Set();
    }
  }

  private trackKey(key: string): void {
    const keys = this.getTrackedKeys();
    if (!keys.has(key)) {
      keys.add(key);
      localStorage.setItem(TRACKED_KEYS_REGISTRY, JSON.stringify(Array.from(keys)));
    }
  }

  private untrackKey(key: string): void {
    const keys = this.getTrackedKeys();
    if (keys.delete(key)) {
      localStorage.setItem(TRACKED_KEYS_REGISTRY, JSON.stringify(Array.from(keys)));
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
    this.trackKey(key);
  }

  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
    this.untrackKey(key);
  }

  async clear(): Promise<void> {
    const keys = this.getTrackedKeys();
    keys.forEach((key) => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem(TRACKED_KEYS_REGISTRY);
  }
}
