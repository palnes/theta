import React from 'react';
import styles from '../styles/BorderDisplay.module.css';
import sharedStyles from '../styles/shared.module.css';
import { getSemanticBorders } from '../tools/tokenHelpers';
import { BaseTokenDisplay } from './BaseTokenDisplay';
import { TokenFormatDisplay } from './TokenFormatDisplay';

export type BorderDisplayProps = Record<string, never>;

export const BorderDisplay: React.FC<BorderDisplayProps> = () => {
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
                  {borders.width?.map(
                    ({ key, description, cssVariable, jsPath, jsFlat, value }) => (
                      <li key={key} style={{ listStyle: 'none' }}>
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
                              <TokenFormatDisplay
                                formats={{
                                  css: cssVariable,
                                  json: jsPath,
                                  js: jsFlat || jsPath,
                                }}
                              />
                              <p className={sharedStyles.description}>{description}</p>
                            </div>
                          </div>
                        </article>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </section>

            <section>
              <h2>Border Styles</h2>
              <div className={sharedStyles.section}>
                <h3>Semantic Style Options</h3>
                <ul className={styles.styleGrid}>
                  {borders.style?.map(
                    ({ key, description, cssVariable, jsPath, jsFlat, value }) => {
                      const borderStyle =
                        key === 'none'
                          ? 'none'
                          : `var(--sys-border-width-medium) ${value} var(--sys-color-border-default)`;
                      return (
                        <li key={key} style={{ listStyle: 'none' }}>
                          <article className={styles.styleCard} style={{ border: borderStyle }}>
                            <h4 className={sharedStyles.componentTitle}>{key}</h4>
                            <TokenFormatDisplay
                              formats={{
                                css: cssVariable || `--sys-border-style-${key}`,
                                json: jsPath,
                                js: jsFlat || jsPath,
                              }}
                            />
                            <p className={sharedStyles.description}>{description}</p>
                          </article>
                        </li>
                      );
                    }
                  )}
                </ul>
              </div>
            </section>
          </>
        );
      }}
    </BaseTokenDisplay>
  );
};
