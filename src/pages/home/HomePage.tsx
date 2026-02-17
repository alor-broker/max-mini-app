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
        .then(data => {
          setPortfolios(data);

          // Restore selection from storage or default to first
          const savedPortfolioId = storageManager.getItem('MAX_APP_SELECTED_PORTFOLIO');
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

  const handlePortfolioSelect = (p: ClientPortfolio) => {
    setSelectedPortfolio(p);
    storageManager.setItem('MAX_APP_SELECTED_PORTFOLIO', p.portfolio);
  };

  return (
    <Panel>
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

            <PortfolioEvaluation portfolio={selectedPortfolio} />

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
          <OrdersList portfolio={selectedPortfolio} />
        </Section>

        {/* Portfolio Positions */}
        <Section title={t('home.positions')}>
          <PositionsList portfolio={selectedPortfolio} />
        </Section>

        {/* Trades */}
        <Section title={t('home.trades_today')}>
          <TradesList portfolio={selectedPortfolio} />
        </Section>
      </Grid>
    </Panel>
  );
};
