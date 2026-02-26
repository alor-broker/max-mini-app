import React, { useState } from 'react';
import { Button } from '@maxhub/max-ui';
import { storageManager } from '../utils/storage-manager';
import { useAuth } from '../auth/AuthContext';

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

  return (
    <Button onClick={clearStorageAndLogout} disabled={isClearing}>
      {isClearing ? busyLabel : idleLabel}
    </Button>
  );
};
