import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Spinner, Flex, Button } from '@maxhub/max-ui';
import { storageManager } from '../utils/storage-manager';

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, isLocked, login, logout } = useAuth();
  const location = useLocation();
  const loginStartedRef = useRef(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !loginStartedRef.current) {
      loginStartedRef.current = true;
      login();
    }
  }, [isLoading, isAuthenticated, login]);

  const clearStorageAndReload = async () => {
    if (isClearing) return;
    setIsClearing(true);
    try {
      await storageManager.clear();
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('[RequireAuth] Failed to clear storage', e);
    } finally {
      await logout();
    }
  };

  const renderLoadingWithReset = () => (
    <Flex direction="column" align="center" justify="center" style={{ height: '100vh', width: '100%', gap: '16px' }}>
      <Spinner />
      <Button onClick={clearStorageAndReload} disabled={isClearing}>
        {isClearing ? 'Clearing...' : 'Clear Storage & Logout'}
      </Button>
    </Flex>
  );

  if (isLoading) {
    return renderLoadingWithReset();
  }

  if (!isAuthenticated) {
    return renderLoadingWithReset();
  }

  if (isLocked) {
    return <Navigate to="/auth/unlock" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
