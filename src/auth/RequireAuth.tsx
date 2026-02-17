import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, isLocked } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>; // Replace with a proper loader component later
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/sso" state={{ from: location }} replace />;
  }

  if (isLocked) {
    return <Navigate to="/auth/unlock" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
