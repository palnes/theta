import React from 'react';
import { ERROR_MESSAGES, LOADING_MESSAGES } from '../constants/displayConstants';
import { useTokens } from '../hooks/useTokens';
import styles from '../styles/TypographyShowcase.module.css';
import { SemanticTypographyByProperty } from './pure/SemanticTypographyByProperty';

interface SemanticTypographyPropertyShowcaseProps {
  property?: 'fontSize' | 'fontWeight' | 'lineHeight' | 'fontFamily' | 'all';
}

/**
 * Display semantic typography tokens grouped by property type
 * This matches the reference typography display format
 */
export const SemanticTypographyPropertyShowcase: React.FC<
  SemanticTypographyPropertyShowcaseProps
> = ({ property = 'all' }) => {
  const {
    data: tokens,
    loading,
    error,
  } = useTokens({
    tier: 'sys',
    category: 'typography',
    process: false, // Get raw tokens array, not processed data
  });

  if (loading) return <div className={styles.loading}>{LOADING_MESSAGES.typography}</div>;
  if (error)
    return (
      <div className={styles.error}>
        {ERROR_MESSAGES.typography}: {error}
      </div>
    );
  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) return null;

  const shouldShowFontSizes = property === 'all' || property === 'fontSize';
  const shouldShowFontWeights = property === 'all' || property === 'fontWeight';
  const shouldShowLineHeights = property === 'all' || property === 'lineHeight';
  const shouldShowFontFamilies = property === 'all' || property === 'fontFamily';

  return (
    <div className={styles.container}>
      {shouldShowFontSizes && (
        <section className={styles.section}>
          <h2>Font Sizes</h2>
          <SemanticTypographyByProperty tokens={tokens} property="fontSize" />
        </section>
      )}

      {shouldShowFontWeights && (
        <section className={styles.section}>
          <h2>Font Weights</h2>
          <SemanticTypographyByProperty tokens={tokens} property="fontWeight" />
        </section>
      )}

      {shouldShowLineHeights && (
        <section className={styles.section}>
          <h2>Line Heights</h2>
          <SemanticTypographyByProperty tokens={tokens} property="lineHeight" />
        </section>
      )}

      {shouldShowFontFamilies && (
        <section className={styles.section}>
          <h2>Font Families</h2>
          <SemanticTypographyByProperty tokens={tokens} property="fontFamily" />
        </section>
      )}
    </div>
  );
};
