import React from 'react';
import styles from '../../styles/shared.module.css';

export interface ErrorStateProps {
  error: string | Error;
  title?: string;
  className?: string;
}

/**
 * Pure component for consistent error states
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  title = 'Error',
  className = '',
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className={`${styles.errorState} ${className}`} role="alert">
      <strong>{title}:</strong> {errorMessage}
    </div>
  );
};
