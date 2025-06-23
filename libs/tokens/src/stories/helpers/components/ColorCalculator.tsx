import parse from 'color-parse';
import React, { useState, useCallback } from 'react';
import styles from '../styles/ColorCalculator.module.css';

interface DTCGColor {
  colorSpace: string;
  components: [number, number, number];
  alpha: number;
}

export const ColorCalculator: React.FC = () => {
  const [inputValue, setInputValue] = useState('#FF5733');
  const [dtcgColor, setDtcgColor] = useState<DTCGColor | null>({
    colorSpace: 'srgb',
    components: [1, 0.341, 0.2],
    alpha: 1,
  });
  const [error, setError] = useState('');

  const convertToColor = useCallback(() => {
    setError('');
    setDtcgColor(null);

    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError('Please enter a color value');
      return;
    }

    try {
      const parsed = parse(trimmed);

      if (parsed?.values && parsed.values.length >= 3) {
        let r: number;
        let g: number;
        let b: number;
        const alpha = parsed.alpha;

        // If it's already RGB, use the values directly
        if (parsed.space === 'rgb' || !parsed.space) {
          [r, g, b] = parsed.values as [number, number, number];
        } else {
          // For non-RGB spaces, we'd need to convert - for now, just handle RGB
          setError(
            'Currently only RGB-based colors are supported. Please use hex, rgb, or rgba formats.'
          );
          return;
        }

        // Convert to DTCG format
        const dtcg: DTCGColor = {
          colorSpace: 'srgb',
          components: [
            Math.round((r / 255) * 1000) / 1000,
            Math.round((g / 255) * 1000) / 1000,
            Math.round((b / 255) * 1000) / 1000,
          ],
          alpha: alpha !== undefined ? Math.round(alpha * 1000) / 1000 : 1,
        };

        setDtcgColor(dtcg);
      } else {
        setError(
          'Invalid color format. Try hex (#FF0000), rgb(255, 0, 0), or rgba(255, 0, 0, 0.5)'
        );
      }
    } catch (e) {
      setError('Invalid color format. Try hex (#FF0000), rgb(255, 0, 0), or rgba(255, 0, 0, 0.5)');
    }
  }, [inputValue]);

  const getCssColor = (color: DTCGColor): string => {
    const [r, g, b] = color.components;
    const rgb = {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };

    if (color.alpha !== 1) {
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${color.alpha})`;
    }
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  };

  const handleSelectContent = (e: React.MouseEvent<HTMLElement>) => {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(e.currentTarget);
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  return (
    <div className={styles.calculator}>
      <div className={styles.inputSection}>
        <label htmlFor="color-input" className={styles.label}>
          Enter a color (hex, rgb, rgba):
        </label>
        <div className={styles.inputGroup}>
          <input
            id="color-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                convertToColor();
              }
            }}
            className={styles.input}
            placeholder="#FF5733 or rgb(255, 87, 51)"
          />
          <button type="button" onClick={convertToColor} className={styles.button}>
            Convert
          </button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
      </div>

      {dtcgColor && (
        <section className={styles.results}>
          <article>
            <h3 className={styles.resultTitle}>Preview</h3>
            <div className={styles.resultCard}>
              <div className={styles.preview}>
                <div
                  className={styles.colorSwatch}
                  style={{ backgroundColor: getCssColor(dtcgColor) }}
                />
                <dl className={styles.colorInfo}>
                  <dt className="sr-only">CSS Color</dt>
                  <dd>{getCssColor(dtcgColor)}</dd>
                  <dt className="sr-only">Components</dt>
                  <dd className={styles.components}>
                    R: {Math.round(dtcgColor.components[0] * 255)}, G:{' '}
                    {Math.round(dtcgColor.components[1] * 255)}, B:{' '}
                    {Math.round(dtcgColor.components[2] * 255)}
                    {dtcgColor.alpha !== 1 && `, A: ${dtcgColor.alpha}`}
                  </dd>
                </dl>
              </div>
            </div>
          </article>

          <article>
            <h3 className={styles.resultTitle}>DTCG Token</h3>
            <div className={styles.resultCard}>
              <button
                type="button"
                onClick={handleSelectContent}
                aria-label="DTCG token, click to select"
                className={styles.codeWrapper}
              >
                <output className={styles.code}>
                  <pre>
                    {JSON.stringify(
                      {
                        $type: 'color',
                        $value: dtcgColor,
                      },
                      null,
                      2
                    )}
                  </pre>
                </output>
              </button>
            </div>
          </article>
        </section>
      )}
    </div>
  );
};
