import React, { ReactNode } from 'react';
import { TokenInfo } from '../TokenReferenceTable/types';
import sharedStyles from '../styles/shared.module.css';
import { createTokenFormats } from '../utils/tokenUtils';
import { BaseTokenDisplay } from './BaseTokenDisplay';
import { TokenCard } from './TokenCard';

interface TokenListDisplayProps {
  loadingKey?: keyof typeof import('../constants/displayConstants').LOADING_MESSAGES;
  errorKey?: keyof typeof import('../constants/displayConstants').ERROR_MESSAGES;
  tokenType: string;
  extractTokens: (tokens: TokenInfo[]) => any[];
  dataPath: (data: any) => TokenInfo[];
  renderPreview?: (token: any) => ReactNode;
  renderAdditionalInfo?: (token: any) => ReactNode;
  gridClassName?: string;
  itemClassName?: string;
  variant?: 'card' | 'minimal';
}

export const TokenListDisplay: React.FC<TokenListDisplayProps> = ({
  loadingKey,
  errorKey,
  tokenType,
  extractTokens,
  dataPath,
  renderPreview,
  renderAdditionalInfo,
  gridClassName = sharedStyles.tokenGrid,
  itemClassName,
  variant = 'card',
}) => {
  return (
    <BaseTokenDisplay loadingKey={loadingKey} errorKey={errorKey}>
      {(data) => {
        const rawTokens = dataPath(data);
        const tokens = extractTokens(rawTokens);

        return (
          <ul className={gridClassName}>
            {tokens.map((token) => {
              const { key, cssVariable, jsPath, jsFlat, tokenValue, value } = token;
              const formats = createTokenFormats(cssVariable, jsPath, key, tokenType, jsFlat);

              return (
                <li key={key} style={{ listStyle: 'none' }}>
                  <TokenCard
                    title={key || ''}
                    formats={formats}
                    preview={renderPreview ? renderPreview(token) : undefined}
                    className={itemClassName}
                    variant={variant}
                  >
                    {renderAdditionalInfo ? (
                      renderAdditionalInfo(token)
                    ) : (
                      <p>
                        <span className={sharedStyles.formatLabel}>Value:</span>{' '}
                        {tokenValue || value}
                      </p>
                    )}
                  </TokenCard>
                </li>
              );
            })}
          </ul>
        );
      }}
    </BaseTokenDisplay>
  );
};
