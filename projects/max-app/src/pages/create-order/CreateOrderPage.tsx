import React, { useState, useEffect } from 'react';
import { Panel, Grid, Container, Flex, Typography, Button, Input } from '@maxhub/max-ui';
import { useNavigate } from 'react-router-dom';
import {
  ClientService,
  ClientPortfolio,
  InstrumentsService,
  Instrument,
  OrdersService,
  Side,
  OrderType
} from '../../api/services';
import { useAuth } from '../../auth/AuthContext';
import { SearchInput } from '../../components/SearchInput';
import { SegmentedControl } from '../../components/SegmentedControl';
import { PortfolioSelector } from '../home/PortfolioSelector';
import { useTranslation } from 'react-i18next';

export const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  // State
  const [portfolios, setPortfolios] = useState<ClientPortfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<ClientPortfolio | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [instrumentsList, setInstrumentsList] = useState<Instrument[]>([]);

  // Order Form State
  // We use internal values for logic, but we need to map them for UI if SegmentedControl supports it.
  // Since we plan to update SegmentedControl to support objects, let's assume it handles {label, value}.
  // But for now, let's just stick to "Limit" and "Market" as internal values? 
  // No, let's assume we update SegmentedControl to accept objects.
  const [orderType, setOrderType] = useState<string>('Limit');

  const [side, setSide] = useState<Side>(Side.Buy);
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Initial Load
  useEffect(() => {
    if (user?.clientId) {
      ClientService.getPortfolios(user.clientId).then(data => {
        setPortfolios(data);
        if (data.length > 0) setSelectedPortfolio(data[0]);
      });
    }
  }, [user]);

  useEffect(() => {
    if (!searchQuery) {
      setInstrumentsList([]);
      return;
    }

    if (selectedInstrument && searchQuery === selectedInstrument.symbol) {
      return;
    }

    // Debounce search
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await InstrumentsService.searchInstruments({ query: searchQuery, limit: 10 });
        setInstrumentsList(results);
      } catch (e) {
        console.error(e);
      } finally {
        setSearchLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectInstrument = (inst: Instrument) => {
    setSelectedInstrument(inst);
    setInstrumentsList([]);
    setSearchQuery(inst.symbol);
    setPrice(inst.minstep.toString()); // Default price suggestion? Or just use minstep hint
  }

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

      navigate('/');
    } catch (e) {
      console.error("Order failed", e);
      alert(t('order.failed_submit'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel>
      <Container style={{ padding: '16px', maxWidth: '100%', margin: '0 auto' }}>
        <Flex direction="column" gap={24}>
          <Flex justify="space-between" align="center">
            <Button onClick={() => navigate('/')} style={{ background: 'transparent', color: '#333', border: 'none' }}>
              &lt; {t('common.back')}
            </Button>
            <Typography.Headline>{t('order.title')}</Typography.Headline>
            <div style={{ width: '60px' }}></div>
          </Flex>

          {/* Portfolio Selector */}
          <Flex direction="column" gap={8} style={{ width: '100%' }}>
            <Typography.Label>{t('order.portfolio')}</Typography.Label>
            <PortfolioSelector
              portfolios={portfolios}
              selectedPortfolio={selectedPortfolio}
              onSelect={setSelectedPortfolio}
              triggerStyle={{ color: '#333', borderColor: '#ccc', width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}
            />
          </Flex>

          {/* Instrument Search */}
          <Flex direction="column" gap={8}>
            <Typography.Label>{t('order.instrument')}</Typography.Label>
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.search_placeholder')}
            />

            {/* Search Results */}
            {searchLoading && <Typography.Body>{t('common.searching')}</Typography.Body>}
            {instrumentsList.length > 0 && (
              <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '8px', border: '1px solid #ddd' }}>
                {instrumentsList.map(inst => (
                  <div
                    key={inst.symbol}
                    onClick={() => handleSelectInstrument(inst)}
                    style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee', color: '#333' }}
                  >
                    <b>{inst.symbol}</b> - {inst.shortname}
                  </div>
                ))}
              </div>
            )}
          </Flex>

          {selectedInstrument && (
            <Flex direction="column" gap={16}>
              <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px' }}>
                <Typography.Body>{selectedInstrument.shortname}</Typography.Body>
                <Typography.Label style={{ color: 'gray' }}>{selectedInstrument.exchange} | {selectedInstrument.primary_board}</Typography.Label>
              </div>

              {/* Order Type Tabs */}
              {/* Note: I need to update SegmentedControl to handle labels vs values, or just use strings if I changed SegmentedControl. 
                  For now, I'll pass simple strings and let state be the localized string, BUT this breaks handleSubmit logic.
                  
                  Let's do this: I will conditionally render a manual control here OR update SegmentedControl.
                  I will update SegmentedControl in next step. For now I assume it takes options={[{label, value}]} and value={currentValue}. 
                  
                  Wait, to be safe, I'm passing objects to options now.
              */}
              <SegmentedControl
                options={[
                  { label: t('common.limit'), value: 'Limit' },
                  { label: t('common.market'), value: 'Market' }
                ]}
                value={orderType}
                onChange={setOrderType}
              />

              {/* Side Tabs */}
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

              {/* Price Input (Limit only) */}
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

              {/* Quantity Input */}
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

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={loading}
                style={{ marginTop: '16px', width: '100%' }}
              >
                {loading ? t('order.submitting') : (side === Side.Buy ? t('order.submit_buy_order') : t('order.submit_sell_order'))}
              </Button>
            </Flex>
          )}

        </Flex>
      </Container>
    </Panel>
  );
};
