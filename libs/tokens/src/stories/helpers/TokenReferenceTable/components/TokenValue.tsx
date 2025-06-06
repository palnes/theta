import React from 'react';
import { formatValue } from '../utils/formatters';

interface TokenValueProps {
  value: any;
  type: string;
  format?: string;
}

export const TokenValue: React.FC<TokenValueProps> = ({ value, type, format }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {formatValue(value, type, format)}
      {type === 'color' && (
        <div
          style={{
            width: 20,
            height: 20,
            backgroundColor: value,
            border: '1px solid #e5e7eb',
            borderRadius: 4,
          }}
        />
      )}
    </div>
  );
};
