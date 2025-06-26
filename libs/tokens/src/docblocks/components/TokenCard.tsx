import React, { ReactNode } from 'react';
import sharedStyles from '../styles/shared.module.css';
import { TokenFormat, TokenFormatDisplay } from './TokenFormatDisplay';

interface TokenCardProps {
  title: string;
  description?: string;
  formats?: TokenFormat;
  preview?: ReactNode;
  className?: string;
  children?: ReactNode;
  variant?: 'card' | 'minimal';
}

export const TokenCard: React.FC<TokenCardProps> = ({
  title,
  description,
  formats,
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
            {formats && <TokenFormatDisplay formats={formats} />}
            {description && <p className={sharedStyles.description}>{description}</p>}
            {children}
          </div>
        </div>
      )}
      {!preview && (
        <>
          <h4 className={sharedStyles.componentTitle}>{title}</h4>
          {formats && <TokenFormatDisplay formats={formats} />}
          {description && <p className={sharedStyles.description}>{description}</p>}
          {children}
        </>
      )}
    </article>
  );
};
