import React from 'react';
import styles from '../../styles/ColorScale.module.css';

export interface ColorPopoverProps {
  usage: Array<{ label: string; value: string }>;
  value: string;
  isThemeable?: boolean;
  themeValues?: Record<string, string>;
  onClose: () => void;
}

/**
 * Pure component for the color detail popover
 */
export const ColorPopover: React.FC<ColorPopoverProps> = ({
  usage,
  value,
  isThemeable,
  themeValues,
  onClose,
}) => {
  return (
    <aside className={styles.colorPopover}>
      <button
        type="button"
        className={styles.colorPopoverClose}
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      <dl className={styles.colorPopoverContent}>
        {usage.map((item) => (
          <div key={item.label} className={styles.colorPopoverRow}>
            <dt className={styles.colorPopoverLabel}>{item.label}:</dt>
            <dd>
              <code className={styles.colorPopoverValue}>{item.value}</code>
            </dd>
          </div>
        ))}
        <div className={styles.colorPopoverRow}>
          <dt className={styles.colorPopoverLabel}>Value:</dt>
          <dd>
            <code className={styles.colorPopoverValue}>{value}</code>
          </dd>
        </div>
        {isThemeable && themeValues && (
          <>
            <hr className={styles.colorPopoverDivider} />
            <div className={styles.colorPopoverRow}>
              <dt className={styles.colorPopoverLabel}>Themes:</dt>
            </div>
            {Object.entries(themeValues).map(([theme, themeValue]) => (
              <div key={theme} className={styles.colorPopoverRow}>
                <dt className={styles.colorPopoverLabel}>{theme}:</dt>
                <dd>
                  <code className={styles.colorPopoverValue}>{themeValue}</code>
                </dd>
              </div>
            ))}
          </>
        )}
      </dl>
    </aside>
  );
};
