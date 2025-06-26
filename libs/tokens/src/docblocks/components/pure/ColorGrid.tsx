import React, { useState, useEffect } from 'react';
import styles from '../../styles/ColorScale.module.css';
import type { ColorToken } from '../../tools/colorUtils';
import { ColorPopover } from './ColorPopover';
import { ColorSwatch } from './ColorSwatch';

export interface ColorGridProps {
  tokens: ColorToken[];
  gridColumns?: 'small' | 'large';
  getBackgroundStyle?: (token: ColorToken) => string;
  getDisplayName?: (token: ColorToken) => { main: string; sub: string | null };
}

/**
 * Pure component for rendering a grid of color tokens
 */
export const ColorGrid: React.FC<ColorGridProps> = ({
  tokens,
  gridColumns = 'small',
  getBackgroundStyle,
  getDisplayName,
}) => {
  const [expandedTokens, setExpandedTokens] = useState<Set<string>>(new Set());
  const gridClass = gridColumns === 'large' ? styles.colorGridLarge : styles.colorGrid;

  const toggleExpanded = (tokenKey: string) => {
    setExpandedTokens((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tokenKey)) {
        newSet.delete(tokenKey);
      } else {
        // Close all others and open this one
        newSet.clear();
        newSet.add(tokenKey);
      }
      return newSet;
    });
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`.${styles.colorItem}`)) {
        setExpandedTokens(new Set());
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <ul className={gridClass}>
      {tokens.map((token) => {
        const { main } = getDisplayName ? getDisplayName(token) : { main: token.name };
        const isExpanded = expandedTokens.has(token.cssVariable);
        const background = getBackgroundStyle ? getBackgroundStyle(token) : token.value;

        return (
          <li key={token.cssVariable} className={styles.colorItem}>
            {token.isThemeable && token.themeValues ? (
              <div className={styles.themeSwatches}>
                <ColorSwatch
                  value={token.themeValues.light || token.value}
                  background={token.themeValues.light || token.value}
                  onClick={() => toggleExpanded(token.cssVariable)}
                  isClickable={true}
                />
                <ColorSwatch
                  value={token.themeValues.dark || token.value}
                  background={token.themeValues.dark || token.value}
                  onClick={() => toggleExpanded(token.cssVariable)}
                  isClickable={true}
                />
              </div>
            ) : (
              <ColorSwatch
                value={token.value}
                background={background}
                onClick={() => toggleExpanded(token.cssVariable)}
                isClickable={true}
              />
            )}
            <div className={styles.colorInfo}>
              <div className={styles.colorName}>
                {main || 'Unnamed'}
                {token.isThemeable && (
                  <span
                    className={styles.themeIndicator}
                    title={`Overridden in: ${token.overriddenIn?.join(', ')}`}
                  >
                    🎨
                  </span>
                )}
              </div>
            </div>
            {isExpanded && (
              <ColorPopover
                cssVariable={token.cssVariable}
                jsPath={token.jsPath}
                jsFlat={token.jsFlat}
                value={token.value}
                isThemeable={token.isThemeable}
                themeValues={token.themeValues}
                onClose={() => toggleExpanded(token.cssVariable)}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};
