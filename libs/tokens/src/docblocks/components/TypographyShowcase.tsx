import React from 'react';
import { ERROR_MESSAGES, LOADING_MESSAGES } from '../constants/displayConstants';
import { useTypographyTokens } from '../hooks/useTypographyTokens';
import styles from '../styles/TypographyShowcase.module.css';
import {
  FontFamilyList,
  FontSizeList,
  FontWeightList,
  LineHeightList,
  SemanticTypographyList,
} from './pure';

interface TypographyShowcaseProps {
  type: 'reference' | 'semantic';
  category?: 'fontSize' | 'fontWeight' | 'lineHeight' | 'fontFamily' | 'all';
  semanticCategory?: 'heading' | 'body' | 'action' | 'label' | 'code';
}

/**
 * Container component for typography showcase
 * Uses separated business logic and pure components
 */
export const TypographyShowcase: React.FC<TypographyShowcaseProps> = ({
  type,
  category = 'all',
  semanticCategory,
}) => {
  const { tokens, loading, error } = useTypographyTokens(type);

  if (loading) return <div className={styles.loading}>{LOADING_MESSAGES.typography}</div>;
  if (error)
    return (
      <div className={styles.error}>
        {ERROR_MESSAGES.typography}: {error}
      </div>
    );
  if (!tokens) return null;

  // Reference typography display
  if (type === 'reference' && 'fontSizes' in tokens) {
    const shouldShowFontSizes = category === 'all' || category === 'fontSize';
    const shouldShowFontWeights = category === 'all' || category === 'fontWeight';
    const shouldShowLineHeights = category === 'all' || category === 'lineHeight';
    const shouldShowFontFamilies = category === 'all' || category === 'fontFamily';

    return (
      <div className={styles.container}>
        {shouldShowFontSizes && tokens.fontSizes && (
          <section className={styles.section}>
            <h2>Font Sizes</h2>
            <FontSizeList fontSizes={tokens.fontSizes} />
          </section>
        )}

        {shouldShowFontWeights && tokens.fontWeights && (
          <section className={styles.section}>
            <h2>Font Weights</h2>
            <FontWeightList fontWeights={tokens.fontWeights} />
          </section>
        )}

        {shouldShowLineHeights && tokens.lineHeights && (
          <section className={styles.section}>
            <h2>Line Heights</h2>
            <LineHeightList lineHeights={tokens.lineHeights} />
          </section>
        )}

        {shouldShowFontFamilies && tokens.fontFamilies && (
          <section className={styles.section}>
            <h2>Font Families</h2>
            <FontFamilyList fontFamilies={tokens.fontFamilies} />
          </section>
        )}
      </div>
    );
  }

  // Semantic typography display
  if (type === 'semantic' && 'categories' in tokens) {
    return (
      <SemanticTypographyList categories={tokens.categories || []} filter={semanticCategory} />
    );
  }

  return null;
};
