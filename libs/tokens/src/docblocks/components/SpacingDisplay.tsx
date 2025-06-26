import React from 'react';
import {
  SPACING_KEYS,
  SPACING_MAX_WIDTH,
  VISUAL_SPACING_KEYS,
} from '../constants/displayConstants';
import styles from '../styles/SpacingScale.module.css';
import { getSemanticSpacing } from '../tools/tokenHelpers';
import { BaseTokenDisplay } from './BaseTokenDisplay';
import { SelectableCode } from './SelectableCode';

interface SpacingDisplayProps {
  visualOnly?: boolean;
}

export const SpacingDisplay: React.FC<SpacingDisplayProps> = ({ visualOnly = false }) => {
  return (
    <BaseTokenDisplay loadingKey="spacing" errorKey="spacing">
      {(data) => {
        const allSpacingTokens = getSemanticSpacing(data.sys?.spacing || []);
        const spacingTokens = allSpacingTokens.filter(({ key }) =>
          visualOnly
            ? VISUAL_SPACING_KEYS.includes(key as (typeof VISUAL_SPACING_KEYS)[number])
            : SPACING_KEYS.includes(key as (typeof SPACING_KEYS)[number])
        );

        if (visualOnly) {
          return (
            <ul className={styles.visualGrid}>
              {spacingTokens.map(({ key, value, tokenValue }) => {
                const spacingValue = value || tokenValue || '0';
                return (
                  <li key={key} className={styles.visualItem}>
                    <figure className={styles.visualBox}>
                      <div
                        className={styles.visualInner}
                        style={{
                          width: `calc(100% - ${spacingValue} * 2)`,
                          height: `calc(100% - ${spacingValue} * 2)`,
                        }}
                      />
                    </figure>
                    <figcaption className={styles.visualLabel}>
                      {key?.toUpperCase() || ''}
                    </figcaption>
                  </li>
                );
              })}
            </ul>
          );
        }

        return (
          <ul className={styles.spacingList}>
            {spacingTokens.map(({ key, tokenValue, cssVariable, jsPath, jsFlat, value }) => (
              <li key={key} className={styles.spacingItem}>
                <span className={styles.spacingLabel}>{key?.toUpperCase() || ''}</span>
                <div
                  className={styles.spacingBar}
                  style={{
                    width: value || tokenValue,
                    maxWidth:
                      SPACING_MAX_WIDTH[key as keyof typeof SPACING_MAX_WIDTH] ||
                      SPACING_MAX_WIDTH.default,
                  }}
                />
                <div className={styles.spacingInfo}>
                  <span className={styles.spacingValue}>{tokenValue}</span>
                  <span className={styles.spacingSeparator}>•</span>
                  <SelectableCode className={styles.spacingCode}>{jsFlat || jsPath}</SelectableCode>
                  <span className={styles.spacingSeparator}>•</span>
                  <SelectableCode className={styles.spacingCode}>{cssVariable}</SelectableCode>
                  <span className={styles.spacingSeparator}>•</span>
                  <SelectableCode className={styles.spacingCode}>{jsPath}</SelectableCode>
                </div>
              </li>
            ))}
          </ul>
        );
      }}
    </BaseTokenDisplay>
  );
};

// Export SpacingVisualExamples as an alias for backward compatibility
export const SpacingVisualExamples: React.FC = () => <SpacingDisplay visualOnly />;
