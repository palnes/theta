import React, { ReactNode } from 'react';
import { TokenData } from '../types/tokenReferenceTable';
import { ERROR_MESSAGES, LOADING_MESSAGES } from '../constants/displayConstants';
import { useTokenDisplay } from '../hooks/useTokenDisplay';
import styles from '../styles/shared.module.css';

interface BaseTokenDisplayProps {
  loadingKey?: keyof typeof LOADING_MESSAGES;
  errorKey?: keyof typeof ERROR_MESSAGES;
  children: (data: TokenData) => ReactNode;
}

export const BaseTokenDisplay: React.FC<BaseTokenDisplayProps> = ({
  loadingKey,
  errorKey,
  children,
}) => {
  const { data, loading, error } = useTokenDisplay({
    loadingMessage: loadingKey ? LOADING_MESSAGES[loadingKey] : undefined,
    errorMessage: errorKey ? ERROR_MESSAGES[errorKey] : undefined,
  });

  if (loading) {
    return (
      <div className={styles.loadingState}>
        {loadingKey ? LOADING_MESSAGES[loadingKey] : 'Loading...'}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        {errorKey ? ERROR_MESSAGES[errorKey] : 'Error'}: {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return <>{children(data)}</>;
};
