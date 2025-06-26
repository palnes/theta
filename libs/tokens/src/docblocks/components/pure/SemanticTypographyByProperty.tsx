import React from 'react';
import type { TokenInfo } from '../../types/tokenReferenceTable';
import styles from '../../styles/Typography.module.css';
import { TypographyPreview } from './TypographyPreview';

export interface SemanticTypographyByPropertyProps {
  tokens: TokenInfo[];
  property: 'fontSize' | 'fontWeight' | 'lineHeight' | 'fontFamily';
}

/**
 * Display semantic typography tokens grouped by property type
 * This matches the reference typography display format
 */
export const SemanticTypographyByProperty: React.FC<SemanticTypographyByPropertyProps> = ({
  tokens,
  property,
}) => {
  // Filter tokens by property type
  const propertyTokens = tokens.filter((token) => {
    const pathParts = token.path?.split('.') || [];
    return pathParts[pathParts.length - 1] === property;
  });

  // Sort tokens by category and variant
  const sortedTokens = propertyTokens.sort((a, b) => {
    const aPath = a.path?.split('.') || [];
    const bPath = b.path?.split('.') || [];

    // First sort by category (heading, body, action, etc.)
    const categoryOrder = ['heading', 'body', 'action', 'label', 'code'];
    const aCategory = aPath[2] || '';
    const bCategory = bPath[2] || '';
    const aCategoryIndex = categoryOrder.indexOf(aCategory);
    const bCategoryIndex = categoryOrder.indexOf(bCategory);

    if (aCategoryIndex !== bCategoryIndex) {
      return aCategoryIndex - bCategoryIndex;
    }

    // Then sort by variant size
    const sizeOrder = ['3xl', '2xl', 'xl', 'lg', 'md', 'sm', 'xs', '2xs'];
    const aVariant = aPath[3] || '';
    const bVariant = bPath[3] || '';
    const aSizeIndex = sizeOrder.indexOf(aVariant);
    const bSizeIndex = sizeOrder.indexOf(bVariant);

    if (aSizeIndex !== -1 && bSizeIndex !== -1) {
      return aSizeIndex - bSizeIndex;
    }

    return aVariant.localeCompare(bVariant);
  });

  const getPreviewText = (token: TokenInfo) => {
    const pathParts = token.path?.split('.') || [];
    const category = pathParts[2];
    const variant = pathParts[3];

    const categoryLabels: Record<string, string> = {
      heading: 'Heading',
      body: 'Body',
      action: 'Action',
      label: 'Label',
      code: 'Code',
    };

    // For font weights, show the standard preview text
    if (property === 'fontWeight') {
      return 'The quick brown fox jumps over the lazy dog';
    }

    // For line heights, show multiple lines
    if (property === 'lineHeight') {
      return 'The quick brown fox jumps over the lazy dog. This is sample text that demonstrates the line height spacing between multiple lines of text.';
    }

    return `${categoryLabels[category || ''] || category || ''} ${variant?.toUpperCase() || ''}`;
  };

  const getPreviewStyle = (token: TokenInfo): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {};

    // For line height demos, constrain width to force wrapping
    if (property === 'lineHeight') {
      baseStyle.maxWidth = '600px';
    }

    switch (property) {
      case 'fontSize':
        return { ...baseStyle, fontSize: `var(${token.cssVariable})` };
      case 'fontWeight':
        return { ...baseStyle, fontWeight: `var(${token.cssVariable})` };
      case 'lineHeight':
        return { ...baseStyle, lineHeight: `var(${token.cssVariable})` };
      case 'fontFamily':
        return { ...baseStyle, fontFamily: `var(${token.cssVariable})` };
      default:
        return baseStyle;
    }
  };

  return (
    <ul className={styles.fontSizeList}>
      {sortedTokens.map((token) => (
        <li key={token.path}>
          <TypographyPreview
            preview={getPreviewText(token)}
            style={getPreviewStyle(token)}
            cssVariable={token.cssVariable}
            jsPath={token.jsPath}
            jsFlat={token.jsFlat}
          />
        </li>
      ))}
    </ul>
  );
};
