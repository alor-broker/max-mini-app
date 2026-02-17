import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Typography, Panel, Flex } from '@maxhub/max-ui';
import { useTranslation } from 'react-i18next';

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
          navigate('/', { replace: true });
        })
        .catch((err) => {
          console.error('SSO Login failed', err);
          // navigate('/auth/unlock'); // Un-comment to redirect back on failure
        });
    } else {
      console.error('No refresh token found');
      navigate('/auth/unlock');
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
