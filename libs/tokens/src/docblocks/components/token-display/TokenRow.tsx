import React, { useState } from 'react';
import styles from '../../styles/TokenTable.module.css';
import { getUsageValue } from '../../tools/tokenReferenceHelpers';
import { TokenInfo } from '../../types/tokenReferenceTable';
import { ExpandedDetails } from './ExpandedDetails';
import { TokenValue } from './TokenValue';

interface TokenRowProps {
  token: TokenInfo;
  isExpanded: boolean;
  onToggle: (path: string) => void;
  usageFormat: string;
}

export const TokenRow: React.FC<TokenRowProps> = ({ token, isExpanded, onToggle, usageFormat }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSelectContent = (
    e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
  ) => {
    e.stopPropagation();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(e.currentTarget);
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectContent(e);
    }
  };

  return (
    <React.Fragment>
      <tr className={`${styles.row} ${isExpanded ? styles.rowExpanded : ''}`}>
        <td
          className={styles.tokenCell}
          onClick={() => onToggle(token.path)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggle(token.path);
            }
          }}
        >
          <div className={styles.tokenName}>
            <span className={`${styles.expandIcon} ${isExpanded ? styles.expandIconRotated : ''}`}>
              {isExpanded ? '▼' : '▶'}
            </span>
            <div>{token.path}</div>
            {token.isThemeable && (
              <span
                className={styles.themeIndicator}
                title={`Overridden in: ${token.overriddenIn?.join(', ')}`}
              >
                🎨
              </span>
            )}
          </div>
        </td>
        <td
          className={styles.valueCell}
          style={{
            cursor: token.hasReferences ? 'help' : 'default',
          }}
          onMouseEnter={() => token.hasReferences && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <TokenValue
            value={token.value}
            type={token.type}
            format={usageFormat}
            themeValues={token.themeValues}
            isThemeable={token.isThemeable}
          />
          {showTooltip && token.hasReferences && (
            <div className={styles.tooltip}>
              {token.references.map((ref, idx) => (
                <div key={`${ref.path}-${idx}`}>
                  {ref.property ? `${ref.property}: ${ref.path}` : ref.path}
                </div>
              ))}
            </div>
          )}
        </td>
        <td className={styles.usageCell}>
          <code
            className={styles.selectableValue}
            onClick={handleSelectContent}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            aria-label="Click to copy"
          >
            {getUsageValue(token, usageFormat)}
          </code>
        </td>
      </tr>
      {isExpanded && <ExpandedDetails token={token} />}
    </React.Fragment>
  );
};
