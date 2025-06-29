import React from 'react';
import styles from '../../styles/ColorScale.module.css';

export interface ColorSwatchProps {
  value: string;
  background?: string;
  onClick?: () => void;
  isClickable?: boolean;
  className?: string;
}

/**
 * Pure component for rendering a color swatch
 */
export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  value,
  background,
  onClick,
  isClickable = false,
  className = '',
}) => {
  const swatchClass = `${styles.colorSwatch} ${isClickable ? styles.colorSwatchClickable : ''} ${className}`;

  return (
    <button
      type="button"
      className={swatchClass}
      style={{
        background: background || value,
      }}
      onClick={onClick}
    />
  );
};
