import React, { useEffect, useState } from 'react';
import { Button } from '@maxhub/max-ui';
import { storageManager } from '../utils/storage-manager';
import { useAuth } from '../auth/AuthContext';
import { API_CONFIG } from '../api/config';

interface DebugClearStorageButtonProps {
  idleLabel?: string;
  busyLabel?: string;
}

type KeyReport = {
  key: string;
  storage: string;
  local: string;
  session: string;
};

const REQUIRED_KEYS = [
  'max_app_refresh_token',
  'max_app_access_token',
  'max_app_password',
  'MAX_APP_SELECTED_PORTFOLIO',
  'MAX_APP_AUTO_CONTINUE_UNLOCK_ONCE',
] as const;

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return 'missing';

  if (typeof value === 'string') {
    if (value.length <= 10) return `present (${value})`;
    return `present (${value.slice(0, 6)}... len=${value.length})`;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return `present (${String(value)})`;
  }

  if (typeof value === 'object') {
    const objectValue = value as { value?: unknown };
    if (typeof objectValue.value === 'string') {
      const v = objectValue.value;
      if (v.length <= 10) return `present (obj.value=${v})`;
      return `present (obj.value=${v.slice(0, 6)}... len=${v.length})`;
    }
    return `present (type=object keys=${Object.keys(objectValue).join(',') || 'none'})`;
  }

  return `present (type=${typeof value})`;
};

export const DebugClearStorageButton: React.FC<DebugClearStorageButtonProps> = ({
  idleLabel = 'Clear Storage & Logout',
  busyLabel = 'Clearing...'
}) => {
  const { logout } = useAuth();
  const [isClearing, setIsClearing] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [reportLines, setReportLines] = useState<string[]>(['Inspecting required keys...']);

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

  const inspectRequiredKeys = async () => {
    if (isInspecting) return;
    setIsInspecting(true);
    try {
      const reports = await Promise.all(
        REQUIRED_KEYS.map(async (key): Promise<KeyReport> => {
          const [storageValue, localValue, sessionValue] = await Promise.all([
            storageManager.getItem(key),
            Promise.resolve(localStorage.getItem(key)),
            Promise.resolve(sessionStorage.getItem(key)),
          ]);

          return {
            key,
            storage: formatValue(storageValue),
            local: formatValue(localValue),
            session: formatValue(sessionValue),
          };
        })
      );

      const lines = reports.flatMap((r) => [
        `${r.key}`,
        `  storage: ${r.storage}`,
        `  local: ${r.local}`,
        `  session: ${r.session}`,
      ]);
      setReportLines(lines);
    } catch (e) {
      setReportLines([`inspect error: ${String(e)}`]);
    } finally {
      setIsInspecting(false);
    }
  };

  useEffect(() => {
    void inspectRequiredKeys();
  }, []);

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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        maxWidth: '320px'
      }}
      title={fullUrlsTitle}
    >
      <Button onClick={clearStorageAndLogout} disabled={isClearing}>
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

      <Button onClick={() => { void inspectRequiredKeys(); }} disabled={isInspecting}>
        {isInspecting ? 'Inspecting...' : 'Inspect Required Keys'}
      </Button>

      <span
        style={{
          display: 'block',
          fontSize: '10px',
          color: 'var(--text-secondary)',
          background: 'var(--background-surface-secondary)',
          borderRadius: '8px',
          padding: '6px 8px',
          lineHeight: 1.3
        }}
      >
        {reportLines.map((line, idx) => (
          <React.Fragment key={`${line}-${idx}`}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </span>
    </div>
  );
};
