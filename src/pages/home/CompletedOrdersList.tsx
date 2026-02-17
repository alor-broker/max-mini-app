import React, { useEffect, useState } from 'react';
import { Flex, Typography, Grid } from '@maxhub/max-ui';
import { PortfolioService, ClientPortfolio, PortfolioOrder, Side, OrderStatus } from '../../api/services';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface CompletedOrdersListProps {
  portfolio: ClientPortfolio | null;
  refreshTrigger?: number;
}

export const CompletedOrdersList: React.FC<CompletedOrdersListProps> = ({ portfolio, refreshTrigger }) => {
  const [orders, setOrders] = useState<PortfolioOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(2); // Start with fewer to save space
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!portfolio) return;
    setLoading(true);
    PortfolioService.getOrders(portfolio.exchange, portfolio.portfolio)
      .then(data => {
        // Filter for completed/non-working orders
        const completed = data.filter(o => o.status !== OrderStatus.Working);
        // Sort by time descending
        completed.sort((a, b) => b.transTime.getTime() - a.transTime.getTime());
        setOrders(completed);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [portfolio, refreshTrigger]);

  if (!portfolio) return null;
  if (orders.length === 0 && !loading) return <Typography.Body style={{ color: 'var(--text-secondary)' }}>{t('home.no_completed_orders')}</Typography.Body>;

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
            onClick={() => navigate('/order/detail', { state: { order } })}
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
