import type React from 'react';
import styles from '../../styles/BorderDisplay.module.css';
import sharedStyles from '../../styles/shared.module.css';
import { getSemanticBorders } from '../../tools/tokenHelpers';
import { BaseTokenDisplay } from '../common/BaseTokenDisplay';
import { TokenFormats } from '../token-display/TokenFormats';

export type BordersProps = Record<string, never>;

export const Borders: React.FC<BordersProps> = () => {
  return (
    <BaseTokenDisplay loadingKey="borders" errorKey="borders">
      {(data) => {
        const borders = getSemanticBorders(data.sys?.border || []);

        return (
          <>
            <section>
              <h2>Border Widths</h2>
              <div className={sharedStyles.section}>
                <h3>Semantic Width Scale</h3>
                <ul className={sharedStyles.gridMedium}>
                  {borders.width?.map((token) => {
                    const { name: key, description, value, usage } = token;
                    return (
                      <li key={token.path} style={{ listStyle: 'none' }}>
                        <article className={sharedStyles.tokenCard}>
                          <div className={sharedStyles.cardContent}>
                            <div
                              className={sharedStyles.exampleBox}
                              style={{
                                borderWidth: value,
                                borderStyle: 'solid',
                                borderColor: 'var(--sys-color-border-strong)',
                              }}
                            />
                            <div className={sharedStyles.cardInfo}>
                              <h4 className={sharedStyles.componentTitle}>{key}</h4>
                              <TokenFormats usage={usage} />
                              <p className={sharedStyles.description}>{description}</p>
                            </div>
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>

            <section>
              <h2>Border Styles</h2>
              <div className={sharedStyles.section}>
                <h3>Semantic Style Options</h3>
                <ul className={styles.styleGrid}>
                  {borders.style?.map((token) => {
                    const { name: key, description, value, usage } = token;
                    const borderStyle =
                      key === 'none'
                        ? 'none'
                        : `var(--sys-border-width-medium) ${value} var(--sys-color-border-default)`;
                    return (
                      <li key={token.path} style={{ listStyle: 'none' }}>
                        <article className={styles.styleCard} style={{ border: borderStyle }}>
                          <h4 className={sharedStyles.componentTitle}>{key}</h4>
                          <TokenFormats usage={usage} />
                          <p className={sharedStyles.description}>{description}</p>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          </>
        );
      }}
    </BaseTokenDisplay>
  );
};
