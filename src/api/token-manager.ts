import { storageManager } from '../utils/storage-manager';

const ACCESS_TOKEN_KEY = 'max_app_access_token';
const REFRESH_TOKEN_KEY = 'max_app_refresh_token';

export const getAccessToken = async (): Promise<string | null> => {
  return await storageManager.getItem(ACCESS_TOKEN_KEY);
};

export const setAccessToken = async (token: string): Promise<void> => {
  await storageManager.setItem(ACCESS_TOKEN_KEY, token);
};

export const getRefreshToken = async (): Promise<string | null> => {
  return await storageManager.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = async (token: string): Promise<void> => {
  await storageManager.setItem(REFRESH_TOKEN_KEY, token);
};

export const clearTokens = async (): Promise<void> => {
  await storageManager.removeItem(ACCESS_TOKEN_KEY);
  await storageManager.removeItem(REFRESH_TOKEN_KEY);
};
