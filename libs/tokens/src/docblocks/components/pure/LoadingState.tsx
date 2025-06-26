import React from 'react';
import styles from '../../styles/shared.module.css';

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

/**
 * Pure component for consistent loading states
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  className = '',
}) => {
  return (
    <output className={`${styles.loadingState} ${className}`}>
      <span aria-live="polite">{message}</span>
    </output>
  );
};
