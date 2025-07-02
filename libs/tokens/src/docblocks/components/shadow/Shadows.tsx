import type React from 'react';
import styles from '../../styles/ShadowDisplay.module.css';
import sharedStyles from '../../styles/shared.module.css';
import { extractBoxShadowValue } from '../../tools/tokenUtils';
import { TokenList } from '../token-display/TokenList';

export type ShadowsProps = Record<string, never>;

export const Shadows: React.FC<ShadowsProps> = () => {
  return (
    <TokenList
      tier="sys"
      category="shadow"
      gridClassName={styles.shadowGrid}
      variant="minimal"
      renderPreview={(token) => {
        const cssVar = token.usage.find((u) => u.label === 'CSS')?.value || '';
        return (
          <div
            className={styles.shadowExample}
            style={{
              boxShadow: `var(${cssVar})`,
            }}
          />
        );
      }}
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
