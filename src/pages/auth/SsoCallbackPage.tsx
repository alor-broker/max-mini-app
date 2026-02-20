import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Typography, Panel, Flex } from '@maxhub/max-ui';
import { useTranslation } from 'react-i18next';

const AUTO_CONTINUE_UNLOCK_KEY = 'MAX_APP_AUTO_CONTINUE_UNLOCK_ONCE';

export const SsoCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { handleSsoCallback } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const refreshToken = searchParams.get('refreshToken');

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
      <Flex align="center" justify="center" style={{ height: '100vh' }}>
        <Typography.Headline>{t('auth.authenticating')}</Typography.Headline>
      </Flex>
    </Panel>
  );
};
