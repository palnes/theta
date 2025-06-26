import React from 'react';
import { TEXT_COLOR_CONFIGS } from '../constants/textColorConfig';
import styles from '../styles/TextColorDisplay.module.css';
import type { ColorToken } from '../tools/colorUtils';

interface TextColorDisplayProps {
  tokens: ColorToken[];
}

export const TextColorDisplay: React.FC<TextColorDisplayProps> = ({ tokens }) => {
  // Create a map of tokens by path for easy lookup
  const tokenMap = React.useMemo(() => {
    const map = new Map<string, ColorToken>();
    tokens.forEach((token) => {
      if (token.path) {
        map.set(token.path, token);
      }
    });
    return map;
  }, [tokens]);

  return (
    <div className={styles.textColorDisplay}>
      {TEXT_COLOR_CONFIGS.map((config) => (
        <section key={config.title} className={styles.section}>
          <h3 className={styles.sectionTitle}>{config.title}</h3>
          {config.description && <p className={styles.sectionDescription}>{config.description}</p>}
          <div className={styles.tokenGrid}>
            {config.tokens.map((item) => {
              const token = tokenMap.get(item.tokenPath);
              if (!token) return null;

              return (
                <div key={item.tokenPath} className={styles.tokenItem}>
                  {token.isThemeable && token.themeValues ? (
                    <div className={styles.themePreviewContainer}>
                      <div
                        className={`${styles.preview} ${styles.lightTheme}`}
                        data-theme="light"
                        style={{
                          backgroundColor: item.background,
                          color: token.themeValues.light || token.value,
                        }}
                      >
                        <span className={styles.sampleText}>Aa</span>
                      </div>
                      <div
                        className={`${styles.preview} ${styles.darkTheme}`}
                        data-theme="dark"
                        style={{
                          backgroundColor: item.background,
                          color: token.themeValues.dark || token.value,
                        }}
                      >
                        <span className={styles.sampleText}>Aa</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={styles.preview}
                      style={{
                        backgroundColor: item.background,
                        color: token.value,
                      }}
                    >
                      <span className={styles.sampleText}>Aa</span>
                    </div>
                  )}
                  <div className={styles.info}>
                    <div className={styles.label}>{item.label}</div>
                    <div className={styles.cssVar}>{token.cssVariable}</div>
                    {item.backgroundLabel && (
                      <div className={styles.backgroundInfo}>on {item.backgroundLabel}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
