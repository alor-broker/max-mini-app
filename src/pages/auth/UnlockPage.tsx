import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Panel, Grid, Container, Flex, Typography, Button, Spinner } from '@maxhub/max-ui';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { storageManager } from '../../utils/storage-manager';
import { biometricManager } from '../../utils/biometric-manager';
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

const biometricButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  backgroundColor: 'transparent',
  color: '#1890ff',
  fontSize: '28px',
};

export const UnlockPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { unlock, isLocked, isAuthenticated, login, isLoading: isAuthLoading } = useAuth();
  const { runLogout, isLoggingOut } = useLogoutAction(async () => {
    await storageManager.removeItem(STORAGE_KEY_APP_PASSWORD);
    await biometricManager.disable();
  });

  const [pin, setPin] = useState('');
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [attemptsCount, setAttemptsCount] = useState(MAX_ATTEMPTS);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Biometric state
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnrolled, setBiometricEnrolled] = useState(false);
  const biometricAttemptedRef = useRef(false);

  const isCancelable = searchParams.get('isCancellable') === 'true';
  const stateFrom = (location.state as any)?.from?.pathname;
  const redirectUrl = searchParams.get('redirectUrl') || stateFrom || '/';

  // Simple vibration for feedback if supported by browser
  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  // Initialize: load stored PIN and check biometric availability
  useEffect(() => {
    const init = async () => {
      try {
        const savedPin = await storageManager.getItem(STORAGE_KEY_APP_PASSWORD);

        if (!savedPin) {
          setStoredPin(null);
        } else {
          setStoredPin(savedPin);
        }

        // Check biometric availability and enrollment
        const bioAvailable = await biometricManager.isAvailable();
        setBiometricAvailable(bioAvailable);

        if (bioAvailable) {
          const bioEnrolled = await biometricManager.isEnrolled();
          setBiometricEnrolled(bioEnrolled);
        }
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
    if (shouldAutoContinue) {
      sessionStorage.removeItem(AUTO_CONTINUE_UNLOCK_KEY);
      if (isLocked) {
        unlock();
      }
      navigate(redirectUrl, { replace: false });
      return;
    }

    // If we are unlocked (or was never locked), continue normally
    if (!isLocked) {
      navigate(redirectUrl, { replace: true });
    }
  }, [isLoading, isAuthLoading, isLoggingOut, isLocked, isAuthenticated, navigate, redirectUrl, login, unlock]);

  const handleSuccess = useCallback(() => {
    vibrate(50);
    unlock();
    // Navigation is handled by the useEffect above when isLocked becomes false
  }, [vibrate, unlock]);

  const handleFailure = useCallback(() => {
    vibrate([50, 50, 50]);
    setError(true);
    setPin('');
    setAttemptsCount(prev => {
      const newCount = prev - 1;
      if (newCount <= 0) {
        void runLogout();
      }
      return newCount;
    });
  }, [vibrate, runLogout]);

  // Auto-trigger biometric authentication when the page loads (unlock mode only)
  useEffect(() => {
    if (
      isLoading ||
      isAuthLoading ||
      !isAuthenticated ||
      !isLocked ||
      !storedPin ||               // Only in unlock mode (PIN already exists)
      !biometricEnrolled ||       // Must have enrolled biometrics
      biometricAttemptedRef.current // Only try once automatically
    ) {
      return;
    }

    biometricAttemptedRef.current = true;
    triggerBiometricAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthLoading, isAuthenticated, isLocked, storedPin, biometricEnrolled]);

  /**
   * Triggers biometric authentication.
   * On success, unlocks the app. On failure, falls back to PIN.
   */
  const triggerBiometricAuth = async () => {
    try {
      const success = await biometricManager.authenticate();
      if (success) {
        handleSuccess();
      }
      // If not successful, user falls back to PIN entry (no error shown)
    } catch (error) {
      console.warn('[UnlockPage] Biometric auth error:', error);
      // Silent fallback to PIN
    }
  };

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
        // Create mode: Set PIN, save, and then enroll biometrics, then Unlock
        const save = async () => {
          await storageManager.setItem(STORAGE_KEY_APP_PASSWORD, pin);

          // Offer biometric enrollment if available
          if (biometricAvailable) {
            try {
              const enrolled = await biometricManager.enroll();
              if (enrolled) {
                setBiometricEnrolled(true);
              }
            } catch (e) {
              console.warn('[UnlockPage] Biometric enrollment skipped:', e);
            }
          }

          handleSuccess();
        }
        save();
      }
    } else {
      if (error) setError(false);
    }
  }, [pin, storedPin, handleSuccess, handleFailure, error, biometricAvailable]);

  const handleDigit = (digit: string) => {
    if (pin.length < PIN_LENGTH) {
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
        <Flex align="center" justify="center" style={{ height: '100vh' }}>
          <Typography.Body>{t('common.loading')}</Typography.Body>
        </Flex>
      </Panel>
    );
  }

  // In unlock mode, determine the title (biometric or PIN)
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

            {/* Bottom-left: biometric button if enrolled, empty placeholder otherwise */}
            {!isCreateMode && biometricEnrolled ? (
              <Button
                style={biometricButtonStyle}
                onClick={triggerBiometricAuth}
                title={t('auth.use_biometrics')}
              >
                {/* Fingerprint icon */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18.9 7a8 8 0 0 0-2.2-2.3" />
                  <path d="M3.9 14.1a8 8 0 0 1-.9-3.6 8 8 0 0 1 2.2-5.5" />
                  <path d="M8.7 3.6A8 8 0 0 1 12 3a7.9 7.9 0 0 1 5 1.8" />
                  <path d="M12 7a5 5 0 0 0-5 5c0 .9.2 1.7.5 2.5" />
                  <path d="M16.4 8.5A5 5 0 0 1 17 12" />
                  <path d="M12 7a5 5 0 0 1 5 5c0 2-1 3.5-2.5 4.5" />
                  <path d="M9 12a3 3 0 0 1 3-3" />
                  <path d="M15 12a3 3 0 0 1-3 3" />
                  <path d="M12 9a3 3 0 0 1 3 3c0 1.3-.8 2.4-2 2.8" />
                  <path d="M12 15v3" />
                  <path d="M10 18.5A6.5 6.5 0 0 1 7 12" />
                </svg>
              </Button>
            ) : (
              <div style={{ width: '64px', height: '64px', margin: '8px' }} />
            )}

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
