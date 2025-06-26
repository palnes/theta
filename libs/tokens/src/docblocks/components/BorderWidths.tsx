import React from 'react';
import { useBorderTokens } from '../hooks/useTokens';
import sharedStyles from '../styles/shared.module.css';
import type { BorderToken } from '../types/tokens';
import { createTokenFormats } from '../tools/tokenUtils';
import { TokenCard } from './TokenCard';

/**
 * Display border width tokens
 * More focused component that does one thing well
 */
interface BorderTokenGroup {
  width?: BorderToken[];
  style?: BorderToken[];
}

export const BorderWidths: React.FC = () => {
  const { data, loading, error } = useBorderTokens();

  if (loading) return <div>Loading border widths...</div>;
  if (error) return <div>Error loading borders: {error}</div>;
  if (!data) return <div>No border data available</div>;

  const borderData = data as BorderTokenGroup;
  const widthTokens = borderData.width || [];

  return (
    <ul className={sharedStyles.gridMedium}>
      {widthTokens.map(({ key, description, cssVariable, jsPath, jsFlat, value }) => {
        const formats = createTokenFormats(cssVariable, jsPath, key, 'border-width', jsFlat);

        return (
          <li key={key} style={{ listStyle: 'none' }}>
            <TokenCard
              title={key}
              formats={formats}
              preview={
                <div
                  className={sharedStyles.exampleBox}
                  style={{
                    borderWidth: value,
                    borderStyle: 'solid',
                    borderColor: 'var(--sys-color-border-strong)',
                  }}
                />
              }
            >
              {description && <p className={sharedStyles.description}>{description}</p>}
            </TokenCard>
          </li>
        );
      })}
    </ul>
  );
};
