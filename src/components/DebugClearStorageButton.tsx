import React, { useState } from 'react';
import { Button } from '@maxhub/max-ui';
import { storageManager } from '../utils/storage-manager';
import { useAuth } from '../auth/AuthContext';
import { API_CONFIG } from '../api/config';

interface DebugClearStorageButtonProps {
  idleLabel?: string;
  busyLabel?: string;
}

export const DebugClearStorageButton: React.FC<DebugClearStorageButtonProps> = ({
  idleLabel = 'Clear Storage & Logout',
  busyLabel = 'Clearing...'
}) => {
  const { logout } = useAuth();
  const [isClearing, setIsClearing] = useState(false);

  const clearStorageAndLogout = async () => {
    if (isClearing) return;
    setIsClearing(true);
    try {
      await storageManager.clear();
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('[DebugClearStorageButton] Failed to clear storage', e);
    } finally {
      await logout();
    }
  };

  const urlEntries = [
    ['apiUrl', API_CONFIG.apiUrl],
    ['userDataUrl', API_CONFIG.userDataUrl],
    ['historyApiUrl', API_CONFIG.historyApiUrl],
    ['ssoUrl', API_CONFIG.ssoUrl],
    ['superAppUrl', API_CONFIG.superAppUrl],
  ] as const;

  const getHost = (rawUrl: string) => {
    try {
      return new URL(rawUrl).host;
    } catch {
      return rawUrl;
    }
  };

  const fullUrlsTitle = urlEntries.map(([key, value]) => `${key}: ${value}`).join('\n');
  const hostSummary = urlEntries.map(([, value]) => getHost(value)).join(' | ');

  return (
    <Button onClick={clearStorageAndLogout} disabled={isClearing} title={fullUrlsTitle}>
      <span style={{ display: 'block' }}>
        {isClearing ? busyLabel : idleLabel}
      </span>
      <span
        style={{
          display: 'block',
          fontSize: '10px',
          opacity: 0.85,
          maxWidth: '260px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {hostSummary}
      </span>
    </Button>
  );
};
