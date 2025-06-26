/**
 * Calculate min and max values from dimension tokens
 */
export function calculateDimensionRange(tokens: Array<{ value: number }>) {
  if (tokens.length === 0) return { min: 0, max: 0 };

  const values = tokens.map((t) => t.value);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

/**
 * Calculate width percentage for dimension visualization
 */
export function calculateDimensionWidth(value: number, max: number, min: number): string {
  const range = max - min;
  if (range === 0) return '100%';

  const percentage = ((value - min) / range) * 100;
  return `${Math.max(2, percentage)}%`; // Minimum 2% for visibility
}

/**
 * Determine if a dimension is negative
 */
export function isNegativeDimension(value: number): boolean {
  return value < 0;
}
