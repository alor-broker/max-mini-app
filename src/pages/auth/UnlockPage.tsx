import React, { useState, useEffect, useCallback } from 'react';
import { Panel, Grid, Container, Flex, Typography, Button } from '@maxhub/max-ui';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useTranslation } from 'react-i18next';

// Constants
const PIN_LENGTH = 4;
const MAX_ATTEMPTS = 10;
const STORAGE_KEY_APP_PASSWORD = 'max_app_password';

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
  backgroundColor: '#f5f5f5', // Light gray core for numbers
  color: '#000',
};

const ghostButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  backgroundColor: 'transparent',
  color: '#000',
};

export const UnlockPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { logout, unlock, isLocked, isAuthenticated, login } = useAuth();

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

  useEffect(() => {
    const savedPin = localStorage.getItem(STORAGE_KEY_APP_PASSWORD);

    if (!savedPin) {
      // Logic for when no password is set
      setStoredPin(null);
    } else {
      setStoredPin(savedPin);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // If we are unlocked (or was never locked) and loading is done
    if (!isLoading && !isLocked) {
      if (isAuthenticated) {
        navigate(redirectUrl, { replace: true });
      } else {
        // Not authenticated, trigger login flow
        login();
      }
    }
  }, [isLoading, isLocked, isAuthenticated, navigate, redirectUrl, login]);

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
        logout();
      }
      return newCount;
    });
  }, [vibrate, logout]);

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
        // Create mode: Set PIN, save, and then Unlock
        localStorage.setItem(STORAGE_KEY_APP_PASSWORD, pin);
        handleSuccess();
      }
    } else {
      if (error) setError(false);
    }
  }, [pin, storedPin, handleSuccess, handleFailure, error]);

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
          <Typography.Body>Loading...</Typography.Body>
        </Flex>
      </Panel>
    );
  }

  return (
    <Panel>
      <Container>
        <Flex direction="column" align="center" justify="center" style={{ minHeight: '100vh', padding: '20px' }}>

          <Typography.Headline style={{ marginBottom: '8px' }}>
            {storedPin ? t('Enter Passcode', 'Enter Passcode') : t('Create Passcode', 'Create Passcode')}
          </Typography.Headline>

          {error && (
            <Typography.Body style={{ color: '#ff4d4f', marginBottom: '16px' }}>
              {t('Invalid Password', 'Invalid Password')} ({attemptsCount})
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

            {/* Empty placeholder to align 0 */}
            <div style={{ width: '64px', height: '64px', margin: '8px' }} />

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
              {t('Cancel', 'Cancel')}
            </Button>
          )}

          {!isCancelable && (
            <Button
              style={{ marginTop: '16px', ...ghostButtonStyle, width: 'auto', padding: '0 16px', fontSize: '16px', color: '#1890ff' }}
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY_APP_PASSWORD);
                logout();
              }}
            >
              {t('Logout / Reset', 'Logout / Reset')}
            </Button>
          )}

        </Flex>
      </Container>
    </Panel>
  );
};
