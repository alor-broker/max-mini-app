import React, { useState, useEffect } from 'react';
import { Panel, Grid, Container, Flex, Typography, Button, Spinner } from '@maxhub/max-ui';
import { useAuth } from '../../auth/AuthContext';
import { storageManager } from '../../utils/storage-manager';
import { ClientService, ClientPortfolio, PortfolioSummary, PortfolioOrder, PortfolioPosition, PortfolioTrade, PortfolioService, OrderStatus, Instrument, InstrumentsService } from '../../api/services';
import { PortfolioSelector } from './PortfolioSelector';
import { PortfolioEvaluation } from './PortfolioEvaluation';
import { InvestmentIdeasPreview } from './InvestmentIdeasPreview';
import { OrdersList } from './OrdersList';
import { PositionsList } from './PositionsList';
import { TradesList } from './TradesList';
import { CompletedOrdersList } from './CompletedOrdersList';
import { HomeActions } from './HomeActions';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { IconLogout, HeaderBackgroundWave } from '../../components/Icons';
import { useLogoutAction } from '../../auth/useLogoutAction';

// Placeholder components for sections
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Container style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '16px' }}>
    <Flex justify="space-between" align="center" style={{ marginBottom: '12px' }}>
      <Typography.Headline>{title}</Typography.Headline>
    </Flex>
    {children}
  </Container>
);

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { runLogout, isLoggingOut } = useLogoutAction();
  const { t } = useTranslation();
  const [portfolios, setPortfolios] = useState<ClientPortfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<ClientPortfolio | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Data states
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [activeOrders, setActiveOrders] = useState<PortfolioOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<PortfolioOrder[]>([]);
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [trades, setTrades] = useState<PortfolioTrade[]>([]);
  const [instruments, setInstruments] = useState<Record<string, Instrument>>({});

  useEffect(() => {
    if (user?.clientId && user?.login) {
      setIsInitialLoading(true);
      ClientService.getActivePortfolios(user.clientId, user.login)
        .then(async (data) => {
          setPortfolios(data);

          const savedPortfolioId = await storageManager.getItem('MAX_APP_SELECTED_PORTFOLIO');
          let portfolioToSelect = data.length > 0 ? data[0] : null;

          if (savedPortfolioId) {
            const found = data.find(p => p.portfolio === savedPortfolioId);
            if (found) {
              portfolioToSelect = found;
            }
          }

          setSelectedPortfolio(portfolioToSelect);
          // Data will be fetched by the effect below when selectedPortfolio changes
        })
        .catch(console.error)
        .finally(() => setIsInitialLoading(false));
    } else {
      setIsInitialLoading(false);
    }
  }, [user]);

  // Fetch data when selected portfolio changes
  useEffect(() => {
    if (!selectedPortfolio) return;
    fetchAllData(selectedPortfolio);
  }, [selectedPortfolio]);

  const fetchAllData = async (portfolio: ClientPortfolio) => {
    try {
      const [sum, ords, pos, trds] = await Promise.all([
        PortfolioService.getSummary(portfolio.exchange, portfolio.portfolio),
        PortfolioService.getOrders(portfolio.exchange, portfolio.portfolio),
        PortfolioService.getPositions(portfolio.exchange, portfolio.portfolio),
        PortfolioService.getTrades(portfolio.exchange, portfolio.portfolio)
      ]);

      setSummary(sum);
      setActiveOrders(ords.filter(o => o.status === OrderStatus.Working));
      // Filter completed orders (not working) and sort by time desc
      const completed = ords.filter(o => o.status !== OrderStatus.Working);
      completed.sort((a, b) => b.transTime.getTime() - a.transTime.getTime());
      setCompletedOrders(completed);

      setPositions(pos);
      setTrades(trds);
    } catch (e) {
      console.error("Failed to fetch portfolio data", e);
    }
  };

  // Fetch instruments details for rounding
  useEffect(() => {
    const fetchInstruments = async () => {
      const itemsToFetch = new Set<string>();

      const addItem = (exchange: string, symbol: string) => {
        const key = `${exchange}:${symbol}`;
        if (!instruments[key]) {
          itemsToFetch.add(JSON.stringify({ exchange, symbol }));
        }
      };

      activeOrders.forEach(o => addItem(o.exchange, o.symbol));
      completedOrders.forEach(o => addItem(o.exchange, o.symbol));
      positions.forEach(p => {
        if (!p.isCurrency) {
          addItem(p.exchange, p.symbol);
        }
      });
      trades.forEach(t => addItem(t.exchange, t.symbol));

      if (itemsToFetch.size === 0) return;

      const uniqueItems = Array.from(itemsToFetch).map(json => JSON.parse(json));

      try {
        const newInstruments = await InstrumentsService.getInstruments(uniqueItems);

        setInstruments(prev => {
          const next = { ...prev };
          newInstruments.forEach((inst) => {
            if (inst) {
              next[`${inst.exchange}:${inst.symbol}`] = inst;
            }
          });
          return next;
        });
      } catch (e) {
        console.error("Failed to fetch instruments", e);
      }
    };

    fetchInstruments();
  }, [activeOrders, completedOrders, positions, trades, instruments]);

  const handlePortfolioSelect = async (p: ClientPortfolio) => {
    setSelectedPortfolio(p);
    await storageManager.setItem('MAX_APP_SELECTED_PORTFOLIO', p.portfolio);
  };

  // Pull to refresh logic
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartRef = React.useRef<number | null>(null);
  const shouldHandlePullRef = React.useRef(false);

  const isInteractiveTouchTarget = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return false;
    return Boolean(
      target.closest('button, a, input, select, textarea, [role="button"], [data-no-pull-refresh="true"]')
    );
  };

  const refreshData = async () => {
    setIsRefreshing(true);

    // 1. Refresh portfolios list
    if (user?.clientId && user?.login) {
      try {
        const data = await ClientService.getActivePortfolios(user.clientId, user.login);
        setPortfolios(data);

        // 2. Refresh current portfolio data
        if (selectedPortfolio) {
          // Check if selected portfolio still exists
          const found = data.find(p => p.portfolio === selectedPortfolio.portfolio);
          if (found) {
            // Update selected portfolio object if needed (though mostly just need ID)
            // And fetch data
            await fetchAllData(found);
          } else if (data.length > 0) {
            setSelectedPortfolio(data[0]); // This will trigger useEffect to fetch
          }
        } else if (data.length > 0) {
          setSelectedPortfolio(data[0]);
        }
      } catch (e) {
        console.error(e);
      }
    }

    setIsRefreshing(false);
  };



  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY !== 0 || isRefreshing || isInteractiveTouchTarget(e.target)) {
      shouldHandlePullRef.current = false;
      touchStartRef.current = null;
      return;
    }

    shouldHandlePullRef.current = true;
    touchStartRef.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!shouldHandlePullRef.current || touchStartRef.current === null || isRefreshing) {
      return;
    }

    const touchY = e.targetTouches[0].clientY;
    if (window.scrollY === 0 && touchY - touchStartRef.current > 100) {
      shouldHandlePullRef.current = false;
      void refreshData();
    }
  };

  const handleTouchEnd = () => {
    shouldHandlePullRef.current = false;
    touchStartRef.current = null;
  };

  // Scroll tracking for sticky header
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const headerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const headerHeight = headerRef.current.offsetHeight;
        // Show sticky header when scrolled past 80% of the purple header or a fixed amount
        setShowStickyHeader(window.scrollY > headerHeight - 60);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check immediately

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isInitialLoading]);

  return (
    <Panel
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ minHeight: '100vh', position: 'relative' }}
    >
      {/* Sticky Header */}
      <div style={{
        position: 'fixed',
        top: '12px',
        left: '16px',
        right: '16px',
        zIndex: 1000,
        padding: '10px 16px',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
        backdropFilter: 'blur(12px)',
        borderRadius: '100px', // Fully round capsule shape
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: showStickyHeader ? 'translateY(0)' : 'translateY(-100px)',
        opacity: showStickyHeader ? 1 : 0,
        pointerEvents: showStickyHeader ? 'auto' : 'none',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
      }}>
        <PortfolioSelector
          portfolios={portfolios}
          selectedPortfolio={selectedPortfolio}
          onSelect={handlePortfolioSelect}
          triggerStyle={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', fontSize: '14px', padding: '4px 12px', height: '32px' }}
        />
        <Flex gap={12} align="center">
          <LanguageSwitcher />
                      <Flex
                        onClick={() => { void runLogout(); }}
                        gap={8}
                        align="center"
                        justify="end"
                        data-no-pull-refresh="true"
                        style={{ cursor: 'pointer', color: 'white' }}
                        title={t('common.logout')}
                      >
            {isLoggingOut ? <Spinner /> : <IconLogout width={20} height={20} />}
          </Flex>
        </Flex>
      </div>

      {isInitialLoading ? (
        <Flex align="center" justify="center" style={{ height: '100vh', width: '100%' }}>
          <Spinner />
        </Flex>
      ) : (
        <>
          {isRefreshing && (
            <Flex justify="center" style={{ padding: '10px', background: 'var(--background-surface-secondary)' }}>
              <Spinner />
            </Flex>
          )}
          <Grid gap={16} cols={1}>
            {/* Header / Portfolio Summary */}
            <div ref={headerRef}>
              <Container style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '16px', position: 'relative', overflow: 'visible' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
                  <HeaderBackgroundWave />
                </div>
                <Flex direction="column" gap={16} style={{ position: 'relative', zIndex: 1 }}>

                  <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                    <PortfolioSelector
                      portfolios={portfolios}
                      selectedPortfolio={selectedPortfolio}
                      onSelect={handlePortfolioSelect}
                      triggerStyle={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                    />
                    <Flex gap={12} align="center" style={{ marginLeft: 'auto' }}>
                      <LanguageSwitcher />
                      <Flex
                        onClick={() => { void runLogout(); }}
                        gap={8}
                        align="center"
                        justify="end"
                        data-no-pull-refresh="true"
                        style={{ cursor: 'pointer', color: 'white' }}
                        title={t('common.logout')}
                      >
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>
                          {isLoggingOut ? t('common.loading') : t('common.logout')}
                        </span>
                        {isLoggingOut ? <Spinner /> : <IconLogout />}
                      </Flex>
                    </Flex>
                  </Flex>

                  <PortfolioEvaluation data={summary} />

                  <Flex justify="center" style={{ marginTop: '2px', width: '100%' }}>
                    <Flex justify="center" style={{ marginTop: '2px', width: '100%' }}>
                      <HomeActions portfolio={selectedPortfolio} refreshTrigger={refreshData} activeOrdersCount={activeOrders.length} />
                    </Flex>
                  </Flex>
                </Flex>
              </Container>
            </div>

            {/* Investment Ideas (API not implemented yet) */}
            {/* <Section title={t('home.investment_ideas')}>
          <InvestmentIdeasPreview />
        </Section> */}

            {/* Orders */}
            <Section title={t('home.active_orders')}>
              <OrdersList orders={activeOrders} instruments={instruments} />
            </Section>

            {/* Portfolio Positions */}
            <Section title={t('home.positions')}>
              <PositionsList positions={positions} portfolio={selectedPortfolio} instruments={instruments} />
            </Section>

            {/* Trades */}
            <Section title={t('home.trades_today')}>
              <TradesList trades={trades} instruments={instruments} />
            </Section>

            {/* Completed Orders */}
            <Section title={t('home.completed_orders')}>
              <CompletedOrdersList orders={completedOrders} instruments={instruments} />
            </Section>
          </Grid>
        </>
      )}
    </Panel>
  );
};
