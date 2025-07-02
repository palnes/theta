import type React from 'react';
import { useTokens } from '../../hooks/useTokens';
import styles from '../../styles/Typography.module.css';
import { TokenFormats } from '../token-display/TokenFormats';

interface TypographyPreviewProps {
  tier: string;
  category?: string;
  filter?: (token: any) => boolean;
}

interface TypographyTokenRowProps {
  token: any;
  property: string;
}

// Base style for all previews
const basePreviewStyle = {
  margin: 0,
  padding: 0,
  lineHeight: 1.4,
};

// Get preview text based on property
const getPreviewText = (property: string) => {
  if (property === 'lineHeight') {
    return (
      <>
        Line one
        <br />
        Line two
        <br />
        Line three
      </>
    );
  }
  return 'The quick brown fox jumps over the lazy dog';
};

// Format font family value
const formatFontFamily = (value: any) => {
  return Array.isArray(value) ? value.join(', ') : value;
};

// Get style for specific property
const getPropertyStyle = (value: any, property: string) => {
  switch (property) {
    case 'fontSize':
      return {
        fontSize: typeof value === 'number' ? `${value}px` : value,
      };
    case 'fontWeight':
      return {
        fontWeight: value,
        fontSize: '16px',
      };
    case 'lineHeight':
      return {
        lineHeight: typeof value === 'number' ? `${value}px` : value,
        fontSize: '16px',
      };
    case 'fontFamily':
      return {
        fontFamily: formatFontFamily(value),
        fontSize: '16px',
      };
    default:
      return {};
  }
};

// Get style for composite typography token
const getCompositeStyle = (value: any) => {
  if (typeof value !== 'object' || value === null || !('fontFamily' in value)) {
    return null;
  }

  return {
    fontFamily: formatFontFamily(value.fontFamily),
    fontSize: typeof value.fontSize === 'number' ? `${value.fontSize}px` : value.fontSize,
    fontWeight: value.fontWeight,
    lineHeight: typeof value.lineHeight === 'number' ? `${value.lineHeight}px` : value.lineHeight,
  };
};

// Helper component to render token preview
const TokenPreview: React.FC<{ value: any; property: string }> = ({ value, property }) => {
  // Handle composite tokens first
  if (
    property === 'default' ||
    !['fontSize', 'fontWeight', 'lineHeight', 'fontFamily'].includes(property)
  ) {
    const compositeStyle = getCompositeStyle(value);
    if (compositeStyle) {
      return (
        <div style={{ ...basePreviewStyle, ...compositeStyle }}>{getPreviewText(property)}</div>
      );
    }
    return <div>{String(value)}</div>;
  }

  // Handle specific properties
  const propertyStyle = getPropertyStyle(value, property);
  return <div style={{ ...basePreviewStyle, ...propertyStyle }}>{getPreviewText(property)}</div>;
};

// Helper component to format token detail value
const TokenDetailValue: React.FC<{ value: any; property: string }> = ({ value, property }) => {
  if (property === 'fontSize') {
    return <>{typeof value === 'number' ? `${value}px` : value}</>;
  }

  if (property === 'fontWeight' || property === 'lineHeight') {
    return <>{value}</>;
  }

  if (property === 'fontFamily') {
    return <>{Array.isArray(value) ? value[0] : value}</>;
  }

  // Handle composite typography tokens
  if (typeof value === 'object' && value !== null && 'fontFamily' in value) {
    return <>{Array.isArray(value.fontFamily) ? value.fontFamily[0] : value.fontFamily}</>;
  }

  return null;
};

// Typography token row component
const TypographyTokenRow: React.FC<TypographyTokenRowProps> = ({ token, property }) => {
  const value = token.value;
  const tokenName =
    token.path && token.path.split('.').length > 3
      ? token.path.split('.').slice(2).join('-')
      : token.name;

  return (
    <div className={styles.typographyRow}>
      <div className={styles.typographyExample}>
        <TokenPreview value={value} property={property} />
      </div>
      <div className={styles.typographyInfo}>
        <div className={styles.typographyMeta}>
          <h3 className={styles.tokenName}>{tokenName}</h3>
          <span className={styles.tokenDetail}>
            <TokenDetailValue value={value} property={property} />
          </span>
        </div>
        <div className={styles.tokenUsage}>
          <TokenFormats usage={token.usage} />
        </div>
      </div>
    </div>
  );
};

export const TypographyPreview: React.FC<TypographyPreviewProps> = ({
  tier,
  category = 'typography',
  filter,
}) => {
  const { tokens, loading, error } = useTokens({
    tier: tier as any,
    category: category as any,
    filter,
  });

  if (loading) return <div>Loading typography...</div>;
  if (error) return <div>Error loading typography: {error}</div>;
  if (!tokens || tokens.length === 0) return <div>No typography tokens found</div>;

  // Group tokens by property type (fontSize, fontWeight, etc.)
  const propertyGroups = tokens.reduce(
    (acc, token) => {
      const pathParts = token.path?.split('.') || [];
      const property = pathParts[pathParts.length - 1];

      if (property) {
        if (!acc[property]) {
          acc[property] = [];
        }
        acc[property].push(token);
      }

      return acc;
    },
    {} as Record<string, any[]>
  );

  // Extract the variant from the path
  const getVariant = (token: any) => {
    const parts = token.path?.split('.') || [];
    // For sys.typography.heading.3xl.fontSize -> "3xl"
    return parts[parts.length - 2] || '';
  };

  // Compare tokens by semantic size order
  const compareBySizeOrder = (aVariant: string, bVariant: string) => {
    const sizeOrder = ['3xl', '2xl', 'xl', 'lg', 'md', 'sm', 'xs', '2xs'];
    const aIndex = sizeOrder.indexOf(aVariant);
    const bIndex = sizeOrder.indexOf(bVariant);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    return null;
  };

  // Compare tokens by numeric value based on property type
  const compareByNumericValue = (a: any, b: any, property: string) => {
    if (property === 'fontSize') {
      const aNum = Number.parseInt(a.value);
      const bNum = Number.parseInt(b.value);
      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
        return bNum - aNum; // Larger sizes first
      }
    }

    if (property === 'fontWeight') {
      const aNum = Number.parseInt(a.value);
      const bNum = Number.parseInt(b.value);
      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
        return aNum - bNum; // Lighter weights first
      }
    }

    return null;
  };

  // Sort tokens within each property group
  const sortTokens = (tokensArray: any[], property: string) => {
    return tokensArray.sort((a, b) => {
      const aVariant = getVariant(a);
      const bVariant = getVariant(b);

      // Try semantic size order first
      const sizeComparison = compareBySizeOrder(aVariant, bVariant);
      if (sizeComparison !== null) {
        return sizeComparison;
      }

      // Try numeric comparison based on property type
      const numericComparison = compareByNumericValue(a, b, property);
      if (numericComparison !== null) {
        return numericComparison;
      }

      // Fallback to alphabetical
      return a.name.localeCompare(b.name);
    });
  };

  // Define property order
  const propertyOrder = ['fontSize', 'fontWeight', 'lineHeight', 'fontFamily'];
  const sortedProperties = Object.entries(propertyGroups).sort(([a], [b]) => {
    const aIndex = propertyOrder.indexOf(a);
    const bIndex = propertyOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  // Property labels
  const propertyLabels: Record<string, string> = {
    fontSize: 'Font Sizes',
    fontWeight: 'Font Weights',
    lineHeight: 'Line Heights',
    fontFamily: 'Font Families',
  };

  return (
    <div className={styles.container}>
      {sortedProperties.map(([property, propertyTokens]) => {
        const sortedTokens = sortTokens(propertyTokens, property);

        return (
          <section key={property} className={styles.section}>
            <h2 className={styles.sectionTitle}>{propertyLabels[property] || property}</h2>

            <div className={styles.typographyTable}>
              {sortedTokens.map((token) => (
                <TypographyTokenRow key={token.name} token={token} property={property} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
