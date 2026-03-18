import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Typography, Panel, Flex } from '@maxhub/max-ui';
import { useTranslation } from 'react-i18next';
import { DebugClearStorageButton } from '../../components/DebugClearStorageButton';

const AUTO_CONTINUE_UNLOCK_KEY = 'MAX_APP_AUTO_CONTINUE_UNLOCK_ONCE';

export const SsoCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { handleSsoCallback } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const readRefreshToken = () => {
    const queryCandidates = [
      searchParams.get('refreshToken'),
      searchParams.get('refresh_token'),
      searchParams.get('token'),
      searchParams.get('jwt'),
    ];
    const fromQuery = queryCandidates.find((value) => Boolean(value));
    if (fromQuery) {
      return fromQuery;
    }

    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash;
      const hashParams = new URLSearchParams(hash);
      const hashCandidates = [
        hashParams.get('refreshToken'),
        hashParams.get('refresh_token'),
        hashParams.get('token'),
        hashParams.get('jwt'),
      ];
      const fromHash = hashCandidates.find((value) => Boolean(value));
      if (fromHash) {
        return fromHash;
      }
    }

    return null;
  };

  useEffect(() => {
    const refreshToken = readRefreshToken();

    if (refreshToken) {
      handleSsoCallback(refreshToken)
        .then(() => {
          sessionStorage.setItem(AUTO_CONTINUE_UNLOCK_KEY, '1');
          navigate('/auth/unlock?redirectUrl=/', { replace: true });
        })
        .catch((err) => {
          console.error('SSO Login failed', err);
          navigate('/', { replace: true });
        });
    } else {
      console.error('No refresh token found');
      navigate('/', { replace: true });
    }
  }, [searchParams, handleSsoCallback, navigate]);

  return (
    <Panel>
      <Flex direction="column" align="center" justify="center" style={{ height: '100vh', gap: '16px' }}>
        <Typography.Headline>{t('auth.authenticating')}</Typography.Headline>
        {/* <DebugClearStorageButton /> */}
      </Flex>
    </Panel>
  );
};
