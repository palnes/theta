import type React from 'react';
import { Z_INDEX_COLORS, Z_INDEX_POSITIONS, Z_INDEX_SIZES } from '../../constants/displayConstants';
import styles from '../../styles/ZIndexDisplay.module.css';
import { getSemanticZIndex } from '../../tools/tokenHelpers';
import { BaseTokenDisplay } from '../common/BaseTokenDisplay';

export type ZIndexProps = Record<string, never>;

export const ZIndex: React.FC<ZIndexProps> = () => {
  return (
    <BaseTokenDisplay loadingKey="zIndex" errorKey="zIndex">
      {(data) => {
        const zIndexTokens = getSemanticZIndex(data.sys?.zIndex || []);

        return (
          <div className={styles.container}>
            {zIndexTokens.map(({ key, value }, index) => {
              const colors = Z_INDEX_COLORS;
              const positions = Z_INDEX_POSITIONS;
              const sizes = Z_INDEX_SIZES;

              return (
                <div
                  key={key}
                  className={styles.card}
                  style={{
                    left: positions[index],
                    top: positions[index],
                    width: sizes[index],
                    height: sizes[index],
                    backgroundColor: colors[index],
                    zIndex: `var(--sys-z-index-${key})`,
                  }}
                  data-z-index-key={key}
                  title={`${key} z-index layer with value ${value}`}
                >
                  <div className={styles.cardLabel}>{key?.toUpperCase() || ''}</div>
                  <div className={styles.cardValue}>{value}</div>
                </div>
              );
            })}
          </div>
        );
      }}
    </BaseTokenDisplay>
  );
};
