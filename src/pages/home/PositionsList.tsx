import React, { useEffect, useState } from 'react';
import { Flex, Typography, Grid } from '@maxhub/max-ui';
import { PortfolioService, ClientPortfolio, PortfolioPosition } from '../../api/services';
import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom';

interface PositionsListProps {
  positions: PortfolioPosition[];
  portfolio: ClientPortfolio | null;
}

export const PositionsList: React.FC<PositionsListProps> = ({ positions, portfolio }) => {
  const [visibleCount, setVisibleCount] = useState(5);
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (positions.length === 0) return <Typography.Body style={{ color: 'var(--text-secondary)' }}>{t('home.no_positions')}</Typography.Body>;

  const visiblePositions = positions.slice(0, visibleCount);
  const hasMore = visibleCount < positions.length;

  return (
    <Grid gap={8} cols={1}>
      {visiblePositions.map(pos => {
        const plColor = pos.unrealisedPl >= 0 ? 'var(--text-positive)' : 'var(--text-negative)';

        return (
          <div
            key={pos.symbol}
            onClick={() => navigate('/order/new', { state: { symbol: pos.symbol, portfolio } })}
            style={{ padding: '8px', borderBottom: '1px solid var(--stroke-separator-secondary)', cursor: 'pointer' }}
          >
            <Flex justify="space-between" align="center">
              <Flex direction="column">
                <Typography.Body style={{ fontWeight: 600 }}>{pos.symbol}</Typography.Body>
                <Typography.Label style={{ color: 'var(--text-secondary)' }}>
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
