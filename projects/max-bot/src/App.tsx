import React from 'react';
import {
  Panel,
  Grid,
  Container,
  Flex,
  Avatar,
  Typography,
  Button
} from '@maxhub/max-ui';
import './App.css';

function App() {
  // Mock data for now since we removed the bridge
  const user = {
    login: 'Max User',
    clientId: '1234567'
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  return (
    <Panel mode="secondary" className="app-panel">
      <Grid gap={12} cols={1}>
        <Container className="profile-section">
          <Flex direction="column" align="center" gap={12}>
            <Avatar.Container size={96} form="squircle">
              <Avatar.Image src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.login}`} />
            </Avatar.Container>

            <div style={{ textAlign: 'center' }}>
              <Typography.Title variant="large-strong">{user.login}</Typography.Title>
              <Typography.Body>Client ID: {user.clientId}</Typography.Body>
            </div>
          </Flex>
        </Container>

        <Container>
          <Typography.Title variant="medium-strong">Dashboard</Typography.Title>
          <div style={{ margin: '12px 0', borderBottom: '1px solid var(--max-ui-border-primary)' }} />

          <Grid gap={8} cols={2}>
            <Panel mode="primary" style={{ padding: 12 }}>
              <Typography.Label>Status</Typography.Label>
              <Typography.Body style={{ fontWeight: 'bold', color: '#4CAF50' }}>Connected</Typography.Body>
            </Panel>
            <Panel mode="primary" style={{ padding: 12 }}>
              <Typography.Label>Region</Typography.Label>
              <Typography.Body style={{ fontWeight: 'bold' }}>Russia</Typography.Body>
            </Panel>
          </Grid>
        </Container>

        <Container style={{ marginTop: 20 }}>
          <Button
            stretched
            mode="primary"
            appearance="negative"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Container>
      </Grid>
    </Panel>
  );
}

export default App;
