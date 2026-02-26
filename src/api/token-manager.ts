import { storageManager } from '../utils/storage-manager';

const ACCESS_TOKEN_KEY = 'max_app_access_token';
const REFRESH_TOKEN_KEY = 'max_app_refresh_token';

let accessTokenCache: string | undefined;
let refreshTokenCache: string | undefined;

export const getAccessToken = async (): Promise<string | null> => {
  if (accessTokenCache) {
    return accessTokenCache;
  }

  const token = await storageManager.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    accessTokenCache = token;
  }
  return token;
};

export const setAccessToken = async (token: string): Promise<void> => {
  accessTokenCache = token;
  await storageManager.setItem(ACCESS_TOKEN_KEY, token);
};

export const getRefreshToken = async (): Promise<string | null> => {
  if (refreshTokenCache) {
    return refreshTokenCache;
  }

  const token = await storageManager.getItem(REFRESH_TOKEN_KEY);
  if (token) {
    refreshTokenCache = token;
  }
  return token;
};

export const setRefreshToken = async (token: string): Promise<void> => {
  refreshTokenCache = token;
  await storageManager.setItem(REFRESH_TOKEN_KEY, token);
};

export const clearTokens = async (): Promise<void> => {
  accessTokenCache = undefined;
  refreshTokenCache = undefined;
  await storageManager.removeItem(ACCESS_TOKEN_KEY);
  await storageManager.removeItem(REFRESH_TOKEN_KEY);
};
