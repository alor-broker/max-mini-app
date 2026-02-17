import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Spinner, Flex } from '@maxhub/max-ui';

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, isLocked } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Flex align="center" justify="center" style={{ height: '100vh', width: '100%' }}>
        <Spinner />
      </Flex>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/sso" state={{ from: location }} replace />;
  }

  if (isLocked) {
    return <Navigate to="/auth/unlock" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
