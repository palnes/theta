import React from 'react';
import { useSelectableContent } from '../../hooks/useSelectableContent';
import styles from '../../styles/shared.module.css';

export interface TokenDisplayProps {
  cssVariable?: string;
  jsPath?: string;
  jsFlat?: string;
  formats?: { label: string; value: string }[];
  variant?: 'inline' | 'stacked';
  className?: string;
}

/**
 * Pure component for displaying token usage formats (CSS, JS, JSON)
 * Can accept either individual props or a formats array
 */
export const TokenDisplay: React.FC<TokenDisplayProps> = ({
  cssVariable,
  jsPath,
  jsFlat,
  formats,
  variant = 'stacked',
  className = '',
}) => {
  const { handleSelectContent } = useSelectableContent();

  const containerClass =
    variant === 'inline'
      ? `${styles.tokenDisplayInline} ${className}`
      : `${styles.tokenDisplay} ${className}`;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectContent(e.currentTarget);
    }
  };

  // Use formats array if provided, otherwise fall back to individual props
  const displayFormats = formats || [
    { label: 'CSS', value: cssVariable || '' },
    { label: 'JSON', value: jsPath || '' },
    { label: 'JS', value: jsFlat || jsPath || '' },
  ];

  return (
    <div className={containerClass}>
      {displayFormats.map(({ label, value }) => (
        <div key={label} className={styles.tokenRow}>
          <span className={styles.tokenLabel}>{label}:</span>
          <code
            className={styles.tokenValue}
            onClick={handleSelectContent}
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            {value}
          </code>
        </div>
      ))}
    </div>
  );
};
