import React from 'react';
import styles from '../styles/TokenReferenceTable.module.css';
import { TokenInfo } from '../types';

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
  return (
    <tr className={styles.expandedRow}>
      <td colSpan={3} className={styles.expandedCell}>
        <div
          className={styles.expandedContent}
          style={{
            gridTemplateColumns: token.hasReferences ? '1fr 1fr' : '1fr',
          }}
        >
          <div className={styles.detailsSection}>
            <div className={styles.typeSection}>
              <div className={styles.detailRow}>
                <span className={styles.typeLabel}>Type:</span>
                <code className={styles.detailValue}>{token.type}</code>
              </div>
            </div>
            {token.description && <div className={styles.description}>{token.description}</div>}
            <div className={styles.usageFormats}>
              <div className={styles.detailLabel}>Usage Formats:</div>
              <div className={styles.usageList}>
                <div className={styles.detailRow}>
                  <span className={styles.formatLabel}>CSS:</span>
                  <code
                    className={`${styles.detailValue} ${styles.selectableValue}`}
                    onClick={handleSelectContent}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    aria-label="Click to copy"
                  >
                    {token.cssVariable}
                  </code>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.formatLabel}>JSON:</span>
                  <code
                    className={`${styles.detailValue} ${styles.selectableValue}`}
                    onClick={handleSelectContent}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    aria-label="Click to copy"
                  >
                    {token.path}
                  </code>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.formatLabel}>JS:</span>
                  <code
                    className={`${styles.detailValue} ${styles.selectableValue}`}
                    onClick={handleSelectContent}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    aria-label="Click to copy"
                  >
                    {token.jsFlat}
                  </code>
                </div>
              </div>
            </div>
          </div>
          {token.hasReferences && (
            <div>
              <div className={styles.referencesTitle}>References:</div>
              <div className={styles.referencesList}>
                {token.references.map((ref, idx) => (
                  <div key={`${ref.path}-${idx}`} className={styles.referenceItem}>
                    {ref.property ? (
                      <>
                        <span className={styles.referenceProperty}>{ref.property}:</span>
                        <code
                          className={`${styles.referencePath} ${styles.selectableValue}`}
                          onClick={handleSelectContent}
                          onKeyDown={handleKeyDown}
                          tabIndex={0}
                          aria-label="Click to copy"
                        >
                          {ref.path}
                        </code>
                      </>
                    ) : (
                      <>
                        <span className={styles.referenceArrow}>→</span>
                        <code
                          className={`${styles.referencePath} ${styles.selectableValue}`}
                          onClick={handleSelectContent}
                          onKeyDown={handleKeyDown}
                          tabIndex={0}
                          aria-label="Click to copy"
                        >
                          {ref.path}
                        </code>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};
