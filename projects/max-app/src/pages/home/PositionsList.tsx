import React, { useEffect, useState } from 'react';
import { Flex, Typography, Grid } from '@maxhub/max-ui';
import { PortfolioService, ClientPortfolio, PortfolioPosition } from '../../api/services';

interface PositionsListProps {
  portfolio: ClientPortfolio | null;
}

export const PositionsList: React.FC<PositionsListProps> = ({ portfolio }) => {
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!portfolio) return;
    setLoading(true);
    PortfolioService.getPositions(portfolio.exchange, portfolio.portfolio)
      .then(setPositions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [portfolio]);

  if (!portfolio) return null;
  if (positions.length === 0 && !loading) return <Typography.Body style={{ color: 'gray' }}>No open positions</Typography.Body>;

  return (
    <Grid gap={8} cols={1}>
      {positions.map(pos => {
        const plColor = pos.unrealisedPl >= 0 ? '#4ade80' : '#ef4444';

        return (
          <div key={pos.symbol} style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Flex justify="space-between" align="center">
              <Flex direction="column">
                <Typography.Body style={{ fontWeight: 600 }}>{pos.symbol}</Typography.Body>
                <Typography.Label style={{ color: 'gray' }}>
                  {pos.qtyUnits} shares | Avg: {pos.avgPrice.toFixed(2)}
                </Typography.Label>
              </Flex>
              <Flex direction="column" style={{ alignItems: 'flex-end' }}>
                <Typography.Body>
                  {(pos.qtyUnits * pos.avgPrice).toFixed(2)}
                </Typography.Body>
                <Typography.Label style={{ color: plColor }}>
                  {pos.unrealisedPl >= 0 ? '+' : ''}{pos.unrealisedPl.toFixed(2)}
                </Typography.Label>
              </Flex>
            </Flex>
          </div>
        );
      })}
    </Grid>
  );
};
