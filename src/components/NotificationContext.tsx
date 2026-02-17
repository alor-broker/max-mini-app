import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Flex, Typography } from '@maxhub/max-ui';

export type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, { id, type, message }]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none' // Click-through
      }}>
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`notification-item notification-${notification.type}`}
          >
            <Typography.Body style={{ fontWeight: 500 }}>{notification.message}</Typography.Body>
          </div>
        ))}
      </div>
      <style>{`
        .notification-item {
          padding: 12px 24px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          min-width: 300px;
          text-align: center;
          animation: fadeIn 0.3s ease-out;
          pointer-events: auto;
        }
        .notification-success {
          background: #4ade80;
          color: #000;
        }
        .notification-error {
          background: #ff4d4f;
          color: #fff;
        }
        /* Default/Info: Dark on Light, Light on Dark */
        .notification-info {
          background: #1f1f1f;
          color: #fff;
        }
        @media (prefers-color-scheme: dark) {
          .notification-info {
            background: #f0f0f0;
            color: #000;
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
