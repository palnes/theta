import type React from 'react';
import { useSelectableContent } from '../../hooks/useSelectableContent';
import sharedStyles from '../../styles/shared.module.css';

export interface TokenFormat {
  label: string;
  value: string;
}

interface TokenFormatsProps {
  usage: TokenFormat[] | { css: string; json: string; js: string };
  className?: string;
}

export const TokenFormats: React.FC<TokenFormatsProps> = ({ usage, className }) => {
  const { handleSelectContent } = useSelectableContent();

  // Support both array format and legacy object format for backward compatibility
  const formatArray: TokenFormat[] = Array.isArray(usage)
    ? usage
    : [
        { label: 'CSS', value: usage.css },
        { label: 'JSON', value: usage.json },
        { label: 'JS', value: usage.js },
      ];

  return (
    <dl className={`${sharedStyles.formatGroup} ${className || ''}`}>
      {formatArray.map((format) => (
        <div key={format.label} className={sharedStyles.formatRow}>
          <dt className={sharedStyles.formatLabel}>{format.label}:</dt>
          <dd>
            <code
              className={sharedStyles.selectableValue}
              onClick={handleSelectContent}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectContent(e.currentTarget);
                }
              }}
              title={`Click to copy ${format.label} format`}
            >
              {format.value}
            </code>
          </dd>
        </div>
      ))}
    </dl>
  );
};
