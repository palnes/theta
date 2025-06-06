import React from 'react';
import { TokenInfo } from '../types';

interface ExpandedDetailsProps {
  token: TokenInfo;
}

export const ExpandedDetails: React.FC<ExpandedDetailsProps> = ({ token }) => {
  return (
    <tr>
      <td colSpan={3} style={{ padding: '0 16px 16px 48px', borderBottom: '1px solid #e5e7eb' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: token.hasReferences ? '1fr 1fr' : '1fr',
            gap: 24,
            fontSize: 13,
            color: '#666',
            paddingTop: 8,
          }}
        >
          <div>
            <div style={{ marginBottom: 12 }}>
              <strong>Type:</strong> <code style={{ color: '#0969da' }}>{token.type}</code>
            </div>
            {token.description && (
              <div style={{ marginBottom: 12 }}>
                <strong>Description:</strong> {token.description}
              </div>
            )}
            <div>
              <strong>Usage Formats:</strong>
              <div style={{ marginTop: 4, fontFamily: 'monospace', fontSize: 12 }}>
                <div>
                  CSS: <code style={{ color: '#0969da' }}>{token.cssVariable}</code>
                </div>
                <div>
                  JSON: <code style={{ color: '#0969da' }}>{token.path}</code>
                </div>
                <div>
                  JS: <code style={{ color: '#0969da' }}>{token.jsFlat}</code>
                </div>
              </div>
            </div>
          </div>
          {token.hasReferences && (
            <div>
              <strong>References:</strong>
              <div style={{ marginTop: 4, fontFamily: 'monospace', fontSize: 12 }}>
                {token.references.map((ref, idx) => (
                  <div key={`${ref.path}-${idx}`} style={{ marginBottom: 2 }}>
                    {ref.property ? (
                      <span>
                        • {ref.property}: <code style={{ color: '#0969da' }}>{ref.path}</code>
                      </span>
                    ) : (
                      <span>
                        → <code style={{ color: '#0969da' }}>{ref.path}</code>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};
