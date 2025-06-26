import React from 'react';
import styles from '../styles/ShadowDisplay.module.css';
import sharedStyles from '../styles/shared.module.css';
import { extractBoxShadowValue } from '../tools/tokenUtils';
import { GenericTokenDisplay } from './GenericTokenDisplay';

export type ShadowDisplayProps = Record<string, never>;

export const ShadowDisplay: React.FC<ShadowDisplayProps> = () => {
  return (
    <GenericTokenDisplay
      tier="sys"
      category="shadow"
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
