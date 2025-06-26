import React from 'react';
import { useSelectableContent } from '../hooks/useSelectableContent';
import sharedStyles from '../styles/shared.module.css';

interface SelectableCodeProps {
  children: React.ReactNode;
  className?: string;
}

export const SelectableCode: React.FC<SelectableCodeProps> = ({ children, className }) => {
  const { handleSelectContent } = useSelectableContent();

  return (
    <code
      className={`${sharedStyles.selectableValue} ${className || ''}`}
      onClick={handleSelectContent}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelectContent(e.currentTarget);
        }
      }}
      tabIndex={0}
      aria-label={`Click to copy: ${children}`}
    >
      {children}
    </code>
  );
};
