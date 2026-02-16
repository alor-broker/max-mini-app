import React from 'react';
import { Panel, Container, Flex, Typography, Button, Grid } from '@maxhub/max-ui';
import { useNavigate, useLocation } from 'react-router-dom';
import { PortfolioTrade, Side } from '../../api/services';
import { useTranslation } from 'react-i18next';

const DetailRow: React.FC<{ label: string; value: React.ReactNode; valueColor?: string }> = ({ label, value, valueColor }) => (
  <Flex
    justify="space-between"
    align="center"
    style={{
      padding: '14px 0',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
    }}
  >
    <Typography.Label style={{ color: '#888', fontSize: '14px' }}>{label}</Typography.Label>
    <Typography.Body style={{ fontWeight: 500, color: valueColor || '#333', fontSize: '14px' }}>{value}</Typography.Body>
  </Flex>
);

export const TradeDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const trade = (location.state as { trade?: PortfolioTrade })?.trade;

  if (!trade) {
    return (
      <Panel>
        <Container style={{ padding: '24px 16px', textAlign: 'center' }}>
          <Typography.Body style={{ color: 'gray' }}>{t('tradeDetail.not_found')}</Typography.Body>
          <Button onClick={() => navigate('/')} style={{ marginTop: '16px' }}>
            {t('common.back')}
          </Button>
        </Container>
      </Panel>
    );
  }

  const isBuy = trade.side === Side.Buy;
  const sideColor = isBuy ? '#4ade80' : '#ef4444';

  const formatDate = (d: Date | string) => {
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleString([], {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Panel>
      <Grid gap={16} cols={1}>
        {/* Gradient Header — full width, matching home page */}
        <Container
          style={{
            padding: '24px 16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '16px',
          }}
        >
          <Flex direction="column" gap={16}>
            {/* Navigation row */}
            <Flex justify="space-between" align="center">
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                <Button
                  onClick={() => navigate('/')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '15px',
                    padding: '4px 0',
                  }}
                >
                  ‹ {t('common.back')}
                </Button>
              </div>
              <Typography.Headline style={{ color: 'white' }}>{t('tradeDetail.title')}</Typography.Headline>
              <div style={{ flex: 1 }}></div>
            </Flex>

            {/* Symbol & Badge */}
            <Flex direction="column" align="center" gap={8} style={{ width: '100%', textAlign: 'center' }}>
              <Typography.Title style={{ fontSize: '28px', fontWeight: 700, color: 'white' }}>
                {trade.symbol}
              </Typography.Title>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: sideColor,
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                {isBuy ? t('common.buy') : t('common.sell')}
              </span>

              {/* Price large display */}
              <Typography.Display style={{ fontSize: '36px', fontWeight: 700, color: 'white', marginTop: '4px' }}>
                {trade.price.toLocaleString()} ₽
              </Typography.Display>
              <Typography.Label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                {trade.qty} {t('common.lots')} × {trade.price.toLocaleString()} ₽
              </Typography.Label>
            </Flex>
          </Flex>
        </Container>

        {/* Details section */}
        <Container
          style={{
            padding: '16px',
            backgroundColor: 'rgba(0,0,0,0.03)',
            borderRadius: '16px',
          }}
        >
          <DetailRow label={t('tradeDetail.order_no')} value={trade.orderNo} />
          <DetailRow label={t('tradeDetail.exchange')} value={trade.exchange} />
          <DetailRow
            label={t('tradeDetail.side')}
            value={isBuy ? t('common.buy') : t('common.sell')}
            valueColor={sideColor}
          />
          <DetailRow
            label={t('tradeDetail.quantity')}
            value={`${trade.qty} ${t('common.lots')}`}
          />
          <DetailRow
            label={t('tradeDetail.price')}
            value={`${trade.price.toLocaleString()} ₽`}
          />
          <DetailRow
            label={t('tradeDetail.volume')}
            value={`${trade.volume.toLocaleString()} ₽`}
          />
          <DetailRow
            label={t('tradeDetail.date')}
            value={formatDate(trade.date)}
          />
        </Container>

        {/* Action button */}
        <Container style={{ padding: '0 16px 16px' }}>
          <Button
            onClick={() => navigate('/order/new', { state: { symbol: trade.symbol } })}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white',
              fontWeight: 600,
              padding: '14px',
              borderRadius: '12px',
              fontSize: '15px',
            }}
          >
            {t('tradeDetail.new_order_for_symbol')}
          </Button>
        </Container>
      </Grid>
    </Panel>
  );
};
