import React, { useEffect, useState } from 'react';
import { Flex, Typography, Grid } from '@maxhub/max-ui';
import { PortfolioService, ClientPortfolio, PortfolioTrade, Side } from '../../api/services';
import { useTranslation } from 'react-i18next';

import { useNavigate, useLocation } from 'react-router-dom';

interface TradesListProps {
  trades: PortfolioTrade[];
}

export const TradesList: React.FC<TradesListProps> = ({ trades }) => {
  const [visibleCount, setVisibleCount] = useState(5);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  if (trades.length === 0) return <Typography.Body style={{ color: 'var(--text-secondary)' }}>{t('home.no_trades')}</Typography.Body>;

  const visibleTrades = trades.slice(0, visibleCount);
  const hasMore = visibleCount < trades.length;

  return (
    <Grid gap={8} cols={1}>
      {visibleTrades.map(trade => {
        const isBuy = trade.side === Side.Buy;
        const color = isBuy ? 'var(--text-positive)' : 'var(--text-negative)';

        return (
          <div
            key={trade.id}
            onClick={() => navigate('/trade/detail', { state: { trade, background: location } })}
            style={{ padding: '8px', borderBottom: '1px solid var(--stroke-separator-secondary)', cursor: 'pointer' }}
          >
            <Flex justify="space-between" align="center">
              <Flex direction="column">
                <Typography.Body style={{ fontWeight: 600 }}>{trade.symbol}</Typography.Body>
                <Typography.Label style={{ color: 'var(--text-secondary)' }}>
                  {trade.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography.Label>
              </Flex>
              <Flex direction="column" style={{ alignItems: 'flex-end' }}>
                <Typography.Body>{trade.price} ₽</Typography.Body>
                <Typography.Label style={{ color: color }}>
                  {isBuy ? t('common.buy') : t('common.sell')} {trade.qty} {t('common.lots')}
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
