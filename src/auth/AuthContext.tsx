import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, User } from '../api/services';
import { getRefreshToken, setRefreshToken, setAccessToken, clearTokens } from '../api/token-manager';
import { storageManager } from '../utils/storage-manager';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLocked: boolean;
  login: () => void;
  handleSsoCallback: (refreshToken: string) => Promise<void>;
  logout: () => void;
  unlock: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await getRefreshToken();
        if (token) {
          try {
            // Try to exchange refresh token for new access token
            const result = await AuthService.refreshToken(token);
            if (result) {
              setAccessToken(result.jwt);
              setUser(result.user);
              setIsAuthenticated(true);
              // If we restored a session, we default to locked state
              setIsLocked(true);
              const hasPin = !!(await storageManager.getItem('max_app_password'));
              setIsLocked(!hasPin);
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

        // Check if PIN is set. If not, we must lock to force PIN creation.
        // If PIN is set, fresh login acts as an unlock.
        const hasPin = !!(await storageManager.getItem('max_app_password'));
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

  const logout = () => {
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    setIsLocked(false);
    AuthService.redirectToSso(true);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, isLocked, login, handleSsoCallback, logout, unlock }}>
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
