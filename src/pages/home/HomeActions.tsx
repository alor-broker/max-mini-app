import React, { useState } from 'react';
import { Flex, Typography, Button } from '@maxhub/max-ui';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClientPortfolio, OrdersService } from '../../api/services';
import { useNotification } from '../../components/NotificationContext';
import { IconNewOrder, IconCancelAll, IconOperationsHistory } from '../../components/Icons';


interface HomeActionsProps {
  portfolio?: ClientPortfolio | null;
  refreshTrigger?: () => void;
  activeOrdersCount?: number;
}

export const HomeActions: React.FC<HomeActionsProps> = ({ portfolio, refreshTrigger, activeOrdersCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const handleCancelAll = async () => {
    if (!portfolio) return;
    setIsCanceling(true);
    try {
      await OrdersService.cancelAllOrders(portfolio.portfolio, portfolio.exchange);
      showNotification(t('orderDetail.success_cancel_all'), 'success');
      if (refreshTrigger) refreshTrigger();
    } catch (e) {
      console.error(e);
      showNotification(t('common.error'), 'error');
    } finally {
      setIsCanceling(false);
      setShowConfirm(false);
    }
  };

  const ActionButton = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
    <div onClick={onClick} data-no-pull-refresh="true" style={{ cursor: 'pointer', textAlign: 'center', minWidth: '80px' }}>
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
          {icon}
        </div>
        <Typography.Label style={{ color: 'white', fontSize: '11px', textAlign: 'center' }}>{label}</Typography.Label>
      </Flex>
    </div>
  );

  return (
    <>
      <Flex gap={24} justify="center" style={{ width: '100%', marginTop: '16px' }}>
        <ActionButton
          icon={<IconNewOrder />}
          label={t('home.new_order')}
          onClick={() => navigate('/order/new', { state: { portfolio, background: location } })}
        />
        <ActionButton
          icon={<IconOperationsHistory />}
          label={t('home.operations_history', { defaultValue: 'History' })}
          onClick={() => navigate('/operations/history', { state: { portfolio, background: location } })}
        />
        <ActionButton
          icon={<IconCancelAll />}
          label={t('home.cancel_all_orders')}
          onClick={() => {
            if (!portfolio) {
              showNotification(t('order.select_portfolio'), 'info');
              return;
            }
            if (activeOrdersCount === 0) {
              showNotification(t('home.no_active_orders'), 'info');
              return;
            }
            setShowConfirm(true);
          }}
        />
      </Flex>


      {showConfirm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--background-surface-card)',
            color: 'var(--text-primary)',
            padding: '24px',
            borderRadius: '16px',
            width: '80%',
            maxWidth: '320px',
            textAlign: 'center'
          }}>
            <Typography.Headline style={{ marginBottom: '16px', fontSize: '18px' }}>
              {t('orderDetail.cancel_all_confirm')}
            </Typography.Headline>
            <Flex gap={16} justify="center">
              <Button onClick={() => setShowConfirm(false)} style={{ background: '#eee', color: '#333', border: 'none', flex: 1 }}>
                {t('common.no')}
              </Button>
              <Button onClick={handleCancelAll} style={{ background: '#ef4444', color: 'white', border: 'none', flex: 1 }}>
                {t('common.yes')}
              </Button>
            </Flex>
          </div>
        </div>
      )}
    </>
  );
};
