import React from 'react';
import { Input, Button, Flex } from '@maxhub/max-ui';

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder }) => {
  return (
    <Flex gap={8} style={{ width: '100%' }}>
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ flex: 1 }}
      />
    </Flex>
  );
}
