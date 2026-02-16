import React, { useEffect, useState } from 'react';
import { Flex, Typography, Grid } from '@maxhub/max-ui';
import { PortfolioService, ClientPortfolio, PortfolioTrade, Side } from '../../api/services';

interface TradesListProps {
  portfolio: ClientPortfolio | null;
}

export const TradesList: React.FC<TradesListProps> = ({ portfolio }) => {
  const [trades, setTrades] = useState<PortfolioTrade[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!portfolio) return;
    setLoading(true);
    PortfolioService.getTrades(portfolio.exchange, portfolio.portfolio)
      .then(setTrades)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [portfolio]);

  if (!portfolio) return null;
  if (trades.length === 0 && !loading) return <Typography.Body style={{ color: 'gray' }}>No trades today</Typography.Body>;

  return (
    <Grid gap={8} cols={1}>
      {trades.map(trade => {
        const isBuy = trade.side === Side.Buy;
        const color = isBuy ? '#4ade80' : '#ef4444';

        return (
          <div key={trade.id} style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Flex justify="space-between" align="center">
              <Flex direction="column">
                <Typography.Body style={{ fontWeight: 600 }}>{trade.symbol}</Typography.Body>
                <Typography.Label style={{ color: 'gray' }}>
                  {trade.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography.Label>
              </Flex>
              <Flex direction="column" style={{ alignItems: 'flex-end' }}>
                <Typography.Body>{trade.price} ₽</Typography.Body>
                <Typography.Label style={{ color: color }}>
                  {isBuy ? 'Buy' : 'Sell'} {trade.qty} lots
                </Typography.Label>
              </Flex>
            </Flex>
          </div>
        );
      })}
    </Grid>
  );
};
