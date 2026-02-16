import React, { useEffect, useState } from 'react';
import { Flex, Typography, Grid } from '@maxhub/max-ui';
import { InvestmentIdeasService, InvestmentIdea } from '../../api/services';

export const InvestmentIdeasPreview: React.FC = () => {
  const [latestIdea, setLatestIdea] = useState<InvestmentIdea | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    InvestmentIdeasService.getInvestmentIdeas({ orderBy: 'timestamp', valid: true })
      .then(ideas => {
        if (ideas.length > 0) {
          setLatestIdea(ideas[ideas.length - 1]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!latestIdea) {
    return <Typography.Body>No active investment ideas</Typography.Body>;
  }

  const isBuy = latestIdea.type === 'buy';
  const actionColor = isBuy ? '#4ade80' : '#ef4444';

  return (
    <Grid gap={8} cols={1}>
      <div style={{ padding: '4px 0' }}>
        <Flex justify="space-between" align="center" style={{ cursor: 'pointer' }}>
          <Flex direction="column">
            <Typography.Body style={{ fontWeight: 600 }}>
              {latestIdea.symbol}
            </Typography.Body>
            <Typography.Label style={{ color: 'gray' }}>
              {latestIdea.comment}
            </Typography.Label>
          </Flex>

          <div style={{
            padding: '4px 8px',
            borderRadius: '4px',
            background: actionColor,
            color: 'white',
            fontWeight: 'bold',
            fontSize: '12px'
          }}>
            {latestIdea.type.toUpperCase()}
          </div>
        </Flex>
      </div>
    </Grid>
  );
};
