import type React from 'react';
import type { ReactNode } from 'react';
import sharedStyles from '../../styles/shared.module.css';
import { type TokenFormat, TokenFormats } from '../token-display/TokenFormats';

interface TokenCardProps {
  title: string;
  description?: string;
  usage?: TokenFormat[] | { css: string; json: string; js: string };
  preview?: ReactNode;
  className?: string;
  children?: ReactNode;
  variant?: 'card' | 'minimal';
}

export const TokenCard: React.FC<TokenCardProps> = ({
  title,
  description,
  usage,
  preview,
  className,
  children,
  variant = 'card',
}) => {
  const containerClass =
    variant === 'card'
      ? `${sharedStyles.tokenCard} ${className || ''}`
      : `${sharedStyles.tokenMinimal} ${className || ''}`;

  return (
    <article className={containerClass}>
      {preview && (
        <div className={sharedStyles.cardContent}>
          {preview}
          <div className={sharedStyles.cardInfo}>
            <h4 className={sharedStyles.componentTitle}>{title}</h4>
            {usage && <TokenFormats usage={usage} />}
            {description && <p className={sharedStyles.description}>{description}</p>}
            {children}
          </div>
        </div>
      )}
      {!preview && (
        <>
          <h4 className={sharedStyles.componentTitle}>{title}</h4>
          {usage && <TokenFormats usage={usage} />}
          {description && <p className={sharedStyles.description}>{description}</p>}
          {children}
        </>
      )}
    </article>
  );
};
