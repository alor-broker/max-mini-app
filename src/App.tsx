import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireAuth } from './auth/RequireAuth';
import { HomePage } from './pages/home/HomePage';
import { UnlockPage } from './pages/auth/UnlockPage';
import { SsoCallbackPage } from './pages/auth/SsoCallbackPage';
import { CreateOrderPage } from './pages/create-order/CreateOrderPage';
import { OrderDetailPage } from './pages/order-detail/OrderDetailPage';
import { TradeDetailPage } from './pages/trade-detail/TradeDetailPage';
import { MaxUI } from '@maxhub/max-ui';
import '@maxhub/max-ui/dist/styles.css';

import { NotificationProvider } from './components/NotificationContext';

function App() {
  return (
    <NotificationProvider>
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
            <Route
              path="/order/new"
              element={
                <RequireAuth>
                  <CreateOrderPage />
                </RequireAuth>
              }
            />
            <Route
              path="/order/detail"
              element={
                <RequireAuth>
                  <OrderDetailPage />
                </RequireAuth>
              }
            />
            <Route
              path="/trade/detail"
              element={
                <RequireAuth>
                  <TradeDetailPage />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  );
}

const Root = () => (
  <MaxUI>
    <App />
  </MaxUI>
)

export default Root;
