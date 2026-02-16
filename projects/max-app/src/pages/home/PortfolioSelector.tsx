import React, { useState } from 'react';
import { Button, Typography, Panel, Grid, Container } from '@maxhub/max-ui';
import { ClientPortfolio } from '../../api/services';

interface PortfolioSelectorProps {
  portfolios: ClientPortfolio[];
  selectedPortfolio: ClientPortfolio | null;
  onSelect: (portfolio: ClientPortfolio) => void;
}

export const PortfolioSelector: React.FC<PortfolioSelectorProps> = ({ portfolios, selectedPortfolio, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (portfolios.length === 0) {
    return <Typography.Body>No portfolios</Typography.Body>;
  }

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleSelect = (p: ClientPortfolio) => {
    onSelect(p);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <Button onClick={toggleOpen} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
        {selectedPortfolio ? `${selectedPortfolio.portfolio} (${selectedPortfolio.exchange})` : 'Select Portfolio'}
      </Button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          zIndex: 10,
          background: '#2c2c2e',
          border: '1px solid #3a3a3c',
          borderRadius: '8px',
          padding: '8px',
          minWidth: '200px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          marginTop: '4px'
        }}>
          <Grid gap={4} cols={1}>
            {portfolios.map(p => (
              <div
                key={`${p.exchange}-${p.portfolio}`}
                onClick={() => handleSelect(p)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  background: selectedPortfolio?.portfolio === p.portfolio ? 'rgba(255,255,255,0.1)' : 'transparent',
                  borderRadius: '6px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.background = selectedPortfolio?.portfolio === p.portfolio ? 'rgba(255,255,255,0.1)' : 'transparent'}
              >
                {/* Manually style typography since MAX_UI might default to black */}
                <div style={{ color: 'white', fontWeight: 500, fontSize: '14px' }}>
                  {p.portfolio}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
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
