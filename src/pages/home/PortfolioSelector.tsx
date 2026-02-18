import React, { useEffect, useRef, useState } from 'react';
import { Button, Typography, Grid } from '@maxhub/max-ui';
import { ClientPortfolio } from '../../api/services';
import { useTranslation } from 'react-i18next';

interface PortfolioSelectorProps {
  portfolios: ClientPortfolio[];
  selectedPortfolio: ClientPortfolio | null;
  onSelect: (portfolio: ClientPortfolio) => void;
  triggerStyle?: React.CSSProperties;
}

export const PortfolioSelector: React.FC<PortfolioSelectorProps> = ({ portfolios, selectedPortfolio, onSelect, triggerStyle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  if (portfolios.length === 0) {
    return <Typography.Body>{t('order.no_portfolios')}</Typography.Body>;
  }

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleSelect = (p: ClientPortfolio) => {
    onSelect(p);
    setIsOpen(false);
  };

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <Button
        onClick={toggleOpen}
        style={{
          minHeight: '40px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          color: 'inherit',
          ...triggerStyle
        }}
      >
        {selectedPortfolio ? `${selectedPortfolio.portfolio} (${selectedPortfolio.exchange})` : t('order.select_portfolio')}
      </Button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          zIndex: 24,
          background: 'rgba(255, 255, 255, 0.98)',
          border: '1px solid rgba(15, 23, 42, 0.1)',
          borderRadius: '12px',
          padding: '8px',
          minWidth: '240px',
          maxHeight: '300px',
          overflowY: 'auto',
          boxShadow: '0 20px 36px rgba(15, 23, 42, 0.18)',
          marginTop: '6px'
        }}>
          <Grid gap={6} cols={1}>
            {portfolios.map(p => (
              <div
                key={`${p.exchange}-${p.portfolio}`}
                onClick={() => handleSelect(p)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  background: selectedPortfolio?.portfolio === p.portfolio ? 'var(--background-accent-neutral-fade)' : 'transparent',
                  borderRadius: '8px',
                  transition: 'background 0.18s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--states-background-hovered-neutral-fade)'}
                onMouseLeave={(e) => e.currentTarget.style.background = selectedPortfolio?.portfolio === p.portfolio ? 'var(--background-accent-neutral-fade)' : 'transparent'}
              >
                {/* Manually style typography since MAX_UI might default to black */}
                <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '14px' }}>
                  {p.portfolio}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                  {p.exchange}
                </div>
              </div>
            ))}
          </Grid>
        </div>
      )}
    </div>
  );
};
