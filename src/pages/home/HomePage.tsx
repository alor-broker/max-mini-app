import React, { useState, useEffect } from 'react';
import { Panel, Grid, Container, Flex, Typography, Button } from '@maxhub/max-ui';
import { useAuth } from '../../auth/AuthContext';
import { storageManager } from '../../utils/storage-manager';
import { ClientService, ClientPortfolio } from '../../api/services';
import { PortfolioSelector } from './PortfolioSelector';
import { PortfolioEvaluation } from './PortfolioEvaluation';
import { InvestmentIdeasPreview } from './InvestmentIdeasPreview';
import { OrdersList } from './OrdersList';
import { PositionsList } from './PositionsList';
import { TradesList } from './TradesList';
import { NewOrderButton } from './NewOrderButton';
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

  useEffect(() => {
    if (user?.clientId && user?.login) {
      ClientService.getActivePortfolios(user.clientId, user.login)
        .then(async (data) => {
          setPortfolios(data);

          // Restore selection from storage or default to first
          const savedPortfolioId = await storageManager.getItem('MAX_APP_SELECTED_PORTFOLIO');
          let portfolioToSelect = data.length > 0 ? data[0] : null;

          if (savedPortfolioId) {
            const found = data.find(p => p.portfolio === savedPortfolioId);
            if (found) {
              portfolioToSelect = found;
            }
          }

          setSelectedPortfolio(portfolioToSelect);
        })
        .catch(console.error);
    }
  }, [user]);

  const handlePortfolioSelect = async (p: ClientPortfolio) => {
    setSelectedPortfolio(p);
    await storageManager.setItem('MAX_APP_SELECTED_PORTFOLIO', p.portfolio);
  };

  // Pull to refresh logic
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(0);

  const refreshData = async () => {
    setIsRefreshing(true);
    // Re-fetch portfolio data
    if (user?.clientId && user?.login) {
      try {
        const data = await ClientService.getActivePortfolios(user.clientId, user.login);
        setPortfolios(data);

        // If we have a selected portfolio, ensure it's updated in the list or keep it
        if (selectedPortfolio) {
          const found = data.find(p => p.portfolio === selectedPortfolio.portfolio);
          if (found) setSelectedPortfolio(found);
        } else if (data.length > 0) {
          setSelectedPortfolio(data[0]);
        }
      } catch (e) {
        console.error(e);
      }
    }
    // Simulate a delay or wait for other components to update if they had ref methods
    // Since child components depend on 'selectedPortfolio' prop, they might need a signal to refetch.
    // For now, re-setting selectedPortfolio might trigger their useEffects if reference changes, 
    // but better is to just wait a bit to show the spinner. 
    // A more robust way is to have a 'refreshTrigger' prop passed down.

    // Actually, simply toggling a refresh trigger state is better.
    setRefreshTrigger(prev => prev + 1);

    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      {isRefreshing && (
        <Flex justify="center" style={{ padding: '10px', background: 'var(--background-surface-secondary)' }}>
          <Typography.Body>{t('common.loading')}</Typography.Body>
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

            <PortfolioEvaluation portfolio={selectedPortfolio} refreshTrigger={refreshTrigger} />

            <Flex justify="center" style={{ marginTop: '16px', width: '100%' }}>
              <NewOrderButton portfolio={selectedPortfolio} />
            </Flex>
          </Flex>
        </Container>

        {/* Investment Ideas (API not implemented yet) */}
        {/* <Section title={t('home.investment_ideas')}>
          <InvestmentIdeasPreview />
        </Section> */}

        {/* Orders */}
        <Section title={t('home.active_orders')}>
          <OrdersList portfolio={selectedPortfolio} refreshTrigger={refreshTrigger} />
        </Section>

        {/* Portfolio Positions */}
        <Section title={t('home.positions')}>
          <PositionsList portfolio={selectedPortfolio} refreshTrigger={refreshTrigger} />
        </Section>

        {/* Trades */}
        <Section title={t('home.trades_today')}>
          <TradesList portfolio={selectedPortfolio} refreshTrigger={refreshTrigger} />
        </Section>
      </Grid>
    </Panel>
  );
};
