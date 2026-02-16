import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, User } from '../api/services';
import { getRefreshToken, setRefreshToken, setAccessToken, clearTokens } from '../api/token-manager';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  handleSsoCallback: (refreshToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = getRefreshToken();
      if (token) {
        try {
          // Try to exchange refresh token for new access token
          const result = await AuthService.refreshToken(token);
          if (result) {
            setAccessToken(result.jwt);
            setUser(result.user);
            setIsAuthenticated(true);
          } else {
            // Token invalid
            clearTokens();
          }
        } catch (error) {
          console.error("Failed to restore session:", error);
          clearTokens();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = () => {
    AuthService.redirectToSso();
  };

  const handleSsoCallback = async (refreshToken: string) => {
    setIsLoading(true);
    try {
      const result = await AuthService.refreshToken(refreshToken);
      if (result) {
        setRefreshToken(refreshToken);
        setAccessToken(result.jwt);
        setUser(result.user);
        setIsAuthenticated(true);
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
    AuthService.redirectToSso(true);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, handleSsoCallback, logout }}>
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
