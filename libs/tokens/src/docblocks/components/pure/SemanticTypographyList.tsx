import React from 'react';
import styles from '../../styles/TypographyShowcase.module.css';
import type { TypographyCategory } from '../../types/tokens';
import { TokenDisplay } from './TokenDisplay';

export interface SemanticTypographyListProps {
  categories: TypographyCategory[];
  filter?: string;
}

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

/**
 * Pure component for displaying semantic typography
 */
export const SemanticTypographyList: React.FC<SemanticTypographyListProps> = ({
  categories,
  filter,
}) => {
  const filteredCategories = filter
    ? categories.filter((cat) => cat.category === filter)
    : categories;

  return (
    <div className={styles.container}>
      {filteredCategories.map((category) => (
        <section key={category.category} className={styles.section}>
          <h2>{categoryLabels[category.category] || category.category}</h2>
          <ul className={styles.tokenList}>
            {category.variants.map((token) => {
              const { variant, cssVariable, jsPath, jsFlat } = token;
              const categoryKey = category.category;

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
                    <TokenDisplay
                      formats={[
                        { label: 'Size', value: `${cssVariable}-font-size` },
                        { label: 'Weight', value: `${cssVariable}-font-weight` },
                        { label: 'Height', value: `${cssVariable}-line-height` },
                        { label: 'Family', value: `${cssVariable}-font-family` },
                        { label: 'JSON', value: jsPath },
                        { label: 'JS', value: jsFlat || jsPath },
                      ]}
                    />
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
                    <TokenDisplay
                      formats={[
                        { label: 'Size', value: `${cssVariable}-font-size` },
                        { label: 'Weight', value: `${cssVariable}-font-weight` },
                        { label: 'Height', value: `${cssVariable}-line-height` },
                        { label: 'Family', value: `${cssVariable}-font-family` },
                        { label: 'JSON', value: jsPath },
                        { label: 'JS', value: jsFlat || jsPath },
                      ]}
                    />
                  </li>
                );
              }

              // Labels
              if (categoryKey === 'label') {
                return (
                  <li key={variant} className={styles.example}>
                    <span
                      style={{
                        fontFamily: `var(${cssVariable}-font-family)`,
                        fontSize: `var(${cssVariable}-font-size)`,
                        fontWeight: `var(${cssVariable}-font-weight)`,
                        lineHeight: `var(${cssVariable}-line-height)`,
                      }}
                    >
                      {`${variant.toUpperCase()} ${sampleText[categoryKey]}`}
                    </span>
                    <TokenDisplay
                      formats={[
                        { label: 'Size', value: `${cssVariable}-font-size` },
                        { label: 'Weight', value: `${cssVariable}-font-weight` },
                        { label: 'Height', value: `${cssVariable}-line-height` },
                        { label: 'Family', value: `${cssVariable}-font-family` },
                        { label: 'JSON', value: jsPath },
                        { label: 'JS', value: jsFlat || jsPath },
                      ]}
                    />
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
                  <TokenDisplay
                    formats={[
                      { label: 'CSS', value: cssVariable },
                      { label: 'JSON', value: jsPath },
                      { label: 'JS', value: jsFlat || '' },
                    ]}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
};
