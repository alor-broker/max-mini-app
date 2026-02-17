import React, { useState, useEffect } from 'react';
import { Panel, Grid, Container, Flex, Typography, Button, Spinner } from '@maxhub/max-ui';
import { useAuth } from '../../auth/AuthContext';
import { storageManager } from '../../utils/storage-manager';
import { ClientService, ClientPortfolio, PortfolioSummary, PortfolioOrder, PortfolioPosition, PortfolioTrade, PortfolioService, OrderStatus } from '../../api/services';
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
          <Grid gap={16} cols={1}>
            {/* Header / Portfolio Summary */}
            <Container style={{ padding: '24px 16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '16px' }}>
              <Flex direction="column" gap={16}>

                <Flex justify="space-between" align="center">
                  <PortfolioSelector
                    portfolios={portfolios}
                    selectedPortfolio={selectedPortfolio}
                    onSelect={handlePortfolioSelect}
                    triggerStyle={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                  />
                  <Flex gap={8}>
                    <LanguageSwitcher />
                    <Button onClick={logout} style={{ color: 'white', borderColor: 'white' }}>{t('common.logout')}</Button>
                  </Flex>
                </Flex>

                <PortfolioEvaluation data={summary} />

                <Flex justify="center" style={{ marginTop: '16px', width: '100%' }}>
                  <Flex justify="center" style={{ marginTop: '16px', width: '100%' }}>
                    <HomeActions portfolio={selectedPortfolio} refreshTrigger={refreshData} />
                  </Flex>
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
