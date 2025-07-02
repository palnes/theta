import type React from 'react';
import { ERROR_MESSAGES, LOADING_MESSAGES } from '../../constants/displayConstants';
import { useTypographyTokens } from '../../hooks/useTypographyTokens';
import styles from '../../styles/TypographyShowcase.module.css';
import { FontFamilyList } from './FontFamilyList';
import { FontSizeList } from './FontSizeList';
import { FontWeightList } from './FontWeightList';
import { LineHeightList } from './LineHeightList';

interface TypographyShowcaseProps {
  type: 'reference' | 'semantic';
  category?: 'fontSize' | 'fontWeight' | 'lineHeight' | 'fontFamily' | 'all';
  filter?: (token: any) => boolean;
}

/**
 * Container component for typography showcase
 * Uses separated business logic and pure components
 */
export const TypographyShowcase: React.FC<TypographyShowcaseProps> = ({
  type,
  category = 'all',
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

  // Typography display (both reference and semantic)
  if (tokens && 'fontSizes' in tokens) {
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

  return null;
};
