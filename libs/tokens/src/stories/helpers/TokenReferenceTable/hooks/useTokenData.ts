import { useEffect, useState } from 'react';
import { TokenData, TokenInfo } from '../types';

interface UseTokenDataProps {
  tier?: 'ref' | 'sys' | 'cmp';
  category?: string;
  filter?: (token: TokenInfo) => boolean;
}

export const useTokenData = ({ tier, category, filter }: UseTokenDataProps) => {
  const [data, setData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/docs/tokens-reference.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Get tokens based on tier and category
  let tokens: TokenInfo[] = [];

  if (data) {
    if (tier && category && data[tier] && data[tier][category]) {
      tokens = data[tier][category];
    } else if (tier && !category) {
      // Get all tokens from tier
      tokens = Object.values(data[tier] || {}).flat();
    } else {
      // Get all tokens
      tokens = [
        ...Object.values(data.ref || {}).flat(),
        ...Object.values(data.sys || {}).flat(),
        ...Object.values(data.cmp || {}).flat(),
      ];
    }

    // Apply custom filter if provided
    if (filter) {
      tokens = tokens.filter(filter);
    }

    // Sort tokens alphabetically by path
    tokens.sort((a, b) => a.path.localeCompare(b.path));
  }

  return { tokens, loading, error };
};
