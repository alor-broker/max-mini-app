import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Spinner, Flex } from '@maxhub/max-ui';
import { DebugClearStorageButton } from '../components/DebugClearStorageButton';

const AUTO_LOGIN_DELAY_MS = 2000;

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, isLocked, login } = useAuth();
  const location = useLocation();
  const loginStartedRef = useRef(false);
  const loginTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !loginStartedRef.current && loginTimerRef.current === null) {
      loginTimerRef.current = window.setTimeout(() => {
        loginStartedRef.current = true;
        loginTimerRef.current = null;
        login();
      }, AUTO_LOGIN_DELAY_MS);
    }

    return () => {
      if (loginTimerRef.current !== null) {
        window.clearTimeout(loginTimerRef.current);
        loginTimerRef.current = null;
      }
      if (!isAuthenticated) {
        loginStartedRef.current = false;
      }
    };
  }, [isLoading, isAuthenticated, login]);

  useEffect(() => {
    if (isAuthenticated) {
      loginStartedRef.current = false;
    }
  }, [isAuthenticated]);

  const renderLoadingWithReset = () => (
    <Flex direction="column" align="center" justify="center" style={{ height: '100vh', width: '100%', gap: '16px' }}>
      <Spinner />
      <DebugClearStorageButton />
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
