import React, { useEffect, useState } from 'react';
import { Flex, Typography, Grid } from '@maxhub/max-ui';
import { PortfolioService, ClientPortfolio, PortfolioOrder, Side, OrderStatus } from '../../api/services';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

interface CompletedOrdersListProps {
  orders: PortfolioOrder[];
}

export const CompletedOrdersList: React.FC<CompletedOrdersListProps> = ({ orders }) => {
  const [visibleCount, setVisibleCount] = useState(2);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  if (orders.length === 0) return <Typography.Body style={{ color: 'var(--text-secondary)' }}>{t('home.no_completed_orders')}</Typography.Body>;

  const visibleOrders = orders.slice(0, visibleCount);
  const hasMore = visibleCount < orders.length;

  return (
    <Grid gap={8} cols={1}>
      {visibleOrders.map(order => {
        const isBuy = order.side === Side.Buy;
        const sideColor = isBuy ? 'var(--text-positive)' : 'var(--text-negative)';

        let statusColor = 'var(--text-secondary)';
        if (order.status === OrderStatus.Filled) statusColor = 'var(--text-positive)';
        if (order.status === OrderStatus.Rejected) statusColor = 'var(--text-negative)';
        if (order.status === OrderStatus.Canceled) statusColor = 'var(--text-secondary)';

        return (
          <div
            key={order.id}
            onClick={() => navigate('/order/detail', { state: { order, background: location } })}
            style={{ padding: '8px', borderBottom: '1px solid var(--stroke-separator-secondary)', cursor: 'pointer' }}
          >
            <Flex justify="space-between" align="center">
              <Flex direction="column">
                <Typography.Body style={{ fontWeight: 600 }}>{order.symbol}</Typography.Body>
                <Typography.Label style={{ color: statusColor }}>
                  {t(`orderDetail.status.${order.status}`)}
                </Typography.Label>
              </Flex>
              <Flex direction="column" style={{ alignItems: 'flex-end' }}>
                <Typography.Body>{order.price} ₽</Typography.Body>
                <Typography.Label style={{ color: sideColor }}>
                  {isBuy ? t('common.buy') : t('common.sell')} {order.filledQtyUnits} / {order.qtyUnits}
                </Typography.Label>
              </Flex>
            </Flex>
          </div>
        );
      })}
      {hasMore && (
        <div
          onClick={() => setVisibleCount(prev => prev + 5)}
          style={{
            textAlign: 'center',
            padding: '8px',
            cursor: 'pointer',
            color: 'var(--text-themed)',
            fontWeight: 500,
            marginTop: '8px'
          }}
        >
          {t('common.load_more')}
        </div>
      )}
    </Grid>
  );
};
