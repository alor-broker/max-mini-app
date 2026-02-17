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

import { useLocation } from 'react-router-dom';
import { ModalLayout } from './components/ModalLayout';

function AppRoutes() {
  const location = useLocation();
  const state = location.state as { background?: Location };
  const background = state && state.background;

  return (
    <>
      <Routes location={background || location}>
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

      {/* Show the modal when a `background` page is set */}
      {background && (
        <Routes>
          <Route path="/order/new" element={
            <RequireAuth>
              <ModalLayout onClose={() => window.history.back()}>
                <CreateOrderPage />
              </ModalLayout>
            </RequireAuth>
          } />
          <Route path="/order/detail" element={
            <RequireAuth>
              <ModalLayout onClose={() => window.history.back()}>
                <OrderDetailPage />
              </ModalLayout>
            </RequireAuth>
          } />
          <Route path="/trade/detail" element={
            <RequireAuth>
              <ModalLayout onClose={() => window.history.back()}>
                <TradeDetailPage />
              </ModalLayout>
            </RequireAuth>
          } />
        </Routes>
      )}
    </>
  );
}

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
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
