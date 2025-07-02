import type React from 'react';
import styles from '../../styles/TokenTable.module.css';
import type { TokenInfo } from '../../types/tokenReferenceTable';

interface ExpandedDetailsProps {
  token: TokenInfo;
}

const handleSelectContent = (
  e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
) => {
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(e.currentTarget);
  selection?.removeAllRanges();
  selection?.addRange(range);
};

const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleSelectContent(e);
  }
};

export const ExpandedDetails: React.FC<ExpandedDetailsProps> = ({ token }) => {
  // Use the referencedBy property from the token data
  const referencedByPaths = token.referencedBy || [];

  // Helper to format a single property value
  const formatPropertyValue = (val: any): string => {
    if (typeof val !== 'object' || val === null) {
      return String(val);
    }

    if ('value' in val && 'unit' in val) {
      return `${val.value}${val.unit}`;
    }

    if (Array.isArray(val)) {
      return val.join(', ');
    }

    return JSON.stringify(val);
  };

  // Render a single property row
  const PropertyRow: React.FC<{ propKey: string; propValue: any }> = ({ propKey, propValue }) => (
    <div className={styles.detailRow}>
      <span className={styles.formatLabel}>{propKey}:</span>{' '}
      <code className={styles.detailValue}>{formatPropertyValue(propValue)}</code>
    </div>
  );

  // Format composite token properties for display
  const renderCompositeValue = () => {
    if (token.type !== 'typography' || typeof token.value !== 'object') {
      return null;
    }

    return (
      <>
        <div className={styles.detailLabel}>Typography Properties</div>
        {Object.entries(token.value).map(([key, val]) => (
          <PropertyRow key={key} propKey={key} propValue={val} />
        ))}
      </>
    );
  };

  return (
    <tr className={styles.expandedRow}>
      <td colSpan={3} className={styles.expandedCell}>
        <div className={styles.expandedContent}>
          <div className={styles.expandedContentGrid}>
            <div className={styles.detailsSection}>
              <div className={styles.detailLabel}>Details</div>
              <div className={styles.detailRow}>
                <span className={styles.formatLabel}>Type:</span>{' '}
                <code className={styles.detailValue}>{token.type}</code>
              </div>
              {token.description && (
                <div className={styles.detailRow}>
                  <span className={styles.formatLabel}>Description:</span> {token.description}
                </div>
              )}

              {renderCompositeValue()}

              <div className={styles.detailLabel}>Usage</div>
              {token.usage.map((usage) => (
                <div key={usage.label} className={styles.detailRow}>
                  <span className={styles.formatLabel}>{usage.label}:</span>{' '}
                  <code
                    className={styles.selectableValue}
                    onClick={handleSelectContent}
                    onKeyDown={handleKeyDown}
                    title={`Click to select ${usage.label} format`}
                  >
                    {usage.value}
                  </code>
                </div>
              ))}

              {token.isThemeable && token.themeValues && (
                <>
                  <div className={styles.detailLabel}>Theme Values</div>
                  {Object.entries(token.themeValues).map(([theme, value]) => (
                    <div key={theme} className={styles.detailRow}>
                      <span className={styles.formatLabel}>{theme}:</span>{' '}
                      <code className={styles.detailValue}>
                        {typeof value === 'object' ? JSON.stringify(value) : value}
                      </code>
                    </div>
                  ))}
                </>
              )}
            </div>

            {(token.hasReferences || referencedByPaths.length > 0) && (
              <div className={styles.referencesColumn}>
                {token.hasReferences && (
                  <>
                    <div className={styles.detailLabel}>References</div>
                    {token.references.map((ref, idx) => (
                      <div key={`${ref.path}-${idx}`} className={styles.detailRow}>
                        {ref.property && (
                          <span className={styles.formatLabel}>{ref.property}:</span>
                        )}{' '}
                        <code
                          className={styles.selectableValue}
                          onClick={handleSelectContent}
                          onKeyDown={handleKeyDown}
                          title="Click to select reference"
                        >
                          {ref.path}
                        </code>
                      </div>
                    ))}
                  </>
                )}

                {token.hasReferences && referencedByPaths.length > 0 && (
                  <div style={{ marginTop: '16px' }} />
                )}

                {referencedByPaths.length > 0 && (
                  <>
                    <div className={styles.detailLabel}>Referenced By</div>
                    {referencedByPaths.map((path) => (
                      <div key={path} className={styles.detailRow}>
                        <code
                          className={styles.selectableValue}
                          onClick={handleSelectContent}
                          onKeyDown={handleKeyDown}
                          title="Click to select token that references this"
                        >
                          {path}
                        </code>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};
