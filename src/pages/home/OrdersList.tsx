import React, { useEffect, useState } from 'react';
import { Flex, Typography, Grid } from '@maxhub/max-ui';
import { PortfolioService, ClientPortfolio, PortfolioOrder, Side, OrderStatus, Instrument } from '../../api/services';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { MathHelper } from '../../utils/math-helper';

interface OrdersListProps {
  orders: PortfolioOrder[];
  instruments: Record<string, Instrument>;
}

export const OrdersList: React.FC<OrdersListProps> = ({ orders, instruments }) => {
  const [visibleCount, setVisibleCount] = useState(5);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  if (orders.length === 0) return <Typography.Body style={{ color: 'var(--text-secondary)' }}>{t('home.no_active_orders')}</Typography.Body>;

  const visibleOrders = orders.slice(0, visibleCount);
  const hasMore = visibleCount < orders.length;

  return (
    <Grid gap={8} cols={1}>
      {visibleOrders.map(order => {
        const isBuy = order.side === Side.Buy;
        const sideColor = isBuy ? 'var(--text-positive)' : 'var(--text-negative)';
        const inst = instruments[`${order.exchange}:${order.symbol}`];
        const price = inst ? MathHelper.roundPrice(order.price, inst.minstep) : MathHelper.round(order.price, 2);

        return (
          <div
            key={order.id}
            onClick={() => navigate('/order/detail', { state: { order, background: location } })}
            style={{ padding: '8px', borderBottom: '1px solid var(--stroke-separator-secondary)', cursor: 'pointer' }}
          >
            <Flex justify="space-between" align="center">
              <Flex direction="column">
                <Typography.Body style={{ fontWeight: 600 }}>{order.symbol}</Typography.Body>
                <Typography.Label style={{ color: 'var(--text-secondary)' }}>
                  {order.type}
                </Typography.Label>
              </Flex>
              <Flex direction="column" style={{ alignItems: 'flex-end' }}>
                <Typography.Body>{price} ₽</Typography.Body>
                <Typography.Label style={{ color: sideColor }}>
                  {isBuy ? t('common.buy') : t('common.sell')} {MathHelper.round(order.qtyUnits - order.filledQtyUnits, 2)} / {MathHelper.round(order.qtyUnits, 2)}
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
