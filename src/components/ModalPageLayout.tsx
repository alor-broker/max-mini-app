import React from 'react';
import { Button, Flex, Panel, Typography } from '@maxhub/max-ui';

interface ModalPageLayoutProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
  header?: React.ReactNode;
  contentGap?: number;
  padding?: string;
  background?: string;
}

export const ModalPageLayout: React.FC<ModalPageLayoutProps> = ({
  children,
  title,
  onBack,
  backLabel,
  header,
  contentGap = 16,
  padding = '16px',
  background = 'var(--background-surface-primary)',
}) => {
  const defaultHeader = (title && onBack) ? (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Button onClick={onBack} style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none' }}>
          &lt; {backLabel}
        </Button>
      </div>
      <Typography.Headline style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{title}</Typography.Headline>
      <div />
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
