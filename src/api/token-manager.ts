import { storageManager } from '../utils/storage-manager';

const ACCESS_TOKEN_KEY = 'max_app_access_token';
const REFRESH_TOKEN_KEY = 'max_app_refresh_token';

export const getAccessToken = (): string | null => {
  return storageManager.getItem(ACCESS_TOKEN_KEY);
};

export const setAccessToken = (token: string) => {
  storageManager.setItem(ACCESS_TOKEN_KEY, token);
};

export const getRefreshToken = (): string | null => {
  return storageManager.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string) => {
  storageManager.setItem(REFRESH_TOKEN_KEY, token);
};

export const clearTokens = () => {
  storageManager.removeItem(ACCESS_TOKEN_KEY);
  storageManager.removeItem(REFRESH_TOKEN_KEY);
};
