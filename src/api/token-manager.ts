import { storageManager } from '../utils/storage-manager';

const ACCESS_TOKEN_KEY = 'max_app_access_token';
const REFRESH_TOKEN_KEY = 'max_app_refresh_token';

let accessTokenCache: string | null | undefined;
let refreshTokenCache: string | null | undefined;

export const getAccessToken = async (): Promise<string | null> => {
  if (accessTokenCache !== undefined) {
    return accessTokenCache;
  }

  accessTokenCache = await storageManager.getItem(ACCESS_TOKEN_KEY);
  return accessTokenCache;
};

export const setAccessToken = async (token: string): Promise<void> => {
  accessTokenCache = token;
  await storageManager.setItem(ACCESS_TOKEN_KEY, token);
};

export const getRefreshToken = async (): Promise<string | null> => {
  if (refreshTokenCache !== undefined) {
    return refreshTokenCache;
  }

  refreshTokenCache = await storageManager.getItem(REFRESH_TOKEN_KEY);
  return refreshTokenCache;
};

export const setRefreshToken = async (token: string): Promise<void> => {
  refreshTokenCache = token;
  await storageManager.setItem(REFRESH_TOKEN_KEY, token);
};

export const clearTokens = async (): Promise<void> => {
  accessTokenCache = null;
  refreshTokenCache = null;
  await storageManager.removeItem(ACCESS_TOKEN_KEY);
  await storageManager.removeItem(REFRESH_TOKEN_KEY);
};
