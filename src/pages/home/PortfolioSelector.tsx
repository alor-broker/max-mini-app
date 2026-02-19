import React, { useState } from 'react';
import { Button, Typography } from '@maxhub/max-ui';
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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (portfolios.length === 0) {
    return <Typography.Body>{t('order.no_portfolios')}</Typography.Body>;
  }

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleSelect = (p: ClientPortfolio) => {
    onSelect(p);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <Button onClick={toggleOpen} style={{ background: 'transparent', border: '1px solid var(--stroke-separator-primary)', color: 'inherit', ...triggerStyle }}>
        {selectedPortfolio ? `${selectedPortfolio.portfolio} (${selectedPortfolio.exchange})` : t('order.select_portfolio')}
      </Button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          zIndex: 10,
          background: 'var(--background-surface-floating)',
          border: '1px solid var(--stroke-separator-primary)',
          borderRadius: '8px',
          padding: '8px',
          minWidth: '200px',
          boxShadow: 'var(--shadow-elevation-3-primary)',
          marginTop: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {portfolios.map(p => (
            <div
              key={`${p.exchange}-${p.portfolio}`}
              onClick={() => handleSelect(p)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                background: selectedPortfolio?.portfolio === p.portfolio ? 'var(--background-accent-neutral-fade)' : 'transparent',
                borderRadius: '6px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--states-background-hovered-neutral-fade)'}
              onMouseLeave={(e) => e.currentTarget.style.background = selectedPortfolio?.portfolio === p.portfolio ? 'var(--background-accent-neutral-fade)' : 'transparent'}
            >
              <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '14px' }}>
                {p.portfolio}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                {p.exchange}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
