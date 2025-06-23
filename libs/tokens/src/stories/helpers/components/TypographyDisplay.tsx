import React from 'react';
import { ERROR_MESSAGES, LOADING_MESSAGES } from '../constants/displayConstants';
import { useSelectableContent } from '../hooks/useSelectableContent';
import styles from '../styles/Typography.module.css';
import {
  extractFontFamilies,
  extractFontSizes,
  extractFontWeights,
  extractLineHeights,
  formatFontFamilyValue,
} from '../tokenHelpers';
import { useDocumentationData } from '../useDocumentationData';

// Helper component for token display
const TokenDisplay: React.FC<{ cssVariable: string; jsPath: string; jsFlat?: string }> = ({
  cssVariable,
  jsPath,
  jsFlat,
}) => {
  const { handleSelectContent } = useSelectableContent();
  const jsDisplay = jsFlat || jsPath;

  return (
    <div className={styles.tokenInfo}>
      <div className={styles.tokenRow}>
        <span className={styles.tokenLabel}>CSS:</span>
        <code
          className={styles.tokenValue}
          onClick={handleSelectContent}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSelectContent(e as any);
            }
          }}
        >
          {cssVariable}
        </code>
      </div>
      <div className={styles.tokenRow}>
        <span className={styles.tokenLabel}>JSON:</span>
        <code
          className={styles.tokenValue}
          onClick={handleSelectContent}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSelectContent(e as any);
            }
          }}
        >
          {jsPath}
        </code>
      </div>
      <div className={styles.tokenRow}>
        <span className={styles.tokenLabel}>JS:</span>
        <code
          className={styles.tokenValue}
          onClick={handleSelectContent}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSelectContent(e as any);
            }
          }}
        >
          {jsDisplay}
        </code>
      </div>
    </div>
  );
};

export type FontSizesProps = Record<string, never>;

export const FontSizes: React.FC<FontSizesProps> = () => {
  const { data, loading, error } = useDocumentationData();

  if (loading) return <div>{LOADING_MESSAGES.fontSizes}</div>;
  if (error)
    return (
      <div>
        {ERROR_MESSAGES.fontSizes}: {error}
      </div>
    );
  if (!data) return null;

  const fontSizes = extractFontSizes(data.ref?.fontSize || []);

  return (
    <ul className={styles.fontSizeList}>
      {fontSizes.map(({ key, cssVariable, jsPath, jsFlat }) => (
        <li key={key} className={styles.example}>
          <div className={styles.preview} style={{ fontSize: `var(${cssVariable})` }}>
            The quick brown fox jumps over the lazy dog
          </div>
          <TokenDisplay cssVariable={cssVariable} jsPath={jsPath} jsFlat={jsFlat} />
        </li>
      ))}
    </ul>
  );
};

export type FontWeightsProps = Record<string, never>;

export const FontWeights: React.FC<FontWeightsProps> = () => {
  const { data, loading, error } = useDocumentationData();

  if (loading) return <div>Loading font weights...</div>;
  if (error) return <div>Error loading font weights: {error}</div>;
  if (!data) return null;

  const fontWeights = extractFontWeights(data.ref?.fontWeight || []);

  return (
    <ul className={styles.fontWeightList}>
      {fontWeights.map(({ name, value, cssVariable, jsPath, jsFlat }) => {
        return (
          <li key={value} className={styles.example}>
            <div className={styles.preview} style={{ fontWeight: `var(${cssVariable})` }}>
              {name} ({value}) - The quick brown fox jumps over the lazy dog
            </div>
            <TokenDisplay cssVariable={cssVariable} jsPath={jsPath} jsFlat={jsFlat} />
          </li>
        );
      })}
    </ul>
  );
};

export type LineHeightsProps = Record<string, never>;

export const LineHeights: React.FC<LineHeightsProps> = () => {
  const { data, loading, error } = useDocumentationData();

  if (loading) return <div>Loading line heights...</div>;
  if (error) return <div>Error loading line heights: {error}</div>;
  if (!data) return null;

  const lineHeights = extractLineHeights(data.ref?.lineHeightPx || []);

  return (
    <ul className={styles.lineHeightList}>
      {lineHeights.map(({ name, key, description, cssVariable, jsPath, jsFlat }) => {
        return (
          <li key={key} className={styles.example}>
            <div className={styles.preview} style={{ lineHeight: `var(${cssVariable})` }}>
              <strong>{name}</strong>
              <br />
              This text has {name} line height.
              <br />
              {description}.
            </div>
            <TokenDisplay cssVariable={cssVariable} jsPath={jsPath} jsFlat={jsFlat} />
          </li>
        );
      })}
    </ul>
  );
};

export type FontFamiliesProps = Record<string, never>;

export const FontFamilies: React.FC<FontFamiliesProps> = () => {
  const { data, loading, error } = useDocumentationData();

  if (loading) return <div>Loading font families...</div>;
  if (error) return <div>Error loading font families: {error}</div>;
  if (!data) return null;

  const fontFamilies = extractFontFamilies(data.ref?.fontFamily || []);

  return (
    <ul className={styles.fontFamilyList}>
      {fontFamilies.map(({ key, value, cssVariable, jsPath, jsFlat }) => {
        const fontValue = formatFontFamilyValue(value);

        return (
          <li key={key} className={styles.example}>
            <div className={styles.preview} style={{ fontFamily: `var(${cssVariable})` }}>
              {key === 'mono'
                ? 'function example() { return "Hello, World!"; }'
                : 'The quick brown fox jumps over the lazy dog'}
            </div>
            <TokenDisplay cssVariable={cssVariable} jsPath={jsPath} jsFlat={jsFlat} />
            <div className={styles.fontStack}>{fontValue}</div>
          </li>
        );
      })}
    </ul>
  );
};
