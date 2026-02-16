import React from 'react';
import { Panel, Grid, Container, Flex, Typography, Button } from '@maxhub/max-ui';
import { useAuth } from '../../auth/AuthContext';

export const UnlockPage: React.FC = () => {
  const { login } = useAuth();

  // Note: tg-app has a PIN code functionality. 
  // For the "Authorization Flow" initial implementation, we focus on the SSO Login.
  // The PIN code is a local security feature that could be added later.

  return (
    <Panel>
      <Grid gap={24} cols={1}>
        <Container>
          <Flex direction="column" align="center" gap={16}>
            <Typography.Headline>Welcome</Typography.Headline>
            <Typography.Body>Please log in to continue</Typography.Body>

            <Button
              onClick={login}
            >
              Login with Alor
            </Button>
          </Flex>
        </Container>
      </Grid>
    </Panel>
  );
};
