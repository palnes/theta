import React, { useState, useEffect } from 'react';
import { COLOR_DISPLAY } from '../constants/displayConstants';
import styles from '../styles/ColorScale.module.css';

interface ColorToken {
  name: string;
  value: string;
  cssVariable: string;
  jsPath: string;
  jsFlat?: string;
  path?: string;
  type?: string;
}

interface ColorDisplayProps {
  title: string;
  tokens: ColorToken[];
  isTextPreview?: boolean;
  gridColumns?: 'small' | 'large';
  groupBy?: 'category' | 'none'; // Group tokens by subcategory
}

export const ColorDisplay: React.FC<ColorDisplayProps> = ({
  title,
  tokens,
  isTextPreview = false,
  gridColumns = 'small',
  groupBy = 'none',
}) => {
  // Helper to get background style for color swatches
  const getBackgroundStyle = (token: ColorToken) => {
    // Check if this is transparent (by name or value)
    if (
      token.name.toLowerCase().includes('transparent') ||
      token.value === 'transparent' ||
      token.value === 'rgba(0, 0, 0, 0)'
    ) {
      return `repeating-linear-gradient(${COLOR_DISPLAY.transparentGradient.angle}, var(--sys-color-surface-secondary-default), var(--sys-color-surface-secondary-default) ${COLOR_DISPLAY.transparentGradient.size1}, var(--sys-color-surface-primary-default) ${COLOR_DISPLAY.transparentGradient.size1}, var(--sys-color-surface-primary-default) ${COLOR_DISPLAY.transparentGradient.size2})`;
    }
    return token.value;
  };

  // Extract display name from token
  const getDisplayName = (token: ColorToken) => {
    // Use the name property if it's already formatted (like "primary default")
    if (token.name && !token.path) {
      return { main: token.name, sub: null };
    }

    // For semantic tokens with path, extract category
    if (token.path) {
      const parts = token.path.split('.');
      // For paths like "sys.color.action.primary.default"
      if (parts.length >= 4 && parts[0] === 'sys' && parts[1] === 'color') {
        const category = parts[2];
        // Use the pre-formatted name if available
        return { main: token.name || parts.slice(3).join(' '), sub: category };
      }
    }

    // For primitive tokens, parse the name
    const nameMatch = token.name.match(/([a-zA-Z]+)(\d+)?$/);
    if (nameMatch) {
      const [, colorName, shade] = nameMatch;
      return { main: shade ? `${colorName} ${shade}` : colorName, sub: null };
    }

    return { main: token.name, sub: null };
  };

  const gridClass = gridColumns === 'large' ? styles.colorGridLarge : styles.colorGrid;

  // Group tokens by category if requested
  const groupedTokens = React.useMemo(() => {
    if (groupBy === 'none') {
      return { ungrouped: tokens };
    }

    const groups: Record<string, ColorToken[]> = {};

    tokens.forEach((token) => {
      // Extract group from path (e.g., "sys.color.status.error.default" -> "error")
      let groupKey = 'other';

      if (token.path) {
        const parts = token.path.split('.');
        // For status colors: sys.color.status.error.default -> group by "error"
        if (parts.length >= 4 && parts[2] === 'status') {
          groupKey = parts[3] || 'default';
        }
        // For state colors: sys.color.state.info.default -> group by "info"
        else if (parts.length >= 4 && parts[2] === 'state') {
          groupKey = parts[3] || 'default';
        }
        // For other semantic colors, check if they have a subcategory
        else if (parts.length >= 5) {
          groupKey = parts[3] || 'default';
        }
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey]?.push(token);
    });

    return groups;
  }, [tokens, groupBy]);

  const [expandedTokens, setExpandedTokens] = useState<Set<string>>(new Set());

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

  const renderTokenGrid = (tokensToRender: ColorToken[], currentGroup?: string) => (
    <ul className={gridClass}>
      {tokensToRender.map((token) => {
        let { main } = getDisplayName(token);

        // If we're in a group and the token name starts with the group name, remove it
        if (currentGroup && currentGroup !== 'ungrouped' && currentGroup !== 'other' && main) {
          const groupPrefix = currentGroup.toLowerCase();
          if (main.toLowerCase().startsWith(groupPrefix)) {
            // Remove the group prefix and clean up
            main = main.substring(groupPrefix.length).trim();
          }
        }

        const isExpanded = expandedTokens.has(token.cssVariable);

        return (
          <li key={token.cssVariable} className={styles.colorItem}>
            <button
              type="button"
              className={`${isTextPreview ? styles.colorSwatchText : styles.colorSwatch} ${styles.colorSwatchClickable}`}
              style={{
                background: isTextPreview ? undefined : getBackgroundStyle(token),
                color: isTextPreview ? token.value : undefined,
              }}
              onClick={() => toggleExpanded(token.cssVariable)}
            >
              {isTextPreview && (main || 'Unnamed')}
            </button>
            <div className={styles.colorInfo}>
              <div className={styles.colorName}>{main || 'Unnamed'}</div>
            </div>
            {isExpanded && (
              <aside className={styles.colorPopover}>
                <button
                  type="button"
                  className={styles.colorPopoverClose}
                  onClick={() => toggleExpanded(token.cssVariable)}
                  aria-label="Close"
                >
                  ×
                </button>
                <dl className={styles.colorPopoverContent}>
                  <div className={styles.colorPopoverRow}>
                    <dt className={styles.colorPopoverLabel}>CSS:</dt>
                    <dd>
                      <code className={styles.colorPopoverValue}>{token.cssVariable}</code>
                    </dd>
                  </div>
                  <div className={styles.colorPopoverRow}>
                    <dt className={styles.colorPopoverLabel}>JSON:</dt>
                    <dd>
                      <code className={styles.colorPopoverValue}>{token.jsPath}</code>
                    </dd>
                  </div>
                  <div className={styles.colorPopoverRow}>
                    <dt className={styles.colorPopoverLabel}>JS:</dt>
                    <dd>
                      <code className={styles.colorPopoverValue}>
                        {token.jsFlat || token.jsPath}
                      </code>
                    </dd>
                  </div>
                  <div className={styles.colorPopoverRow}>
                    <dt className={styles.colorPopoverLabel}>Value:</dt>
                    <dd>
                      <code className={styles.colorPopoverValue}>{token.value}</code>
                    </dd>
                  </div>
                </dl>
              </aside>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={styles.colorScale}>
      <h2 className={styles.colorScaleTitle}>{title}</h2>
      {groupBy === 'none'
        ? renderTokenGrid(tokens)
        : Object.entries(groupedTokens).map(([group, groupTokens]) => (
            <div key={group} style={{ marginBottom: 'var(--sys-spacing-2xl)' }}>
              {group !== 'ungrouped' && (
                <h3 className={styles.colorGroupTitle}>
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </h3>
              )}
              {renderTokenGrid(groupTokens, group)}
            </div>
          ))}
    </div>
  );
};
