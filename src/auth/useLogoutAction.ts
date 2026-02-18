import { useCallback } from 'react';
import { useAuth } from './AuthContext';

type BeforeLogout = (() => Promise<void>) | (() => void) | undefined;

export const useLogoutAction = (beforeLogout?: BeforeLogout) => {
  const { logout, isLoggingOut } = useAuth();

  const runLogout = useCallback(async () => {
    if (isLoggingOut) return;

    if (beforeLogout) {
      await beforeLogout();
    }

    await logout();
  }, [beforeLogout, isLoggingOut, logout]);

  return { runLogout, isLoggingOut };
};
