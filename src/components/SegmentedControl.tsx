import React from 'react';
import { Button, Flex } from '@maxhub/max-ui';

interface SegmentedControlProps {
  options: (string | { label: string; value: string })[];
  value: string;
  onChange: (val: string) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange }) => {
  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  return (
    <Flex gap={4} style={{ background: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: '8px', width: '100%' }}>
      {normalizedOptions.map(opt => {
        const isSelected = opt.value === value;
        return (
          <Button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              fontWeight: isSelected ? 'bold' : 'normal',
              background: isSelected ? '#0a84ff' : 'transparent',
              color: isSelected ? 'white' : 'inherit',
              border: 'none',
              borderRadius: '6px'
            }}
          >
            {opt.label}
          </Button>
        )
      })}
    </Flex>
  );
}
