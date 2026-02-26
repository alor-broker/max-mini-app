export interface StorageProvider {
  setItem: (key: string, value: string) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

class StorageManager implements StorageProvider {
  private provider: StorageProvider | null = null;

  setProvider(provider: StorageProvider) {
    this.provider = provider;
  }

  private getProvider(): StorageProvider {
    if (!this.provider) {
      throw new Error('Storage provider is not configured');
    }
    return this.provider;
  }

  async setItem(key: string, value: string): Promise<void> {
    return this.getProvider().setItem(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return this.getProvider().getItem(key);
  }

  async removeItem(key: string): Promise<void> {
    return this.getProvider().removeItem(key);
  }

  async clear(): Promise<void> {
    return this.getProvider().clear();
  }
}

export const storageManager = new StorageManager();
