import React from 'react';
import styles from '../styles/ShadowDisplay.module.css';
import sharedStyles from '../styles/shared.module.css';
import { getSemanticShadows } from '../tokenHelpers';
import { extractBoxShadowValue } from '../utils/tokenUtils';
import { TokenListDisplay } from './TokenListDisplay';

export type ShadowDisplayProps = Record<string, never>;

export const ShadowDisplay: React.FC<ShadowDisplayProps> = () => {
  return (
    <TokenListDisplay
      loadingKey="shadows"
      errorKey="shadows"
      tokenType="shadow"
      extractTokens={getSemanticShadows}
      dataPath={(data) => data.sys?.shadow || []}
      gridClassName={styles.shadowGrid}
      variant="minimal"
      renderPreview={(token) => (
        <div
          className={styles.shadowExample}
          style={{
            boxShadow: `var(${token.cssVariable})`,
          }}
        />
      )}
      renderAdditionalInfo={(token) => {
        const boxShadowValue = extractBoxShadowValue(token.value);
        return (
          <div className={styles.shadowValue}>
            <span className={sharedStyles.formatLabel}>Value:</span> {boxShadowValue}
          </div>
        );
      }}
    />
  );
};
