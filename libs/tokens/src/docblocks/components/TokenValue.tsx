import React from 'react';
import { formatValue } from '../tools/formatters';

interface TokenValueProps {
  value: any;
  type: string;
  format?: string;
  themeValues?: Record<string, any>;
  isThemeable?: boolean;
}

export const TokenValue: React.FC<TokenValueProps> = ({
  value,
  type,
  format,
  themeValues,
  isThemeable,
}) => {
  const formattedValue = formatValue(value, type, format);

  if (isThemeable && themeValues && type === 'color') {
    // Show theme swatches for color tokens
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {Object.entries(themeValues).map(([theme, themeValue]) => {
          const formattedThemeValue = formatValue(themeValue, type, format);
          return (
            <div key={theme} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: formattedThemeValue,
                  border: '1px solid #e5e7eb',
                  borderRadius: 4,
                }}
                title={`${theme}: ${formattedThemeValue}`}
              />
              <span style={{ fontSize: '0.75rem', color: '#666' }}>{theme}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
      {formattedValue}
    </div>
  );
};
