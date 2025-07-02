import type { ReactNode } from 'react';
import type { TokenData } from '../types/tokenReferenceTable';
import { useDocumentationData } from './useDocumentationData';

interface TokenDisplayOptions {
  loadingMessage?: string;
  errorMessage?: string;
}

interface TokenDisplayResult {
  data: TokenData | null;
  loading: boolean;
  error: string | null;
  renderState: () => ReactNode | null;
}

export const useTokenDisplay = (options?: TokenDisplayOptions): TokenDisplayResult => {
  const { data, loading, error } = useDocumentationData();

  const renderState = () => {
    if (loading) {
      return <div>{options?.loadingMessage || 'Loading...'}</div>;
    }
    if (error) {
      return (
        <div>
          {options?.errorMessage || 'Error'}: {error}
        </div>
      );
    }
    if (!data) {
      return null;
    }
    return null;
  };

  return { data, loading: loading || false, error, renderState };
};
