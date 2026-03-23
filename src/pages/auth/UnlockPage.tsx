import React, { useState, useEffect, useCallback } from 'react';
import { Panel, Grid, Container, Flex, Typography, Button, Spinner } from '@maxhub/max-ui';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { storageManager } from '../../utils/storage-manager';
import { useTranslation } from 'react-i18next';
import { useLogoutAction } from '../../auth/useLogoutAction';

// Constants
const PIN_LENGTH = 4;
const MAX_ATTEMPTS = 10;
const STORAGE_KEY_APP_PASSWORD = 'max_app_password';
const AUTO_CONTINUE_UNLOCK_KEY = 'MAX_APP_AUTO_CONTINUE_UNLOCK_ONCE';

// styles
const dotStyle = (filled: boolean, error: boolean) => ({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  backgroundColor: filled ? (error ? '#ff4d4f' : '#1890ff') : '#d9d9d9',
  transition: 'background-color 0.3s',
  border: error ? '1px solid #ff4d4f' : 'none',
});

const baseButtonStyle: React.CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '32px',
  fontSize: '24px',
  fontWeight: '500',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '8px',
  border: 'none',
  cursor: 'pointer',
};

const numberButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  backgroundColor: 'var(--background-accent-neutral-fade)',
  color: 'var(--text-primary)',
};

const ghostButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
};

export const UnlockPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { unlock, isLocked, isAuthenticated, login, isLoading: isAuthLoading } = useAuth();
  const { runLogout, isLoggingOut } = useLogoutAction(async () => {
    await storageManager.removeItem(STORAGE_KEY_APP_PASSWORD);
  });

  const [pin, setPin] = useState('');
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [attemptsCount, setAttemptsCount] = useState(MAX_ATTEMPTS);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isCancelable = searchParams.get('isCancellable') === 'true';
  const stateFrom = (location.state as any)?.from?.pathname;
  const redirectUrl = searchParams.get('redirectUrl') || stateFrom || '/';

  // Simple vibration for feedback if supported by browser
  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  // Initialize: load stored PIN (with retries for MAX bridge cold-start delay)
  useEffect(() => {
    const PIN_READ_RETRIES = 3;
    const PIN_READ_RETRY_DELAY_MS = 300;

    const init = async () => {
      try {
        let savedPin: string | null = null;

        for (let attempt = 1; attempt <= PIN_READ_RETRIES; attempt++) {
          savedPin = await storageManager.getItem(STORAGE_KEY_APP_PASSWORD);
          if (savedPin) break;

          // If this is not the last attempt, wait before retrying.
          // Bridge-backed storage on MAX may not have all keys ready
          // on cold start — the refresh token loads first, but other
          // keys can lag behind.
          if (attempt < PIN_READ_RETRIES) {
            await new Promise((r) => setTimeout(r, PIN_READ_RETRY_DELAY_MS));
          }
        }

        setStoredPin(savedPin);
      } catch (e) {
        console.error("Unlock init failed", e);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (isLoading || isAuthLoading || isLoggingOut) return;

    if (!isAuthenticated) {
      login();
      return;
    }

    const shouldAutoContinue = sessionStorage.getItem(AUTO_CONTINUE_UNLOCK_KEY) === '1';
    if (shouldAutoContinue && storedPin) {
      sessionStorage.removeItem(AUTO_CONTINUE_UNLOCK_KEY);
      if (isLocked) {
        unlock();
      }
      navigate(redirectUrl, { replace: false });
      return;
    }

    // Stale auto-continue should never bypass first-time PIN creation.
    if (shouldAutoContinue && !storedPin) {
      sessionStorage.removeItem(AUTO_CONTINUE_UNLOCK_KEY);
    }

    // If we are unlocked (or was never locked), continue normally
    if (!isLocked) {
      navigate(redirectUrl, { replace: true });
    }
  }, [isLoading, isAuthLoading, isLoggingOut, isLocked, isAuthenticated, navigate, redirectUrl, login, unlock, storedPin]);

  const handleSuccess = useCallback(() => {
    vibrate(50);
    unlock();
    // Navigation is handled by the useEffect above when isLocked becomes false
  }, [vibrate, unlock]);

  const handleFailure = useCallback(() => {
    vibrate([50, 50, 50]);
    setPin('');
    setError(true);
    setAttemptsCount(prev => {
      const newCount = prev - 1;
      if (newCount <= 0) {
        void runLogout();
      }
      return newCount;
    });
  }, [vibrate, runLogout]);

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      if (storedPin) {
        if (pin === storedPin) {
          handleSuccess();
        } else {
          // Delay to show the last dot filled before clearing
          setTimeout(() => {
            handleFailure();
          }, 100);
        }
      } else {
        // Create mode: Set PIN and unlock
        const save = async () => {
          await storageManager.setItem(STORAGE_KEY_APP_PASSWORD, pin);
          handleSuccess();
        }
        save();
      }
    }
  }, [pin, storedPin, handleSuccess, handleFailure]);

  const handleDigit = (digit: string) => {
    if (pin.length < PIN_LENGTH) {
      // Clear error message as soon as the user starts typing a new PIN
      if (error) setError(false);
      setPin(prev => prev + digit);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    if (error) setError(false);
  };

  const renderDots = () => {
    return (
      <Flex gap={16} justify="center" style={{ marginBottom: '32px' }}>
        {[...Array(PIN_LENGTH)].map((_, i) => (
          <div key={i} style={dotStyle(i < pin.length, error)} />
        ))}
      </Flex>
    );
  };

  if (isLoading) {
    return (
      <Panel>
        <Flex direction="column" align="center" justify="center" style={{ height: '100vh', gap: '16px' }}>
          <Spinner />
          <Typography.Body>{t('common.loading')}</Typography.Body>
        </Flex>
      </Panel>
    );
  }

  // Determine page title by mode
  const isCreateMode = !storedPin;
  const title = isCreateMode
    ? t('auth.create_passcode')
    : t('auth.enter_passcode');

  return (
    <Panel>
      <Container>
        <Flex direction="column" align="center" justify="center" style={{ minHeight: '100vh', padding: '20px' }}>

          <Typography.Headline style={{ marginBottom: '8px' }}>
            {title}
          </Typography.Headline>

          {error && (
            <Typography.Body style={{ color: '#ff4d4f', marginBottom: '16px' }}>
              {t('auth.invalid_password')} ({attemptsCount})
            </Typography.Body>
          )}
          {!error && <div style={{ height: '24px', marginBottom: '16px' }} />}

          {renderDots()}

          <Grid cols={3} gap={16} style={{ maxWidth: '300px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                style={numberButtonStyle}
                onClick={() => handleDigit(num.toString())}
              >
                {num}
              </Button>
            ))}

            <Button
              style={ghostButtonStyle}
              onClick={() => setPin('')}
            >
              C
            </Button>

            <Button
              key={0}
              style={numberButtonStyle}
              onClick={() => handleDigit('0')}
            >
              0
            </Button>

            <Button
              style={ghostButtonStyle}
              onClick={handleDelete}
            >
              ⌫
            </Button>
          </Grid>

          {isCancelable && (
            <Button
              style={{ marginTop: '32px', ...ghostButtonStyle, width: 'auto', padding: '0 16px' }}
              onClick={() => navigate(-1)}
            >
              {t('common.cancel')}
            </Button>
          )}

          {!isCancelable && (
            <Button
              style={{ marginTop: '16px', ...ghostButtonStyle, width: 'auto', padding: '0 16px', fontSize: '16px', color: '#1890ff' }}
              onClick={async () => {
                await runLogout();
              }}
            >
              {isLoggingOut ? <Spinner /> : t('auth.logout_reset')}
            </Button>
          )}

        </Flex>
      </Container>
    </Panel>
  );
};
