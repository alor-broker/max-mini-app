import React, { useEffect, useState } from 'react';
import { Flex, Typography, Grid } from '@maxhub/max-ui';
import { PortfolioService, ClientPortfolio, PortfolioPosition } from '../../api/services';
import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom';

interface PositionsListProps {
  portfolio: ClientPortfolio | null;
}

export const PositionsList: React.FC<PositionsListProps> = ({ portfolio }) => {
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!portfolio) return;
    setLoading(true);
    PortfolioService.getPositions(portfolio.exchange, portfolio.portfolio)
      .then(setPositions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [portfolio]);

  if (!portfolio) return null;
  if (positions.length === 0 && !loading) return <Typography.Body style={{ color: 'gray' }}>{t('home.no_positions')}</Typography.Body>;

  const visiblePositions = positions.slice(0, visibleCount);
  const hasMore = visibleCount < positions.length;

  return (
    <Grid gap={8} cols={1}>
      {visiblePositions.map(pos => {
        const plColor = pos.unrealisedPl >= 0 ? '#4ade80' : '#ef4444';

        return (
          <div
            key={pos.symbol}
            onClick={() => navigate('/order/new', { state: { symbol: pos.symbol, portfolio } })}
            style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
          >
            <Flex justify="space-between" align="center">
              <Flex direction="column">
                <Typography.Body style={{ fontWeight: 600 }}>{pos.symbol}</Typography.Body>
                <Typography.Label style={{ color: 'gray' }}>
                  {pos.qtyUnits} {t('common.shares')} | {t('common.avg')}: {pos.avgPrice.toFixed(2)}
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
      {hasMore && (
        <div
          onClick={() => setVisibleCount(prev => prev + 5)}
          style={{
            textAlign: 'center',
            padding: '8px',
            cursor: 'pointer',
            color: '#0a84ff',
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
