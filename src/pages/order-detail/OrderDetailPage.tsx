import React, { useState } from 'react';
import { Panel, Container, Flex, Typography, Button, Grid } from '@maxhub/max-ui';
import { useNavigate, useLocation } from 'react-router-dom';
import { PortfolioOrder, Side, OrderStatus, OrderType, OrdersService } from '../../api/services';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../components/NotificationContext';

const statusColorMap: Record<OrderStatus, string> = {
  [OrderStatus.Working]: '#0a84ff',
  [OrderStatus.Filled]: '#4ade80',
  [OrderStatus.Canceled]: '#888',
  [OrderStatus.Rejected]: '#ef4444',
};

const DetailRow: React.FC<{ label: string; value: React.ReactNode; valueColor?: string }> = ({ label, value, valueColor }) => (
  <Flex
    justify="space-between"
    align="center"
    style={{
      padding: '14px 0',
      borderBottom: '1px solid var(--stroke-separator-secondary)',
    }}
  >
    <Typography.Label style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{label}</Typography.Label>
    <Typography.Body style={{ fontWeight: 500, color: valueColor || 'var(--text-primary)', fontSize: '14px' }}>{value}</Typography.Body>
  </Flex>
);

export const OrderDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [isCanceling, setIsCanceling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const order = (location.state as { order?: PortfolioOrder })?.order;

  const handleBack = () => {
    const state = location.state as { background?: any };
    if (state?.background) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (!order) {
    return (
      <Panel>
        <Container style={{ padding: '24px 16px', textAlign: 'center' }}>
          <Typography.Body style={{ color: 'var(--text-secondary)' }}>{t('orderDetail.not_found')}</Typography.Body>
          <Button onClick={handleBack} style={{ marginTop: '16px' }}>
            {t('common.back')}
          </Button>
        </Container>
      </Panel>
    );
  }

  const isBuy = order.side === Side.Buy;
  const sideColor = isBuy ? '#4ade80' : '#ef4444';
  const statusColor = statusColorMap[order.status] || '#888';

  const formatDate = (d: Date | string) => {
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleString([], {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCancelOrder = async () => {
    setIsCanceling(true);
    try {
      await OrdersService.cancelOrder(order.portfolio, order.id, order.exchange);
      showNotification(t('orderDetail.success_cancel'), 'success');
      showNotification(t('orderDetail.success_cancel'), 'success');

      const state = location.state as { background?: any };
      if (state?.background) {
        navigate(-1);
      } else {
        navigate('/');
      }
    } catch (e) {
      console.error(e);
      showNotification(t('common.error'), 'error');
    } finally {
      setIsCanceling(false);
      setShowConfirm(false);
    }
  };

  return (
    <Panel style={{ minHeight: '100vh' }}>
      <Grid gap={16} cols={1}>
        {/* Gradient Header — full width, matching home page */}
        <Container
          style={{
            padding: '24px 16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '16px',
          }}
        >
          <Flex direction="column" gap={16}>
            {/* Navigation row */}
            {/* Navigation row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Button
                  onClick={handleBack}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '15px',
                    padding: '4px 0',
                  }}
                >
                  ‹ {t('common.back')}
                </Button>
              </div>
              <Typography.Headline style={{ color: 'white', textAlign: 'center', whiteSpace: 'nowrap' }}>
                {t('orderDetail.title')}
              </Typography.Headline>
              <div></div>
            </div>

            {/* Symbol & Badges */}
            <Flex direction="column" align="center" gap={8} style={{ width: '100%', textAlign: 'center' }}>
              <Typography.Title style={{ fontSize: '28px', fontWeight: 700, color: 'white' }}>
                {order.symbol}
              </Typography.Title>
              <Flex gap={8} align="center">
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: sideColor,
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  {isBuy ? t('common.buy') : t('common.sell')}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: statusColor,
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  {t(`orderDetail.status.${order.status}`)}
                </span>
              </Flex>

              {/* Price large display */}
              <Typography.Display style={{ fontSize: '36px', fontWeight: 700, color: 'white', marginTop: '4px' }}>
                {order.price.toLocaleString()} ₽
              </Typography.Display>
            </Flex>
          </Flex>
        </Container>

        {/* Details section */}
        <Container
          style={{
            padding: '16px',
            backgroundColor: 'var(--background-surface-tertiary)',
            borderRadius: '16px',
          }}
        >
          <DetailRow label={t('orderDetail.exchange')} value={order.exchange} />
          <DetailRow label={t('orderDetail.portfolio')} value={order.portfolio} />
          <DetailRow
            label={t('orderDetail.order_type')}
            value={t(`orderDetail.type.${order.type}`)}
          />
          <DetailRow
            label={t('orderDetail.side')}
            value={isBuy ? t('common.buy') : t('common.sell')}
            valueColor={sideColor}
          />
          <DetailRow
            label={t('orderDetail.quantity')}
            value={`${order.filledQtyUnits} / ${order.qtyUnits}`}
          />
          <DetailRow
            label={t('orderDetail.price')}
            value={`${order.price.toLocaleString()} ₽`}
          />
          <DetailRow
            label={t('orderDetail.trans_time')}
            value={formatDate(order.transTime)}
          />
          <DetailRow
            label={t('orderDetail.end_time')}
            value={formatDate(order.endTime)}
          />
        </Container>

        {/* Action button */}
        <Container style={{ padding: '0 16px 16px' }}>
          <Button
            onClick={() => navigate('/order/new', { state: { symbol: order.symbol, background: location } })}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white',
              fontWeight: 600,
              padding: '14px',
              borderRadius: '12px',
              fontSize: '15px',
            }}
          >
            {t('orderDetail.new_order_for_symbol')}
          </Button>
        </Container>

        {order.status === OrderStatus.Working && (
          <Container style={{ padding: '0 16px 16px' }}>
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={isCanceling}
              style={{
                width: '100%',
                background: 'transparent',
                border: '1px solid #ef4444',
                color: '#ef4444',
                fontWeight: 600,
                padding: '14px',
                borderRadius: '12px',
                fontSize: '15px',
              }}
            >
              {isCanceling ? t('orderDetail.canceling') : t('orderDetail.cancel_order')}
            </Button>
          </Container>
        )}
      </Grid>

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
              {t('orderDetail.cancel_confirm')}
            </Typography.Headline>
            <Flex gap={16} justify="center">
              <Button onClick={() => setShowConfirm(false)} style={{ background: '#eee', color: '#333', border: 'none', flex: 1 }}>
                {t('common.no')}
              </Button>
              <Button onClick={handleCancelOrder} style={{ background: '#ef4444', color: 'white', border: 'none', flex: 1 }}>
                {t('common.yes')}
              </Button>
            </Flex>
          </div>
        </div>
      )}
    </Panel>
  );
};
