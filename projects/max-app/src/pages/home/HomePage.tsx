import React, { useState } from 'react';
import { Panel, Grid, Container, Flex, Typography, Button, IconButton } from '@maxhub/max-ui';
import { useAuth } from '../../auth/AuthContext';

// Placeholder components for sections
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Container style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '12px' }}>
    <Flex justify="space-between" align="center" style={{ marginBottom: '12px' }}>
      <Typography.Headline>{title}</Typography.Headline>
      <Button>View All</Button>
    </Flex>
    {children}
  </Container>
);

export const HomePage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Panel>
      <Grid gap={16} cols={1}>
        {/* Header / Portfolio Summary */}
        <Container style={{ padding: '24px 16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '16px' }}>
          <Flex direction="column" gap={8}>
            <Flex justify="space-between" align="center">
              <Typography.Body style={{ color: 'rgba(255,255,255,0.8)' }}>Total Balance</Typography.Body>
              <Button onClick={logout} style={{ color: 'white' }}>Logout</Button>
            </Flex>
            <Typography.Display style={{ color: 'white' }}>$12,345.67</Typography.Display>
            <Flex gap={8}>
              <Typography.Body style={{ color: '#4ade80' }}>+2.5%</Typography.Body>
              <Typography.Body style={{ color: 'rgba(255,255,255,0.6)' }}>Today</Typography.Body>
            </Flex>
          </Flex>
        </Container>

        {/* Investment Ideas */}
        <Section title="Investment Ideas">
          <Flex direction="column" gap={12}>
            <div style={{ padding: '12px', background: 'white', borderRadius: '8px' }}>
              <Typography.Headline>Buy AAPL</Typography.Headline>
              <Typography.Body style={{ color: 'gray' }}>High growth potential with new AI features.</Typography.Body>
            </div>
            <div style={{ padding: '12px', background: 'white', borderRadius: '8px' }}>
              <Typography.Headline>Sell TSLA</Typography.Headline>
              <Typography.Body style={{ color: 'gray' }}>Overvalued at current levels.</Typography.Body>
            </div>
          </Flex>
        </Section>

        {/* Orders */}
        <Section title="Active Orders">
          <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
            <Flex justify="space-between">
              <Typography.Headline>NVDA</Typography.Headline>
              <Typography.Body>Buy Limit @ $800</Typography.Body>
            </Flex>
          </div>
        </Section>

        {/* Portfolio Positions */}
        <Section title="Positions">
          <div style={{ padding: '12px', background: 'white', borderRadius: '8px' }}>
            <Flex justify="space-between" align="center">
              <div>
                <Typography.Headline>Microsoft</Typography.Headline>
                <Typography.Label style={{ display: 'block', color: 'gray' }}>10 shares</Typography.Label>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Typography.Body>$4,200.00</Typography.Body>
                <Typography.Label style={{ display: 'block', color: '#4ade80' }}>+$200.00</Typography.Label>
              </div>
            </Flex>
          </div>
        </Section>

      </Grid>
    </Panel>
  );
};
