import React from 'react';
import sharedStyles from '../styles/shared.module.css';
import type { TokenInfo } from '../types/tokenReferenceTable';
import { BaseTokenRenderer } from './BaseRenderer';

/**
 * Generic renderer for tokens that don't have a specific renderer
 * Displays tokens in a simple table format
 */
export class GenericRenderer extends BaseTokenRenderer {
  id = 'generic';
  name = 'Generic';
  tokenTypes = ['*']; // Accepts any token type

  canRender(_token: TokenInfo): boolean {
    // Generic renderer should not be used for token types that have specific renderers
    // This is a fallback renderer, so it should return false here
    // The TokenViewer will explicitly use this as a fallback
    return false;
  }

  renderPreview(token: TokenInfo): React.ReactElement {
    return <code>{JSON.stringify(token.value)}</code>;
  }

  renderToken(token: TokenInfo): React.ReactElement {
    return (
      <div key={token.path} className={sharedStyles.tokenItem}>
        <div className={sharedStyles.tokenHeader}>
          <h4 className={sharedStyles.tokenName}>{token.name}</h4>
          <code className={sharedStyles.tokenPath}>{token.path}</code>
        </div>
        <div className={sharedStyles.tokenValue}>
          <strong>Value:</strong> <code>{JSON.stringify(token.value)}</code>
        </div>
        {token.description && <p className={sharedStyles.tokenDescription}>{token.description}</p>}
        {token.type && (
          <div className={sharedStyles.tokenMeta}>
            <span>Type: {token.type}</span>
          </div>
        )}
      </div>
    );
  }

  renderCollection(tokens: TokenInfo[]): React.ReactElement {
    // Group tokens by their subcategory
    const grouped = tokens.reduce(
      (acc, token) => {
        const parts = token.path.split('.');
        const subcategory = parts.length > 3 ? parts[3] : 'other';

        if (subcategory && !acc[subcategory]) {
          acc[subcategory] = [];
        }
        if (subcategory && acc[subcategory]) {
          acc[subcategory].push(token);
        }
        return acc;
      },
      {} as Record<string, TokenInfo[]>
    );

    return (
      <div className={sharedStyles.tokenCollection}>
        {Object.entries(grouped).map(([subcategory, groupTokens]) => (
          <div key={subcategory} className={sharedStyles.tokenGroup}>
            <h3 className={sharedStyles.groupTitle}>
              {subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}
            </h3>
            <div className={sharedStyles.tokenGrid}>
              {groupTokens.map((token) => this.renderToken(token))}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
