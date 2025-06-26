import React from 'react';
import styles from '../styles/RadiusDisplay.module.css';
import sharedStyles from '../styles/shared.module.css';
import { GenericTokenDisplay } from './GenericTokenDisplay';

export const RadiusDisplay: React.FC = () => {
  return (
    <GenericTokenDisplay
      tier="sys"
      category="radius"
      gridClassName={styles.radiusGrid}
      variant="minimal"
      renderPreview={(token) => (
        <div
          className={styles.radiusExample}
          style={{
            borderRadius: token.value?.toString(),
          }}
        />
      )}
      renderAdditionalInfo={(token) => (
        <p className={styles.radiusValue}>
          <span className={sharedStyles.formatLabel}>Value:</span> {token.value?.toString()}
        </p>
      )}
    />
  );
};
