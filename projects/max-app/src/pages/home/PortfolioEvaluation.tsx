import React, { useEffect, useState } from 'react';
import { Flex, Typography } from '@maxhub/max-ui';
import { PortfolioService, PortfolioSummary, ClientPortfolio } from '../../api/services';
import { useTranslation } from 'react-i18next';

interface PortfolioEvaluationProps {
  portfolio: ClientPortfolio | null;
}

export const PortfolioEvaluation: React.FC<PortfolioEvaluationProps> = ({ portfolio }) => {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!portfolio) return;

    setLoading(true);
    PortfolioService.getSummary(portfolio.exchange, portfolio.portfolio)
      .then(setSummary)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [portfolio]);

  if (!portfolio || !summary) {
    return (
      <Flex direction="column" gap={8} align="center">
        <Typography.Body style={{ color: 'rgba(255,255,255,0.8)' }}>{t('portfolio.total_balance')}</Typography.Body>
        <Typography.Display style={{ color: 'white' }}>---</Typography.Display>
      </Flex>
    );
  }

  const { portfolioLiquidationValue, profit, profitRate } = summary;
  const isProfitPositive = profit >= 0;
  const profitColor = isProfitPositive ? '#4ade80' : '#ef4444';

  return (
    <Flex direction="column" gap={8} align="center" style={{ width: '100%' }}>
      <Flex justify="center" align="center" style={{ width: '100%' }}>
        <Typography.Body style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>{t('portfolio.total_balance')}</Typography.Body>
      </Flex>
      <Typography.Display style={{ color: 'white', textAlign: 'center', width: '100%' }}>
        {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(portfolioLiquidationValue)}
      </Typography.Display>
      <Flex gap={8} justify="center" style={{ width: '100%' }}>
        <Typography.Body style={{ color: profitColor }}>
          {isProfitPositive ? '+' : ''}{profitRate.toFixed(2)}%
        </Typography.Body>
        <Typography.Body style={{ color: 'rgba(255,255,255,0.6)' }}>
          ({new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(profit)})
        </Typography.Body>
      </Flex>
    </Flex>
  );
};
