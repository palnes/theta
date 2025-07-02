import type React from 'react';
import styles from '../../styles/shared.module.css';
import type { GridSize } from '../../types/commonTypes';

export interface TokenGridProps {
  children: React.ReactNode;
  size?: GridSize;
  className?: string;
  as?: 'ul' | 'div';
}

/**
 * Pure component for consistent grid layouts
 */
export const TokenGrid: React.FC<TokenGridProps> = ({
  children,
  size = 'medium',
  className = '',
  as: Component = 'ul',
}) => {
  const gridClass = {
    small: styles.tokenGridSmall,
    medium: styles.tokenGrid,
    large: styles.tokenGridLarge,
  }[size];

  return <Component className={`${gridClass} ${className}`}>{children}</Component>;
};
