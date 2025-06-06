import React, { useState } from 'react';
import { TokenInfo, UsageFormat } from '../types';
import { getUsageValue } from '../utils/tokenHelpers';
import { ExpandedDetails } from './ExpandedDetails';
import { TokenValue } from './TokenValue';

interface TokenRowProps {
  token: TokenInfo;
  isExpanded: boolean;
  onToggle: (path: string) => void;
  usageFormat: UsageFormat;
}

export const TokenRow: React.FC<TokenRowProps> = ({ token, isExpanded, onToggle, usageFormat }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <React.Fragment>
      <tr
        style={{
          borderBottom: isExpanded ? 'none' : '1px solid #e5e7eb',
        }}
      >
        <td
          style={{
            padding: '12px 16px',
            fontWeight: 500,
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={() => onToggle(token.path)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggle(token.path);
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 12,
                color: '#666',
                width: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </span>
            <div>{token.path}</div>
          </div>
        </td>
        <td
          style={{
            padding: '12px 16px',
            fontFamily: 'monospace',
            position: 'relative',
            cursor: token.hasReferences ? 'help' : 'default',
          }}
          onMouseEnter={() => token.hasReferences && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <TokenValue value={token.value} type={token.type} format={usageFormat} />
          {showTooltip && token.hasReferences && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: 4,
                padding: '6px 8px',
                backgroundColor: '#1a1a1a',
                color: 'white',
                fontSize: 11,
                fontFamily: 'monospace',
                borderRadius: 4,
                whiteSpace: 'nowrap',
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              {token.references.map((ref, idx) => (
                <div key={`${ref.path}-${idx}`}>
                  {ref.property ? `${ref.property}: ${ref.path}` : ref.path}
                </div>
              ))}
            </div>
          )}
        </td>
        <td style={{ padding: '12px 16px' }}>
          <code style={{ fontSize: 12, color: '#666' }}>{getUsageValue(token, usageFormat)}</code>
        </td>
      </tr>
      {isExpanded && <ExpandedDetails token={token} />}
    </React.Fragment>
  );
};
