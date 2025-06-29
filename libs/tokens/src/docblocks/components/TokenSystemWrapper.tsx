import React from 'react';
import { TokenSystemProvider } from '../contexts/TokenSystemContext';

// Import the token data directly
// @ts-ignore - JSON import
import tokenDataJson from '../../../.storybook/generated/tokens-generic.json';

/**
 * Generic wrapper that provides TokenSystemProvider context
 * Use this to wrap any component that needs token system context in MDX files
 * Since Storybook doesn't apply decorators to MDX docs
 */
export const TokenSystemWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <TokenSystemProvider data={tokenDataJson}>{children}</TokenSystemProvider>;
};
