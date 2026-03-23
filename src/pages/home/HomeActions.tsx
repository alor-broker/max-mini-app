import React, { useState } from 'react';
import { Flex, Typography, Button } from '@maxhub/max-ui';
import { useTranslation } from 'react-i18next';
import { ClientPortfolio, OrdersService } from '../../api/services';
import { useNotification } from '../../components/NotificationContext';
import { IconNewOrder, IconCancelAll, IconOperationsHistory } from '../../components/Icons';
import { useModal } from '../../components/ModalContext';


interface HomeActionsProps {
  portfolio?: ClientPortfolio | null;
  refreshTrigger?: () => void;
  activeOrdersCount?: number;
}

export const HomeActions: React.FC<HomeActionsProps> = ({ portfolio, refreshTrigger, activeOrdersCount = 0 }) => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const { openModal } = useModal();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const [pressedAction, setPressedAction] = useState<string | null>(null);

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

  const ActionButton = ({
    id,
    icon,
    label,
    onClick,
    tone = 'default',
  }: {
    id: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    tone?: 'default' | 'danger';
  }) => {
    const isHovered = hoveredAction === id;
    const isPressed = pressedAction === id;
    const isDanger = tone === 'danger';

    const baseStyle: React.CSSProperties = {
      borderRadius: '999px',
      padding: '6px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      border: '1px solid rgba(255,255,255,0.35)',
      background: 'rgba(0,0,0,0.12)',
      color: 'white',
      fontSize: '11px',
      fontWeight: 600,
      lineHeight: 1,
      cursor: 'pointer',
      minHeight: '30px',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease',
      boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
      backdropFilter: 'blur(6px)',
      whiteSpace: 'nowrap',
    };

    const toneStyle: React.CSSProperties = isDanger
      ? {
        borderColor: 'rgba(239, 68, 68, 0.6)',
        color: '#fee2e2',
        background: 'rgba(239, 68, 68, 0.12)',
      }
      : {};

    const hoverStyle: React.CSSProperties = isHovered
      ? {
        background: isDanger ? 'rgba(239, 68, 68, 0.18)' : 'rgba(255,255,255,0.16)',
        borderColor: isDanger ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255,255,255,0.5)',
        transform: 'translateY(-1px)',
        boxShadow: '0 10px 24px rgba(0,0,0,0.25)',
      }
      : {};

    const pressedStyle: React.CSSProperties = isPressed
      ? {
        transform: 'translateY(0) scale(0.98)',
        boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
      }
      : {};

    return (
      <button
        type="button"
        onClick={onClick}
        data-no-pull-refresh="true"
        style={{ ...baseStyle, ...toneStyle, ...hoverStyle, ...pressedStyle }}
        onMouseEnter={() => setHoveredAction(id)}
        onMouseLeave={() => {
          setHoveredAction(null);
          setPressedAction(null);
        }}
        onMouseDown={() => setPressedAction(id)}
        onMouseUp={() => setPressedAction(null)}
      >
        <span
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDanger ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.35)',
          }}
        >
          {icon}
        </span>
        <Typography.Label style={{ color: 'inherit', fontSize: '11px', fontWeight: 600 }}>
          {label}
        </Typography.Label>
      </button>
    );
  };

  return (
    <>
      <Flex
        gap={10}
        justify="center"
        style={{
          width: '100%',
          marginTop: '10px',
          flexWrap: 'nowrap',
        }}
      >
        <ActionButton
          id="new-order"
          icon={<IconNewOrder width={14} height={14} />}
          label={t('home.new_order')}
          onClick={() => openModal('createOrder', { portfolio: portfolio ?? undefined })}
        />
        <ActionButton
          id="history"
          icon={<IconOperationsHistory width={14} height={14} />}
          label={t('home.operations_history', { defaultValue: 'History' })}
          onClick={() => openModal('operationsHistory', { portfolio: portfolio ?? undefined })}
        />
        <ActionButton
          id="cancel-all"
          icon={<IconCancelAll width={14} height={14} />}
          label={t('home.cancel_all_orders')}
          tone="danger"
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
              <Button onClick={handleCancelAll} disabled={isCanceling} style={{ background: '#ef4444', color: 'white', border: 'none', flex: 1 }}>
                {isCanceling ? '...' : t('common.yes')}
              </Button>
            </Flex>
          </div>
        </div>
      )}
    </>
  );
};
