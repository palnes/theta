import React from 'react';
import styles from '../docs.module.css';

// Warning callout for critical issues only
export const Warning = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      borderLeft: '3px solid var(--sys-color-status-warning-text)',
      paddingLeft: '1rem',
      margin: '1.5rem 0',
    }}
  >
    <strong>⚠️ Warning:</strong> {children}
  </div>
);

// Error callout for breaking changes
export const ErrorCallout = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      borderLeft: '3px solid var(--sys-color-status-error-text)',
      paddingLeft: '1rem',
      margin: '1.5rem 0',
    }}
  >
    <strong>❌ Error:</strong> {children}
  </div>
);

// Side-by-side comparison
export const Comparison = ({
  incorrect,
  correct,
}: {
  incorrect: React.ReactNode;
  correct: React.ReactNode;
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      margin: '1rem 0',
    }}
  >
    <div
      style={{
        border: '1px solid var(--sys-color-status-error-border)',
        borderRadius: 'var(--sys-radius-medium)',
        padding: '1rem',
        background: 'var(--sys-color-status-error-surface)',
      }}
    >
      <strong>❌ Incorrect</strong>
      {incorrect}
    </div>
    <div
      style={{
        border: '1px solid var(--sys-color-status-success-border)',
        borderRadius: 'var(--sys-radius-medium)',
        padding: '1rem',
        background: 'var(--sys-color-status-success-surface)',
      }}
    >
      <strong>✅ Correct</strong>
      {correct}
    </div>
  </div>
);

// Color swatch for color documentation
export const ColorSwatch = ({
  color,
  name,
}: {
  color: string;
  name: string;
}) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
    <div className={styles['doc-color-swatch']} style={{ backgroundColor: color }} />
    <code className={styles['doc-code-inline']}>{name}</code>
  </div>
);

// Spacing visualization
export const SpacingExample = ({
  size,
  token,
}: {
  size: string;
  token: string;
}) => (
  <div style={{ marginBottom: '1rem' }}>
    <div className={styles['doc-spacing-example']} style={{ width: `var(${token})` }} />
    <div className={styles['doc-text-small']} style={{ marginTop: '0.25rem' }}>
      <code className={styles['doc-code-inline']}>{token}</code> ({size})
    </div>
  </div>
);

// Typography sample
export const TypographySample = ({
  token,
  text = 'The quick brown fox jumps over the lazy dog',
}: {
  token: string;
  text?: string;
}) => (
  <div className={styles['doc-typography-sample']}>
    <div style={{ font: `var(${token})` }}>{text}</div>
    <code className={styles['doc-code-inline']} style={{ fontSize: '0.75rem' }}>
      {token}
    </code>
  </div>
);

// Section wrapper
export const Section = ({
  children,
}: {
  children: React.ReactNode;
}) => <div className={styles['doc-section']}>{children}</div>;
