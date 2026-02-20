import React, { useState, useEffect, useRef } from 'react';
import { Flex, Typography, Button, Input } from '@maxhub/max-ui';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ClientService,
  ClientPortfolio,
  InstrumentsService,
  Instrument,
  OrdersService,
  Side,
  Quote
} from '../../api/services';
import { useAuth } from '../../auth/AuthContext';
import { storageManager } from '../../utils/storage-manager';
import { SearchInput } from '../../components/SearchInput';
import { SegmentedControl } from '../../components/SegmentedControl';
import { PortfolioSelector } from '../home/PortfolioSelector';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../components/NotificationContext';
import { PriceHistoryChart } from './PriceHistoryChart';
import { ModalPageLayout } from '../../components/ModalPageLayout';

const ORDER_CREATED_EVENT = 'maxapp:order-created';
const REFRESH_ORDERS_TRADES_FLAG_KEY = 'MAX_APP_REFRESH_ORDERS_TRADES';

export const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showNotification } = useNotification();

  // State
  const [portfolios, setPortfolios] = useState<ClientPortfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<ClientPortfolio | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [instrumentsList, setInstrumentsList] = useState<Instrument[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);

  // Ref to track if we should auto-select the first search result (from navigation)
  const autoSelectRef = useRef(false);
  const latestSearchRequestIdRef = useRef(0);

  // Initial State from Navigation
  useEffect(() => {
    const state = location.state as { symbol?: string; portfolio?: ClientPortfolio };
    if (state?.symbol) {
      setSearchQuery(state.symbol);
      autoSelectRef.current = true;
    }
    // Portfolio will be set after portfolios are loaded
  }, [location.state]);

  // Order Form State
  const [orderType, setOrderType] = useState<string>('Limit');
  const [side, setSide] = useState<Side>(Side.Buy);
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Initial Load
  useEffect(() => {
    if (user?.clientId && user?.login) {
      ClientService.getActivePortfolios(user.clientId, user.login).then(async (data) => {
        setPortfolios(data);

        const state = location.state as { symbol?: string; portfolio?: ClientPortfolio };
        if (state?.portfolio) {
          const found = data.find(p => p.portfolio === state.portfolio?.portfolio);
          if (found) {
            setSelectedPortfolio(found);
            return;
          }
        }

        const savedId = await storageManager.getItem('MAX_APP_SELECTED_PORTFOLIO');
        if (savedId) {
          const found = data.find(p => p.portfolio === savedId);
          if (found) {
            setSelectedPortfolio(found);
            return;
          }
        }

        if (data.length > 0) setSelectedPortfolio(data[0]);
      });
    }
  }, [user, location.state]);

  useEffect(() => {
    const normalizedQuery = searchQuery.trim();
    if (!normalizedQuery) {
      setInstrumentsList([]);
      setSearchLoading(false);
      return;
    }

    if (selectedInstrument && normalizedQuery.toUpperCase() === selectedInstrument.symbol.toUpperCase()) {
      setInstrumentsList([]);
      setSearchLoading(false);
      return;
    }

    // Debounce search
    const timer = setTimeout(async () => {
      const requestId = latestSearchRequestIdRef.current + 1;
      latestSearchRequestIdRef.current = requestId;
      setSearchLoading(true);
      try {
        const results = await InstrumentsService.searchInstruments({ query: normalizedQuery, limit: 20 });
        if (latestSearchRequestIdRef.current === requestId) {
          setInstrumentsList(results);
        }
      } catch (e) {
        console.error(e);
        if (latestSearchRequestIdRef.current === requestId) {
          setInstrumentsList([]);
        }
      } finally {
        if (latestSearchRequestIdRef.current === requestId) {
          setSearchLoading(false);
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedInstrument]);

  useEffect(() => {
    if (!selectedInstrument) {
      setQuote(null);
      return;
    }

    const fetchQuote = () => {
      InstrumentsService.getQuotes(selectedInstrument.exchange, selectedInstrument.symbol)
        .then(setQuote)
        .catch(e => {
          console.error("Failed to fetch quotes", e);
          setQuote(null);
        });
    };

    fetchQuote();
    const interval = setInterval(fetchQuote, 1000);

    return () => clearInterval(interval);
  }, [selectedInstrument]);

  const handleSelectInstrument = (inst: Instrument) => {
    latestSearchRequestIdRef.current += 1;
    setSearchLoading(false);
    setSelectedInstrument(inst);
    setInstrumentsList([]);
    setSearchQuery(inst.symbol);
    setPrice(inst.minstep.toString());
  }

  // Auto-select effect
  useEffect(() => {
    if (autoSelectRef.current && instrumentsList.length > 0) {
      handleSelectInstrument(instrumentsList[0]);
      autoSelectRef.current = false;
    }
  }, [instrumentsList]);

  const handleSubmit = async () => {
    if (!selectedPortfolio || !selectedInstrument) return;

    setLoading(true);
    try {
      const commonOrder = {
        instrument: {
          symbol: selectedInstrument.symbol,
          exchange: selectedInstrument.exchange,
          board: selectedInstrument.board
        },
        quantity: Number(quantity),
        side: side
      };

      if (orderType === 'Limit') {
        await OrdersService.submitLimitOrder({
          ...commonOrder,
          price: Number(price)
        }, selectedPortfolio.portfolio);
      } else {
        await OrdersService.submitMarketOrder({
          ...commonOrder
        }, selectedPortfolio.portfolio);
      }

      showNotification(t('order.success_submit'), 'success');
      await storageManager.setItem(REFRESH_ORDERS_TRADES_FLAG_KEY, '1');
      window.dispatchEvent(new CustomEvent(ORDER_CREATED_EVENT));

      const state = location.state as { background?: any };
      if (state?.background) {
        navigate(-1);
      } else {
        navigate('/');
      }
    } catch (e) {
      console.error("Order failed", e);
      showNotification(t('order.failed_submit'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    background: 'var(--background-accent-neutral-fade, rgba(0, 0, 0, 0.04))',
    border: '1px solid var(--border-default, rgba(0, 0, 0, 0.08))',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)'
  };

  return (
    <ModalPageLayout
      title={t('order.title')}
      contentGap={24}
    >
      <div style={cardStyle}>
        <Flex direction="column" gap={16} style={{ width: '100%' }}>
          {/* Portfolio Selector */}
          <Flex direction="column" gap={8} style={{ width: '100%' }}>
            <Typography.Label>{t('order.portfolio')}</Typography.Label>
            <PortfolioSelector
              portfolios={portfolios}
              selectedPortfolio={selectedPortfolio}
              onSelect={async (p) => {
                setSelectedPortfolio(p);
                await storageManager.setItem('MAX_APP_SELECTED_PORTFOLIO', p.portfolio);
              }}
              triggerStyle={{
                color: 'var(--text-primary)',
                background: 'var(--background-secondary, rgba(0, 0, 0, 0.04))',
                border: '1px solid var(--border-default, rgba(0, 0, 0, 0.08))',
                width: '100%',
                textAlign: 'left',
                justifyContent: 'flex-start',
                paddingLeft: 'var(--spacing-size-xl)',
                height: '52px',
                borderRadius: '12px'
              }}
            />
          </Flex>

          {/* Instrument Search */}
          <Flex direction="column" gap={8}>
            <Typography.Label>{t('order.instrument')}</Typography.Label>
            <SearchInput
              value={searchQuery}
              onChange={(e) => {
                autoSelectRef.current = false;
                setSearchQuery(e.target.value);
              }}
              placeholder={t('common.search_placeholder')}
            />

            {/* Search Results */}
            {searchLoading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
                <div className="spinner" style={{
                  width: '24px',
                  height: '24px',
                  border: '3px solid rgba(0,0,0,0.1)',
                  borderLeftColor: 'var(--text-primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <style>{`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}</style>
              </div>
            )}
            {instrumentsList.length > 0 && (
              <div
                style={{
                  background: 'var(--background-surface-card)',
                  borderRadius: '12px',
                  padding: '8px',
                  border: '1px solid var(--stroke-separator-primary)'
                }}
              >
                {instrumentsList.map(inst => (
                  <div
                    key={`${inst.exchange}:${inst.symbol}:${inst.board ?? inst.primary_board}`}
                    onClick={() => handleSelectInstrument(inst)}
                    style={{
                      padding: '8px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--stroke-separator-primary)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <b>{inst.symbol}</b> ({inst.exchange}) - {inst.shortname}
                  </div>
                ))}
              </div>
            )}
          </Flex>
        </Flex>
      </div>

      {selectedInstrument && (
        <Flex direction="column" gap={16} style={{ width: '100%' }}>
          <div style={{ ...cardStyle, padding: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Typography.Label style={{ fontSize: '10px', color: 'gray' }}>{t('common.symbol')}</Typography.Label>
                <Typography.Body style={{ fontWeight: 600, fontSize: '14px' }}>{selectedInstrument.symbol}</Typography.Body>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Typography.Label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{t('common.exchange')}</Typography.Label>
                <Typography.Body style={{ fontSize: '14px' }}>{selectedInstrument.exchange}</Typography.Body>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Typography.Label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{t('common.board')}</Typography.Label>
                <Typography.Body style={{ fontSize: '14px' }}>{selectedInstrument.primary_board}</Typography.Body>
              </div>
              <div style={{ gridColumn: 'span 3' }}>
                <Typography.Label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{selectedInstrument.shortname}</Typography.Label>
              </div>
            </div>

            <PriceHistoryChart instrument={selectedInstrument} />

            {quote ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <Typography.Label style={{ fontSize: '11px', display: 'block' }}>{t('common.last_price')}</Typography.Label>
                  <Typography.Body style={{ fontWeight: 600 }}>{quote.last_price}</Typography.Body>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <Typography.Label style={{ fontSize: '11px', display: 'block' }}>{t('common.change')}</Typography.Label>
                  <Typography.Body style={{ color: quote.change >= 0 ? '#4ade80' : '#ef4444' }}>
                    {quote.change > 0 ? '+' : ''}{quote.change} ({quote.change_percent}%)
                  </Typography.Body>
                </div>

                <div>
                  <Typography.Label style={{ fontSize: '11px', display: 'block', color: 'gray' }}>{t('common.bid')}</Typography.Label>
                  <Typography.Body style={{ color: '#4ade80' }}>{quote.bid}</Typography.Body>
                </div>
                <div>
                  <Typography.Label style={{ fontSize: '11px', display: 'block', color: 'gray' }}>{t('common.ask')}</Typography.Label>
                  <Typography.Body style={{ color: '#ef4444' }}>{quote.ask}</Typography.Body>
                </div>
                <div></div>

                <div><Typography.Label style={{ fontSize: '11px', display: 'block' }}>{t('common.open')}</Typography.Label><Typography.Body>{quote.open_price}</Typography.Body></div>
                <div><Typography.Label style={{ fontSize: '11px', display: 'block' }}>{t('common.high')}</Typography.Label><Typography.Body>{quote.high_price}</Typography.Body></div>
                <div><Typography.Label style={{ fontSize: '11px', display: 'block' }}>{t('common.low')}</Typography.Label><Typography.Body>{quote.low_price}</Typography.Body></div>
              </div>
            ) : (
              <Typography.Body style={{ textAlign: 'center', color: 'gray', fontSize: '12px' }}>{t('common.loading_market_data')}</Typography.Body>
            )}
          </div>

          <div style={cardStyle}>
            <Flex direction="column" gap={16} style={{ width: '100%' }}>
              <SegmentedControl
                options={[
                  { label: t('common.limit'), value: 'Limit' },
                  { label: t('common.market'), value: 'Market' }
                ]}
                value={orderType}
                onChange={setOrderType}
              />

              <Flex gap={8} style={{ width: '100%' }}>
                <Button
                  style={{
                    flex: 1,
                    background: side === Side.Buy ? '#4ade80' : '#eee',
                    color: side === Side.Buy ? 'black' : 'gray',
                    border: 'none'
                  }}
                  onClick={() => setSide(Side.Buy)}
                >
                  {t('common.buy')}
                </Button>
                <Button
                  style={{
                    flex: 1,
                    background: side === Side.Sell ? '#ef4444' : '#eee',
                    color: side === Side.Sell ? 'white' : 'gray',
                    border: 'none'
                  }}
                  onClick={() => setSide(Side.Sell)}
                >
                  {t('common.sell')}
                </Button>
              </Flex>

              {orderType === 'Limit' && (
                <Flex direction="column" gap={8}>
                  <Typography.Label>{t('common.price')}</Typography.Label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    step={selectedInstrument.minstep}
                    style={{ width: '100%' }}
                  />
                </Flex>
              )}

              <Flex direction="column" gap={8}>
                <Typography.Label>{t('common.quantity')} ({t('common.lots')})</Typography.Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  step="1"
                  style={{ width: '100%' }}
                />
                <Typography.Label style={{ color: 'gray', fontSize: '12px' }}>
                  {t('common.lot_size')}: {selectedInstrument.lotsize ?? 1}
                </Typography.Label>
              </Flex>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  marginTop: '8px',
                  width: '100%',
                  background: 'var(--button-primary-background, #007aff)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 600
                }}
              >
                {loading ? t('order.submitting') : (side === Side.Buy ? t('order.submit_buy_order') : t('order.submit_sell_order'))}
              </Button>
            </Flex>
          </div>
        </Flex>
      )}
    </ModalPageLayout>
  );
};
