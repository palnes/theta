import React from 'react';
import { formatValue } from '../utils/formatters';

interface TokenValueProps {
  value: any;
  type: string;
  format?: string;
}

export const TokenValue: React.FC<TokenValueProps> = ({ value, type, format }) => {
  const formattedValue = formatValue(value, type, format);
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {formattedValue}
      {type === 'color' && (
        <div
          style={{
            width: 20,
            height: 20,
            backgroundColor: formattedValue,
            border: '1px solid #e5e7eb',
            borderRadius: 4,
          }}
        />
      )}
    </div>
  );
};
