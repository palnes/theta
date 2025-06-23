import React from 'react';
import { useSelectableContent } from '../hooks/useSelectableContent';
import sharedStyles from '../styles/shared.module.css';

export interface TokenFormat {
  css: string;
  json: string;
  js: string;
}

interface TokenFormatDisplayProps {
  formats: TokenFormat;
  className?: string;
}

export const TokenFormatDisplay: React.FC<TokenFormatDisplayProps> = ({ formats, className }) => {
  const { handleSelectContent } = useSelectableContent();

  return (
    <dl className={`${sharedStyles.formatGroup} ${className || ''}`}>
      <div className={sharedStyles.formatRow}>
        <dt className={sharedStyles.formatLabel}>CSS:</dt>
        <dd>
          <code
            className={sharedStyles.selectableValue}
            onClick={handleSelectContent}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectContent(e as any);
              }
            }}
            tabIndex={0}
            aria-label="Click to copy CSS variable"
          >
            {formats.css}
          </code>
        </dd>
      </div>
      <div className={sharedStyles.formatRow}>
        <dt className={sharedStyles.formatLabel}>JSON:</dt>
        <dd>
          <code
            className={sharedStyles.selectableValue}
            onClick={handleSelectContent}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectContent(e as any);
              }
            }}
            tabIndex={0}
            aria-label="Click to copy JSON path"
          >
            {formats.json}
          </code>
        </dd>
      </div>
      <div className={sharedStyles.formatRow}>
        <dt className={sharedStyles.formatLabel}>JS:</dt>
        <dd>
          <code
            className={sharedStyles.selectableValue}
            onClick={handleSelectContent}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectContent(e as any);
              }
            }}
            tabIndex={0}
            aria-label="Click to copy JS variable"
          >
            {formats.js}
          </code>
        </dd>
      </div>
    </dl>
  );
};
