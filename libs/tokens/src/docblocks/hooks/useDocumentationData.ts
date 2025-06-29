import { useContext } from 'react';
import { TokenSystemContext } from '../contexts/TokenSystemContext';

/**
 * Hook to get documentation data in the legacy TokenData format
 * Uses the configurable system internally
 */
export const useDocumentationData = () => {
  const context = useContext(TokenSystemContext);

  if (!context) {
    return {
      data: null,
      loading: false,
      error: 'TokenSystemProvider not found',
    };
  }

  const { data, loading } = context;

  // Context already provides data in TokenData format
  return { data, loading, error: null };
};
