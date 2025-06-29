import React from 'react';
import { useTokens } from '../../hooks/useTokens';
import styles from '../../styles/Typography.module.css';
import { TokenFormats } from '../token-display/TokenFormats';

interface TypographyPreviewProps {
  tier: string;
  category?: string;
  filter?: (token: any) => boolean;
}

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

  // Sort tokens within each property group
  const sortTokens = (tokensArray: any[], property: string) => {
    return tokensArray.sort((a, b) => {
      // For semantic tokens, use size order
      const sizeOrder = ['3xl', '2xl', 'xl', 'lg', 'md', 'sm', 'xs', '2xs'];

      // Extract the variant from the path
      const getVariant = (token: any) => {
        const parts = token.path?.split('.') || [];
        // For sys.typography.heading.3xl.fontSize -> "3xl"
        return parts[parts.length - 2] || '';
      };

      const aVariant = getVariant(a);
      const bVariant = getVariant(b);

      const aIndex = sizeOrder.indexOf(aVariant);
      const bIndex = sizeOrder.indexOf(bVariant);

      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }

      // For ref tokens or others, try numeric sort
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
              {sortedTokens.map((token) => {
                let preview: React.ReactNode;
                const value = token.value;

                switch (property) {
                  case 'fontSize':
                    preview = (
                      <div
                        style={{
                          fontSize: typeof value === 'number' ? `${value}px` : value,
                          lineHeight: 1.4,
                          margin: 0,
                          padding: 0,
                        }}
                      >
                        The quick brown fox jumps over the lazy dog
                      </div>
                    );
                    break;

                  case 'fontWeight':
                    preview = (
                      <div
                        style={{
                          fontWeight: value,
                          fontSize: '16px',
                          lineHeight: 1.4,
                          margin: 0,
                          padding: 0,
                        }}
                      >
                        The quick brown fox jumps over the lazy dog
                      </div>
                    );
                    break;

                  case 'lineHeight':
                    preview = (
                      <div style={{ lineHeight: value, fontSize: '16px', margin: 0, padding: 0 }}>
                        Line one
                        <br />
                        Line two
                        <br />
                        Line three
                      </div>
                    );
                    break;

                  case 'fontFamily': {
                    const fontValue = Array.isArray(value) ? value.join(', ') : value;
                    preview = (
                      <div
                        style={{
                          fontFamily: fontValue,
                          fontSize: '16px',
                          lineHeight: 1.4,
                          margin: 0,
                          padding: 0,
                        }}
                      >
                        The quick brown fox jumps over the lazy dog
                      </div>
                    );
                    break;
                  }

                  default:
                    preview = <div>{String(value)}</div>;
                }

                return (
                  <div key={token.name} className={styles.typographyRow}>
                    <div className={styles.typographyExample}>{preview}</div>
                    <div className={styles.typographyInfo}>
                      <div className={styles.typographyMeta}>
                        <h3 className={styles.tokenName}>
                          {/* For semantic tokens, show more context */}
                          {token.path && token.path.split('.').length > 3
                            ? token.path.split('.').slice(2).join('-')
                            : token.name}
                        </h3>
                        <span className={styles.tokenDetail}>
                          {property === 'fontSize' &&
                            (typeof value === 'number' ? `${value}px` : value)}
                          {property === 'fontWeight' && value}
                          {property === 'lineHeight' && value}
                          {property === 'fontFamily' && (Array.isArray(value) ? value[0] : value)}
                        </span>
                      </div>
                      <div className={styles.tokenUsage}>
                        <TokenFormats usage={token.usage} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};
