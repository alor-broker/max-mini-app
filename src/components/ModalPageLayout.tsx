import React from 'react';
import { Flex, Panel, Typography } from '@maxhub/max-ui';

interface ModalPageLayoutProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  header?: React.ReactNode;
  contentGap?: number;
  padding?: string;
  background?: string;
}

export const ModalPageLayout: React.FC<ModalPageLayoutProps> = ({
  children,
  title,
  header,
  contentGap = 16,
  padding = '16px',
  background = 'var(--background-surface-primary)',
}) => {
  const defaultHeader = title ? (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', paddingBottom: '16px' }}>
      <Typography.Headline style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{title}</Typography.Headline>
    </div>
  ) : null;

  return (
    <Panel style={{ minHeight: '100%', width: '100%', background }}>
      <div
        style={{
          padding,
          width: '100%',
          boxSizing: 'border-box',
          minHeight: '100%',
          background
        }}
      >
        <Flex direction="column" align="stretch" gap={contentGap} style={{ width: '100%' }}>
          {header ?? defaultHeader}
          {children}
        </Flex>
      </div>
    </Panel>
  );
};
