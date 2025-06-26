import React, { useState, useCallback } from 'react';
import styles from '../styles/ColorCalculator.module.css';
import { convertToDTCGColor } from '../tools/colorConversion';

/**
 * Color Calculator - now using separated business logic
 */
export const ColorCalculator: React.FC = () => {
  const [inputValue, setInputValue] = useState('#FF5733');
  const [conversionResult, setConversionResult] = useState(() => convertToDTCGColor('#FF5733'));

  const handleConvert = useCallback(() => {
    const result = convertToDTCGColor(inputValue);
    setConversionResult(result);
  }, [inputValue]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleConvert();
      }
    },
    [handleConvert]
  );

  return (
    <div className={styles.calculator}>
      <div className={styles.input}>
        <label htmlFor="color-input" className={styles.label}>
          Enter Color
        </label>
        <div className={styles.inputGroup}>
          <input
            id="color-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., #FF5733, rgb(255, 87, 51), red"
            className={styles.textInput}
          />
          <button onClick={handleConvert} className={styles.convertButton} type="button">
            Convert
          </button>
        </div>
      </div>

      {conversionResult.error && (
        <div className={styles.error} role="alert">
          {conversionResult.error}
        </div>
      )}

      {conversionResult.success && conversionResult.color && conversionResult.formats && (
        <div className={styles.results}>
          <h3 className={styles.resultTitle}>DTCG Format</h3>
          <div className={styles.preview}>
            <div
              className={styles.colorPreview}
              style={{
                backgroundColor: conversionResult.formats.rgba,
              }}
            />
            <div className={styles.formatGrid}>
              <OutputRow label="Hex" value={conversionResult.formats.hex} onCopy={handleCopy} />
              <OutputRow label="RGB" value={conversionResult.formats.rgb} onCopy={handleCopy} />
              <OutputRow label="RGBA" value={conversionResult.formats.rgba} onCopy={handleCopy} />
            </div>
          </div>
          <div className={styles.dtcgOutput}>
            <div className={styles.outputHeader}>
              <span className={styles.outputLabel}>DTCG Object</span>
              <button
                onClick={() => handleCopy(conversionResult.formats!.dtcgString)}
                className={styles.copyButton}
                type="button"
                aria-label="Copy DTCG format"
              >
                Copy
              </button>
            </div>
            <pre className={styles.codeBlock}>
              <code>{conversionResult.formats.dtcgString}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for output rows
const OutputRow: React.FC<{
  label: string;
  value: string;
  onCopy: (value: string) => void;
}> = ({ label, value, onCopy }) => (
  <div className={styles.outputRow}>
    <span className={styles.outputLabel}>{label}:</span>
    <button
      type="button"
      className={styles.outputValue}
      onClick={() => onCopy(value)}
      aria-label={`Copy ${label} value`}
    >
      {value}
    </button>
  </div>
);
