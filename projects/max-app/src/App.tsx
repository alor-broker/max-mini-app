import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireAuth } from './auth/RequireAuth';
import { HomePage } from './pages/home/HomePage';
import { UnlockPage } from './pages/auth/UnlockPage';
import { SsoCallbackPage } from './pages/auth/SsoCallbackPage';
import { MaxUI } from '@maxhub/max-ui';
import '@maxhub/max-ui/dist/styles.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth/unlock" element={<UnlockPage />} />
          <Route path="/auth/sso" element={<SsoCallbackPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <HomePage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

const Root = () => (
  <MaxUI>
    <App />
  </MaxUI>
)

export default Root;
