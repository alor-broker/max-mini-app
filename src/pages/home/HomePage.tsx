import React, { useState, useEffect } from 'react';
import { Panel, Grid, Container, Flex, Typography, Spinner } from '@maxhub/max-ui';
import { useAuth } from '../../auth/AuthContext';
import { storageManager } from '../../utils/storage-manager';
import { ClientService, ClientPortfolio, PortfolioSummary, PortfolioOrder, PortfolioPosition, PortfolioTrade, PortfolioService, OrderStatus } from '../../api/services';
import { PortfolioSelector } from './PortfolioSelector';
import { PortfolioEvaluation } from './PortfolioEvaluation';
import { OrdersList } from './OrdersList';
import { PositionsList } from './PositionsList';
import { TradesList } from './TradesList';
import { CompletedOrdersList } from './CompletedOrdersList';
import { HomeActions } from './HomeActions';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { IconLogout, HeaderBackgroundWave } from '../../components/Icons';

// Placeholder components for sections
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Container style={{
    marginBottom: '18px',
    padding: '18px 16px',
    background: 'rgba(255, 255, 255, 0.82)',
    border: '1px solid rgba(17, 24, 39, 0.08)',
    borderRadius: '16px',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
    backdropFilter: 'blur(6px)'
  }}>
    <Flex justify="space-between" align="center" style={{ marginBottom: '12px' }}>
      <Typography.Headline style={{ fontSize: '24px', lineHeight: 1.2 }}>{title}</Typography.Headline>
    </Flex>
    {children}
  </Container>
);

export const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
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

  const handlePortfolioSelect = async (p: ClientPortfolio) => {
    setSelectedPortfolio(p);
    await storageManager.setItem('MAX_APP_SELECTED_PORTFOLIO', p.portfolio);
  };

  // Pull to refresh logic
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(0);

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
    if (window.scrollY === 0) {
      setTouchStart(e.targetTouches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touchY = e.targetTouches[0].clientY;
    if (window.scrollY === 0 && touchY - touchStart > 100 && !isRefreshing) {
      refreshData();
    }
  };

  return (
    <Panel
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, rgba(102, 126, 234, 0.08) 0%, rgba(248, 250, 252, 1) 35%)',
        padding: '8px 0 18px'
      }}
    >
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
          <Grid gap={18} cols={1}>
            {/* Header / Portfolio Summary */}
            <Container style={{
              padding: '14px 16px 12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '16px',
              position: 'relative',
              overflow: 'visible',
              boxShadow: '0 16px 30px rgba(76, 81, 191, 0.24)'
            }}>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.2 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '56px', background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)' }} />
              </div>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', opacity: 0.7 }}>
                <HeaderBackgroundWave />
              </div>
              <Flex direction="column" gap={16} style={{ position: 'relative', zIndex: 1 }}>

                <Flex justify="space-between" align="center" style={{
                  width: '100%',
                  position: 'sticky',
                  top: '8px',
                  zIndex: 8,
                  padding: '6px 4px',
                  borderRadius: '12px',
                  background: 'rgba(69, 47, 129, 0.16)',
                  backdropFilter: 'blur(4px)'
                }}>
                  <PortfolioSelector
                    portfolios={portfolios}
                    selectedPortfolio={selectedPortfolio}
                    onSelect={handlePortfolioSelect}
                    triggerStyle={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                  />
                  <Flex gap={12} align="center" style={{ marginLeft: 'auto', minHeight: '40px' }}>
                    <LanguageSwitcher />
                    <Flex
                      onClick={logout}
                      gap={8}
                      align="center"
                      justify="end"
                      style={{ cursor: 'pointer', color: 'white' }}
                      title={t('common.logout')}
                    >
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{t('common.logout')}</span>
                      <IconLogout />
                    </Flex>
                  </Flex>
                </Flex>

                <PortfolioEvaluation data={summary} />

                <Flex justify="center" style={{ marginTop: '4px', width: '100%' }}>
                  <HomeActions portfolio={selectedPortfolio} refreshTrigger={refreshData} activeOrdersCount={activeOrders.length} />
                </Flex>
              </Flex>
            </Container>

            {/* Investment Ideas (API not implemented yet) */}
            {/* <Section title={t('home.investment_ideas')}>
          <InvestmentIdeasPreview />
        </Section> */}

            {/* Orders */}
            <Section title={t('home.active_orders')}>
              <OrdersList orders={activeOrders} />
            </Section>

            {/* Portfolio Positions */}
            <Section title={t('home.positions')}>
              <PositionsList positions={positions} portfolio={selectedPortfolio} />
            </Section>

            {/* Trades */}
            <Section title={t('home.trades_today')}>
              <TradesList trades={trades} />
            </Section>

            {/* Completed Orders */}
            <Section title={t('home.completed_orders')}>
              <CompletedOrdersList orders={completedOrders} />
            </Section>
          </Grid>
        </>
      )}
    </Panel>
  );
};
