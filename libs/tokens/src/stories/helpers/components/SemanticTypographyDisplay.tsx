import React from 'react';
import { ERROR_MESSAGES, LOADING_MESSAGES } from '../constants/displayConstants';
import styles from '../styles/SemanticTypographyDisplay.module.css';
import { getSemanticTypography } from '../tokenHelpers';
import { useDocumentationData } from '../useDocumentationData';

interface TypographySectionProps {
  category: string;
  variants: Array<{
    variant: string;
    cssVariable: string;
    jsPath: string;
    jsFlat?: string;
  }>;
}

export const TypographySection: React.FC<TypographySectionProps> = ({ category, variants }) => {
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
    <section className={styles.section}>
      <h2>{categoryLabels[category] || category}</h2>
      <div className={styles.content}>
        {variants.map((token) => {
          const { variant, cssVariable, jsPath, jsFlat } = token;

          if (category === 'action') {
            return (
              <div key={variant} className={styles.example}>
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
                  {`${variant.toUpperCase()} ${sampleText[category]}`}
                </button>
                <div className={styles.tokenInfo}>
                  <code className={styles.variable}>CSS: {cssVariable}</code>
                  <code className={styles.path}>JSON: {jsPath}</code>
                  <code className={styles.path}>JS: {jsFlat || jsPath}</code>
                </div>
              </div>
            );
          }

          if (category === 'label') {
            return (
              <div key={variant} className={styles.example}>
                <span style={{ font: `var(${cssVariable})` }}>
                  {`${variant.toUpperCase()} ${sampleText[category]}`}
                </span>
                <div className={styles.tokenInfo}>
                  <code className={styles.variable}>CSS: {cssVariable}</code>
                  <code className={styles.path}>JSON: {jsPath}</code>
                  <code className={styles.path}>JS: {jsFlat || jsPath}</code>
                </div>
              </div>
            );
          }

          if (category === 'code') {
            return (
              <div key={variant} className={styles.example}>
                <pre
                  className={styles.codeBlock}
                  style={{
                    fontFamily: `var(${cssVariable}-font-family)`,
                    fontSize: `var(${cssVariable}-font-size)`,
                    fontWeight: `var(${cssVariable}-font-weight)`,
                    lineHeight: `var(${cssVariable}-line-height)`,
                  }}
                >
                  {sampleText[category]}
                </pre>
                <div className={styles.tokenInfo}>
                  <code className={styles.variable}>CSS: {cssVariable}</code>
                  <code className={styles.path}>JSON: {jsPath}</code>
                  <code className={styles.path}>JS: {jsFlat || jsPath}</code>
                </div>
              </div>
            );
          }

          // Determine the appropriate HTML element based on category
          const SampleElement =
            category === 'heading'
              ? variant === '3xl' || variant === '2xl'
                ? 'h1'
                : variant === 'xl' || variant === 'lg'
                  ? 'h2'
                  : variant === 'md'
                    ? 'h3'
                    : 'h4'
              : category === 'body'
                ? 'p'
                : category === 'code'
                  ? 'pre'
                  : 'span';

          const sampleStyle = {
            fontFamily: `var(${cssVariable}-font-family)`,
            fontSize: `var(${cssVariable}-font-size)`,
            fontWeight: `var(${cssVariable}-font-weight)`,
            lineHeight: `var(${cssVariable}-line-height)`,
          };

          return (
            <div key={variant} className={styles.example}>
              {category === 'code' ? (
                <pre className={styles.sample} style={sampleStyle}>
                  <code>{sampleText[category]}</code>
                </pre>
              ) : (
                <SampleElement className={styles.sample} style={sampleStyle}>
                  {sampleText[category]}
                </SampleElement>
              )}
              <div className={styles.tokenInfo}>
                <code className={styles.variable}>CSS: {cssVariable}</code>
                <code className={styles.path}>JSON: {jsPath}</code>
                <code className={styles.path}>
                  JS:{' '}
                  {jsPath
                    .split('.')
                    .map((part, i) =>
                      i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
                    )
                    .join('')}
                </code>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export type SemanticTypographyDisplayProps = {
  categories?: string[];
};

export const SemanticTypographyDisplay: React.FC<SemanticTypographyDisplayProps> = ({
  categories,
}) => {
  const { data, loading, error } = useDocumentationData();

  if (loading) return <div>{LOADING_MESSAGES.typography}</div>;
  if (error)
    return (
      <div>
        {ERROR_MESSAGES.typography}: {error}
      </div>
    );
  if (!data) return null;

  const allTypographyData = getSemanticTypography(data.sys?.typography || []);

  // If categories are specified, filter and order according to the prop
  const typographyData = categories
    ? (categories
        .map((cat) => allTypographyData.find(({ category }) => category === cat))
        .filter(Boolean) as typeof allTypographyData)
    : allTypographyData;

  return (
    <>
      {typographyData.map(({ category, variants }) => (
        <TypographySection key={category} category={category} variants={variants} />
      ))}
    </>
  );
};
