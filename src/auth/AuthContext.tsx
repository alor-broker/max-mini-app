import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, User } from '../api/services';
import { getRefreshToken, setRefreshToken, setAccessToken, clearTokens } from '../api/token-manager';
import { storageManager } from '../utils/storage-manager';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLocked: boolean;
  isLoggingOut: boolean;
  login: () => void;
  handleSsoCallback: (refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  unlock: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      const getRefreshTokenWithRetry = async (): Promise<string | null> => {
        const firstAttempt = await getRefreshToken();
        if (firstAttempt) {
          return firstAttempt;
        }

        // Bridge-backed storage can be late on some Android starts.
        await new Promise((resolve) => setTimeout(resolve, 300));
        return getRefreshToken();
      };

      try {
        const token = await getRefreshTokenWithRetry();
        if (token) {
          try {
            // Try to exchange refresh token for new access token
            const result = await AuthService.refreshToken(token);
            if (result) {
              await setAccessToken(result.jwt);
              setUser(result.user);
              setIsAuthenticated(true);
              // If we restored a session, we default to locked state
              setIsLocked(true);
            } else {
              // Token invalid
              await clearTokens();
            }
          } catch (error) {
            console.error("Failed to restore session:", error);
            await clearTokens();
          }
        }
      } catch (e) {
        console.error("Auth init failed", e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = () => {
    AuthService.redirectToSso();
  };

  const unlock = () => {
    setIsLocked(false);
  };

  const handleSsoCallback = async (refreshToken: string) => {
    setIsLoading(true);
    try {
      const result = await AuthService.refreshToken(refreshToken);
      if (result) {
        await setRefreshToken(refreshToken);
        await setAccessToken(result.jwt);
        setUser(result.user);
        setIsAuthenticated(true);

        // Check if PIN is set (with retries for MAX bridge cold-start delay).
        // If not, we must lock to force PIN creation.
        // If PIN is set, fresh login acts as an unlock.
        let hasPin = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
          const pin = await storageManager.getItem('max_app_password');
          if (pin) { hasPin = true; break; }
          if (attempt < 3) await new Promise((r) => setTimeout(r, 300));
        }
        setIsLocked(!hasPin);
      } else {
        throw new Error("Failed to verify token");
      }
    } catch (error) {
      console.error("SSO Callback failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    setIsLoading(true);
    setUser(null);
    setIsAuthenticated(false);
    setIsLocked(false);

    try {
      await clearTokens();
      await storageManager.removeItem('max_app_password');
    } catch (error) {
      console.error("Failed to clear auth data during logout:", error);
    } finally {
      AuthService.redirectToSso(true);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, isLocked, isLoggingOut, login, handleSsoCallback, logout, unlock }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
