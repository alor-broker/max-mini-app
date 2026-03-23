import React from 'react';
import { Flex, Typography } from '@maxhub/max-ui';
import { useTranslation } from 'react-i18next';
import { ClientPortfolio } from '../../api/services';
import { useModal } from '../../components/ModalContext';

interface NewOrderButtonProps {
  portfolio?: ClientPortfolio | null;
}

export const NewOrderButton: React.FC<NewOrderButtonProps> = ({ portfolio }) => {
  const { t } = useTranslation();
  const { openModal } = useModal();

  return (
    <div onClick={() => openModal('createOrder', { portfolio: portfolio ?? undefined })} style={{ cursor: 'pointer', textAlign: 'center' }}>
      <Flex direction="column" align="center" gap={8}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          transition: 'transform 0.2s',
        }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={{ fontSize: '24px', color: 'white', lineHeight: 1 }}>+</span>
        </div>
        <Typography.Label style={{ color: 'white', fontSize: '12px' }}>{t('home.new_order')}</Typography.Label>
      </Flex>
    </div>
  );
};
