import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Spinner, Flex } from '@maxhub/max-ui';

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, isLocked, login } = useAuth();
  const location = useLocation();
  const loginStartedRef = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !loginStartedRef.current) {
      loginStartedRef.current = true;
      login();
    }
  }, [isLoading, isAuthenticated, login]);

  if (isLoading) {
    return (
      <Flex align="center" justify="center" style={{ height: '100vh', width: '100%' }}>
        <Spinner />
      </Flex>
    );
  }

  if (!isAuthenticated) {
    return (
      <Flex align="center" justify="center" style={{ height: '100vh', width: '100%' }}>
        <Spinner />
      </Flex>
    );
  }

  if (isLocked) {
    return <Navigate to="/auth/unlock" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
