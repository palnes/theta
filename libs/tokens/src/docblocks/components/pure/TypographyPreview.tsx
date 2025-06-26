import React from 'react';
import styles from '../../styles/Typography.module.css';
import { TokenDisplay } from './TokenDisplay';

export interface TypographyPreviewProps {
  preview: React.ReactNode;
  style?: React.CSSProperties;
  cssVariable: string;
  jsPath: string;
  jsFlat?: string;
  additionalInfo?: React.ReactNode;
}

/**
 * Pure component for typography preview with token info
 */
export const TypographyPreview: React.FC<TypographyPreviewProps> = ({
  preview,
  style,
  cssVariable,
  jsPath,
  jsFlat,
  additionalInfo,
}) => {
  return (
    <div className={styles.example}>
      <div className={styles.preview} style={style}>
        {preview}
      </div>
      <TokenDisplay
        formats={[
          { label: 'CSS', value: cssVariable },
          { label: 'JSON', value: jsPath },
          { label: 'JS', value: jsFlat || jsPath },
        ]}
      />
      {additionalInfo}
    </div>
  );
};
