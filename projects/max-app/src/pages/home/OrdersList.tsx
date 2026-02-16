import React, { useEffect, useState } from 'react';
import { Flex, Typography, Grid } from '@maxhub/max-ui';
import { PortfolioService, ClientPortfolio, PortfolioOrder, Side, OrderStatus } from '../../api/services';

interface OrdersListProps {
  portfolio: ClientPortfolio | null;
}

export const OrdersList: React.FC<OrdersListProps> = ({ portfolio }) => {
  const [orders, setOrders] = useState<PortfolioOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!portfolio) return;
    setLoading(true);
    PortfolioService.getOrders(portfolio.exchange, portfolio.portfolio)
      .then(data => {
        // Filter for active orders if needed, or show all returned
        setOrders(data.filter(o => o.status === OrderStatus.Working));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [portfolio]);

  if (!portfolio) return null;
  if (orders.length === 0 && !loading) return <Typography.Body style={{ color: 'gray' }}>No active orders</Typography.Body>;

  return (
    <Grid gap={8} cols={1}>
      {orders.map(order => {
        const isBuy = order.side === Side.Buy;
        const sideColor = isBuy ? '#4ade80' : '#ef4444';

        return (
          <div key={order.id} style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Flex justify="space-between" align="center">
              <Flex direction="column">
                <Typography.Body style={{ fontWeight: 600 }}>{order.symbol}</Typography.Body>
                <Typography.Label style={{ color: 'gray' }}>
                  {order.type}
                </Typography.Label>
              </Flex>
              <Flex direction="column" style={{ alignItems: 'flex-end' }}>
                <Typography.Body>{order.price} ₽</Typography.Body>
                <Typography.Label style={{ color: sideColor }}>
                  {isBuy ? 'Buy' : 'Sell'} {order.qtyUnits - order.filledQtyUnits} / {order.qtyUnits}
                </Typography.Label>
              </Flex>
            </Flex>
          </div>
        );
      })}
    </Grid>
  );
};
