import React from 'react';
import styles from '../styles/RadiusDisplay.module.css';
import { getSemanticRadius } from '../tokenHelpers';
import { TokenListDisplay } from './TokenListDisplay';

export const RadiusDisplay: React.FC = () => {
  return (
    <TokenListDisplay
      loadingKey="radius"
      errorKey="radius"
      tokenType="radius"
      extractTokens={getSemanticRadius}
      dataPath={(data) => data.sys?.radius || []}
      gridClassName={styles.radiusGrid}
      variant="minimal"
      renderPreview={(token) => (
        <div
          className={styles.radiusExample}
          style={{
            borderRadius: token.value || token.tokenValue,
          }}
        />
      )}
      renderAdditionalInfo={(token) => (
        <p className={styles.radiusValue}>
          <span className={styles.formatLabel}>Value:</span> {token.tokenValue}
        </p>
      )}
    />
  );
};
