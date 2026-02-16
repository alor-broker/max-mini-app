import React, { useEffect, useState } from 'react';
import { Flex, Typography, Grid } from '@maxhub/max-ui';
import { PortfolioService, ClientPortfolio, PortfolioTrade, Side } from '../../api/services';
import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom';

interface TradesListProps {
  portfolio: ClientPortfolio | null;
}

export const TradesList: React.FC<TradesListProps> = ({ portfolio }) => {
  const [trades, setTrades] = useState<PortfolioTrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!portfolio) return;
    setLoading(true);
    PortfolioService.getTrades(portfolio.exchange, portfolio.portfolio)
      .then(setTrades)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [portfolio]);

  if (!portfolio) return null;
  if (trades.length === 0 && !loading) return <Typography.Body style={{ color: 'gray' }}>{t('home.no_trades')}</Typography.Body>;

  const visibleTrades = trades.slice(0, visibleCount);
  const hasMore = visibleCount < trades.length;

  return (
    <Grid gap={8} cols={1}>
      {visibleTrades.map(trade => {
        const isBuy = trade.side === Side.Buy;
        const color = isBuy ? '#4ade80' : '#ef4444';

        return (
          <div
            key={trade.id}
            onClick={() => navigate('/trade/detail', { state: { trade } })}
            style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
          >
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
