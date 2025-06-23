import React from 'react';
import { ERROR_MESSAGES, LOADING_MESSAGES } from '../constants/displayConstants';
import { useSelectableContent } from '../hooks/useSelectableContent';
import styles from '../styles/TypographyShowcase.module.css';
import {
  extractFontFamilies,
  extractFontSizes,
  extractFontWeights,
  extractLineHeights,
  formatFontFamilyValue,
  getSemanticTypography,
} from '../tokenHelpers';
import { useDocumentationData } from '../useDocumentationData';

// Token display component with clickable values
const TokenDisplay: React.FC<{
  cssVariable: string;
  jsPath: string;
  jsFlat?: string;
  variant?: 'inline' | 'stacked';
}> = ({ cssVariable, jsPath, jsFlat, variant = 'stacked' }) => {
  const { handleSelectContent } = useSelectableContent();
  const jsDisplay = jsFlat || jsPath;

  const className = variant === 'inline' ? styles.tokenInfoInline : styles.tokenInfo;

  return (
    <div className={className}>
      <div className={styles.tokenRow}>
        <span className={styles.tokenLabel}>CSS:</span>
        <code
          className={styles.tokenValue}
          onClick={handleSelectContent}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSelectContent(e as any);
            }
          }}
        >
          {cssVariable}
        </code>
      </div>
      <div className={styles.tokenRow}>
        <span className={styles.tokenLabel}>JSON:</span>
        <code
          className={styles.tokenValue}
          onClick={handleSelectContent}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSelectContent(e as any);
            }
          }}
        >
          {jsPath}
        </code>
      </div>
      <div className={styles.tokenRow}>
        <span className={styles.tokenLabel}>JS:</span>
        <code
          className={styles.tokenValue}
          onClick={handleSelectContent}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSelectContent(e as any);
            }
          }}
        >
          {jsDisplay}
        </code>
      </div>
    </div>
  );
};

interface TypographyShowcaseProps {
  type: 'reference' | 'semantic';
  category?: 'fontSize' | 'fontWeight' | 'lineHeight' | 'fontFamily' | 'all';
  semanticCategory?: 'heading' | 'body' | 'action' | 'label' | 'code';
}

export const TypographyShowcase: React.FC<TypographyShowcaseProps> = ({
  type,
  category = 'all',
  semanticCategory,
}) => {
  const { data, loading, error } = useDocumentationData();

  if (loading) return <div className={styles.loading}>{LOADING_MESSAGES.typography}</div>;
  if (error)
    return (
      <div className={styles.error}>
        {ERROR_MESSAGES.typography}: {error}
      </div>
    );
  if (!data) return null;

  // Reference typography display
  if (type === 'reference') {
    const shouldShowFontSizes = category === 'all' || category === 'fontSize';
    const shouldShowFontWeights = category === 'all' || category === 'fontWeight';
    const shouldShowLineHeights = category === 'all' || category === 'lineHeight';
    const shouldShowFontFamilies = category === 'all' || category === 'fontFamily';

    return (
      <div className={styles.container}>
        {shouldShowFontSizes && (
          <section className={styles.section}>
            <h2>Font Sizes</h2>
            <ul className={styles.tokenList}>
              {extractFontSizes(data.ref?.fontSize || []).map(
                ({ key, cssVariable, jsPath, jsFlat }) => (
                  <li key={key} className={styles.example}>
                    <div className={styles.preview} style={{ fontSize: `var(${cssVariable})` }}>
                      The quick brown fox jumps over the lazy dog
                    </div>
                    <TokenDisplay cssVariable={cssVariable} jsPath={jsPath} jsFlat={jsFlat} />
                  </li>
                )
              )}
            </ul>
          </section>
        )}

        {shouldShowFontWeights && (
          <section className={styles.section}>
            <h2>Font Weights</h2>
            <ul className={styles.tokenList}>
              {extractFontWeights(data.ref?.fontWeight || []).map(
                ({ name, value, cssVariable, jsPath, jsFlat }) => (
                  <li key={value} className={styles.example}>
                    <div className={styles.preview} style={{ fontWeight: `var(${cssVariable})` }}>
                      {name} ({value}) - The quick brown fox jumps over the lazy dog
                    </div>
                    <TokenDisplay cssVariable={cssVariable} jsPath={jsPath} jsFlat={jsFlat} />
                  </li>
                )
              )}
            </ul>
          </section>
        )}

        {shouldShowLineHeights && (
          <section className={styles.section}>
            <h2>Line Heights</h2>
            <ul className={styles.tokenList}>
              {extractLineHeights(data.ref?.lineHeightPx || []).map(
                ({ name, key, description, token, cssVariable, jsPath, jsFlat }) => (
                  <li key={key} className={styles.example}>
                    <div className={styles.preview} style={{ lineHeight: `var(${cssVariable})` }}>
                      <strong>
                        {name} ({token.$value})
                      </strong>
                      <br />
                      This text has {name} line height.
                      <br />
                      {description}.
                    </div>
                    <TokenDisplay cssVariable={cssVariable} jsPath={jsPath} jsFlat={jsFlat} />
                  </li>
                )
              )}
            </ul>
          </section>
        )}

        {shouldShowFontFamilies && (
          <section className={styles.section}>
            <h2>Font Families</h2>
            <ul className={styles.tokenList}>
              {extractFontFamilies(data.ref?.fontFamily || []).map(
                ({ key, value, cssVariable, jsPath, jsFlat }) => {
                  const fontValue = formatFontFamilyValue(value);
                  return (
                    <li key={key} className={styles.example}>
                      <div className={styles.preview} style={{ fontFamily: `var(${cssVariable})` }}>
                        {key === 'mono'
                          ? 'function example() { return "Hello, World!"; }'
                          : 'The quick brown fox jumps over the lazy dog'}
                      </div>
                      <TokenDisplay cssVariable={cssVariable} jsPath={jsPath} jsFlat={jsFlat} />
                      <div className={styles.fontStack}>{fontValue}</div>
                    </li>
                  );
                }
              )}
            </ul>
          </section>
        )}
      </div>
    );
  }

  // Semantic typography display
  const allSemanticTypography = getSemanticTypography(data.sys?.typography || []);

  // Convert array to object for easier filtering
  const categoriesObj = allSemanticTypography.reduce(
    (acc, item) => {
      acc[item.category] = item.variants;
      return acc;
    },
    {} as Record<string, any[]>
  );

  const categories = semanticCategory
    ? { [semanticCategory]: categoriesObj[semanticCategory] || [] }
    : categoriesObj;

  const categoryLabels: Record<string, string> = {
    heading: 'Heading Styles',
    body: 'Body Styles',
    action: 'Action Styles',
    label: 'Label Styles',
    code: 'Code Styles',
  };

  const sampleText: Record<string, string> = {
    heading: 'The quick brown fox jumps over the lazy dog',
    body: 'The quick brown fox jumps over the lazy dog. This is sample text that demonstrates the typography style.',
    action: 'Action Text',
    label: 'Label Text',
    code: 'const example = "Hello World";',
  };

  return (
    <div className={styles.container}>
      {Object.entries(categories).map(([categoryKey, variants]) => (
        <section key={categoryKey} className={styles.section}>
          <h2>{categoryLabels[categoryKey] || categoryKey}</h2>
          <ul className={styles.tokenList}>
            {(variants || []).map((token) => {
              const { variant, cssVariable, jsPath, jsFlat } = token;

              // Action buttons
              if (categoryKey === 'action') {
                return (
                  <li key={variant} className={styles.example}>
                    <button
                      type="button"
                      className={`${styles.actionButton} ${
                        variant === 'lg'
                          ? styles.actionButtonLg
                          : variant === 'sm'
                            ? styles.actionButtonSm
                            : styles.actionButtonMd
                      }`}
                      style={{
                        fontFamily: `var(${cssVariable}-font-family)`,
                        fontSize: `var(${cssVariable}-font-size)`,
                        fontWeight: `var(${cssVariable}-font-weight)`,
                        lineHeight: `var(${cssVariable}-line-height)`,
                      }}
                    >
                      {`${variant.toUpperCase()} ${sampleText[categoryKey]}`}
                    </button>
                    <TokenDisplay cssVariable={cssVariable} jsPath={jsPath} jsFlat={jsFlat} />
                  </li>
                );
              }

              // Code blocks
              if (categoryKey === 'code') {
                return (
                  <li key={variant} className={styles.example}>
                    <pre
                      className={styles.codeBlock}
                      style={{
                        fontFamily: `var(${cssVariable}-font-family)`,
                        fontSize: `var(${cssVariable}-font-size)`,
                        fontWeight: `var(${cssVariable}-font-weight)`,
                        lineHeight: `var(${cssVariable}-line-height)`,
                      }}
                    >
                      {sampleText[categoryKey]}
                    </pre>
                    <TokenDisplay cssVariable={cssVariable} jsPath={jsPath} jsFlat={jsFlat} />
                  </li>
                );
              }

              // Labels
              if (categoryKey === 'label') {
                return (
                  <li key={variant} className={styles.example}>
                    <span style={{ font: `var(${cssVariable})` }}>
                      {`${variant.toUpperCase()} ${sampleText[categoryKey]}`}
                    </span>
                    <TokenDisplay cssVariable={cssVariable} jsPath={jsPath} jsFlat={jsFlat} />
                  </li>
                );
              }

              // Headings and body text
              const SampleElement =
                categoryKey === 'heading'
                  ? variant === '3xl' || variant === '2xl'
                    ? 'h1'
                    : variant === 'xl' || variant === 'lg'
                      ? 'h2'
                      : variant === 'md'
                        ? 'h3'
                        : 'h4'
                  : 'p';

              return (
                <li key={variant} className={styles.example}>
                  <SampleElement
                    className={styles.preview}
                    style={{
                      fontFamily: `var(${cssVariable}-font-family)`,
                      fontSize: `var(${cssVariable}-font-size)`,
                      fontWeight: `var(${cssVariable}-font-weight)`,
                      lineHeight: `var(${cssVariable}-line-height)`,
                      margin: 0,
                    }}
                  >
                    {sampleText[categoryKey]}
                  </SampleElement>
                  <TokenDisplay cssVariable={cssVariable} jsPath={jsPath} jsFlat={jsFlat} />
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
};
