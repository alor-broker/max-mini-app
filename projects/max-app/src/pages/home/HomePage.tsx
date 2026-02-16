import React, { useState, useEffect } from 'react';
import { Panel, Grid, Container, Flex, Typography, Button } from '@maxhub/max-ui';
import { useAuth } from '../../auth/AuthContext';
import { ClientService, ClientPortfolio } from '../../api/services';
import { PortfolioSelector } from './PortfolioSelector';
import { PortfolioEvaluation } from './PortfolioEvaluation';
import { InvestmentIdeasPreview } from './InvestmentIdeasPreview';
import { OrdersList } from './OrdersList';
import { PositionsList } from './PositionsList';
import { TradesList } from './TradesList';

// Placeholder components for sections
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Container style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
    <Flex justify="space-between" align="center" style={{ marginBottom: '12px' }}>
      <Typography.Headline>{title}</Typography.Headline>
      <Button style={{ background: 'transparent', color: '#0a84ff', border: 'none' }}>View All</Button>
    </Flex>
    {children}
  </Container>
);

export const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [portfolios, setPortfolios] = useState<ClientPortfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<ClientPortfolio | null>(null);

  useEffect(() => {
    if (user?.clientId) {
      ClientService.getPortfolios(user.clientId)
        .then(data => {
          setPortfolios(data);
          if (data.length > 0) {
            setSelectedPortfolio(data[0]);
          }
        })
        .catch(console.error);
    }
  }, [user]);

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
                onSelect={setSelectedPortfolio}
              />
              <Button onClick={logout} style={{ color: 'white', borderColor: 'white' }}>Logout</Button>
            </Flex>

            <PortfolioEvaluation portfolio={selectedPortfolio} />
          </Flex>
        </Container>

        {/* Investment Ideas */}
        <Section title="Investment Ideas">
          <InvestmentIdeasPreview />
        </Section>

        {/* Orders */}
        <Section title="Active Orders">
          <OrdersList portfolio={selectedPortfolio} />
        </Section>

        {/* Portfolio Positions */}
        <Section title="Positions">
          <PositionsList portfolio={selectedPortfolio} />
        </Section>

        {/* Trades */}
        <Section title="Trades today">
          <TradesList portfolio={selectedPortfolio} />
        </Section>
      </Grid>
    </Panel>
  );
};
