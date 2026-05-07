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
import { OperationsHistoryPage } from './pages/operations-history/OperationsHistoryPage';
import { MaxBotLicensePage } from './pages/legal/MaxBotLicensePage';
import { CompanyDetailsPage } from './pages/legal/CompanyDetailsPage';
import { storageManager } from './utils/storage-manager';
import { BrowserStorageProvider } from './utils/storage/BrowserStorageProvider';
import { MaxDeviceStorageProvider } from './utils/storage/MaxDeviceStorageProvider';
import { isLikelyMaxRuntime } from './utils/storage/max-webapp';
import { MaxUI } from '@maxhub/max-ui';
import '@maxhub/max-ui/dist/styles.css';

import { NotificationProvider } from './components/NotificationContext';
import { ModalProvider, useModal } from './components/ModalContext';
import { ModalLayout } from './components/ModalLayout';

const configuredStorageProvider = isLikelyMaxRuntime()
  ? new MaxDeviceStorageProvider()
  : new BrowserStorageProvider();
storageManager.setProvider(configuredStorageProvider);

/** Renders the modal stack managed by ModalContext */
function ModalStack() {
  const { modalStack, closeModal } = useModal();

  if (modalStack.length === 0) return null;

  // Render each stacked modal; only the top-most is interactive,
  // but we keep all in DOM so underlying state isn't lost.
  return (
    <>
      {modalStack.map((entry, index) => {
        const isTop = index === modalStack.length - 1;

        let content: React.ReactNode = null;
        if (entry.type === 'createOrder') {
          const d = entry.data as { symbol?: string; portfolio?: any };
          content = <CreateOrderPage symbol={d.symbol} portfolio={d.portfolio} />;
        } else if (entry.type === 'orderDetail') {
          const d = entry.data as { order: any };
          content = <OrderDetailPage order={d.order} />;
        } else if (entry.type === 'tradeDetail') {
          const d = entry.data as { trade: any };
          content = <TradeDetailPage trade={d.trade} />;
        } else if (entry.type === 'operationsHistory') {
          const d = entry.data as { portfolio?: any };
          content = <OperationsHistoryPage portfolio={d.portfolio} />;
        }

        return (
          <div
            key={`${entry.type}-${index}`}
            style={{
              // Hide non-top modals visually but keep them mounted
              visibility: isTop ? 'visible' : 'hidden',
              position: isTop ? undefined : 'fixed',
              zIndex: isTop ? undefined : -1,
            }}
          >
            <ModalLayout onClose={closeModal}>
              {content}
            </ModalLayout>
          </div>
        );
      })}
    </>
  );
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/auth/unlock" element={<UnlockPage />} />
        <Route path="/auth" element={<SsoCallbackPage />} />
        <Route path="/auth/sso" element={<SsoCallbackPage />} />
        <Route path="/legal/max-bot-license" element={<MaxBotLicensePage />} />
        <Route path="/legal/company-details" element={<CompanyDetailsPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        {/* All other paths redirect to home — no more sub-routes for modals */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Modal stack rendered on top of the single-route app */}
      <ModalStack />
    </>
  );
}

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <ModalProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ModalProvider>
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
