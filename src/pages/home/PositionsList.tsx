import React, { useEffect, useState } from 'react';
import { Flex, Typography, Grid } from '@maxhub/max-ui';
import { PortfolioService, ClientPortfolio, PortfolioPosition, Instrument } from '../../api/services';
import { useTranslation } from 'react-i18next';

import { useNavigate, useLocation } from 'react-router-dom';
import { MathHelper } from '../../utils/math-helper';

interface PositionsListProps {
  positions: PortfolioPosition[];
  portfolio: ClientPortfolio | null;
  instruments: Record<string, Instrument>;
}

export const PositionsList: React.FC<PositionsListProps> = ({ positions, portfolio, instruments }) => {
  const [visibleCount, setVisibleCount] = useState(5);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  if (positions.length === 0) return <Typography.Body style={{ color: 'var(--text-secondary)' }}>{t('home.no_positions')}</Typography.Body>;

  const visiblePositions = positions.slice(0, visibleCount);
  const hasMore = visibleCount < positions.length;

  return (
    <Grid gap={8} cols={1}>
      {visiblePositions.map(pos => {
        const plColor = pos.unrealisedPl >= 0 ? 'var(--text-positive)' : 'var(--text-negative)';
        const inst = instruments[`${pos.exchange}:${pos.symbol}`];

        let avgPriceRaw = pos.avgPrice;
        if (avgPriceRaw === 0 && pos.qtyUnits !== 0) {
          avgPriceRaw = pos.volume / pos.qtyUnits;
        }

        let avgPrice = 0;

        if (pos.isCurrency) {
          avgPrice = MathHelper.round(avgPriceRaw, 2);
        } else {
          avgPrice = inst ? MathHelper.roundPrice(avgPriceRaw, inst.minstep) : MathHelper.round(avgPriceRaw, 2);
        }

        return (
          <div
            key={pos.symbol}
            onClick={() => navigate('/order/new', { state: { symbol: pos.symbol, portfolio, background: location } })}
            style={{ padding: '8px', borderBottom: '1px solid var(--stroke-separator-secondary)', cursor: 'pointer' }}
          >
            <Flex justify="space-between" align="center">
              <Flex direction="column">
                <Typography.Body style={{ fontWeight: 600 }}>{pos.symbol}</Typography.Body>
                <Typography.Label style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{pos.shortName}</Typography.Label>
                <Typography.Label style={{ color: 'var(--text-secondary)' }}>
                  {MathHelper.round(pos.qtyUnits, 2)} {t('common.shares')} | {t('common.avg')}: {avgPrice}
                </Typography.Label>
              </Flex>
              <Flex direction="column" style={{ alignItems: 'flex-end' }}>
                <Typography.Body>
                  {pos.isCurrency
                    ? new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(pos.qtyUnits)
                    : new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(pos.currentVolume)
                  }
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
