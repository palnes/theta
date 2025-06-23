import React from 'react';

// Warning callout for critical issues only
export const Warning = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      borderLeft: '3px solid var(--sys-color-status-warning-text)',
      paddingLeft: '1rem',
      margin: '1.5rem 0',
    }}
  >
    <strong>⚠️ Warning:</strong> {children}
  </div>
);

// Section wrapper
export const Section = ({
  children,
}: {
  children: React.ReactNode;
}) => <div style={{ marginBottom: 'var(--sys-spacing-xl)' }}>{children}</div>;
