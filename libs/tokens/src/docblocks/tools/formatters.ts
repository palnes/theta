// Convert Terrazzo color format to CSS
export const formatColorValue = (color: any): string => {
  if (typeof color === 'string') return color;

  if (color && typeof color === 'object' && 'colorSpace' in color && 'components' in color) {
    const [r, g, b] = color.components;
    const alpha = color.alpha || 1;
    if (alpha === 1) {
      return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
    }
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
  }

  return String(color);
};

// Format font family value
const formatFontFamily = (value: any, format?: string): string => {
  if (Array.isArray(value)) {
    // For CSS format, wrap font names with spaces in quotes
    if (format === 'css' || !format) {
      return value.map((font) => (font.includes(' ') ? `"${font}"` : font)).join(', ');
    }
    // For JS/JSON format, return the array
    return JSON.stringify(value);
  }
  return String(value);
};

// Format dimension value
const formatDimension = (value: any, format?: string): string => {
  if (format === 'js' || format === 'json') {
    // For JS/JSON, show just the numeric value
    if (typeof value === 'string' && value.match(/^-?\d+(\.\d+)?(px|rem|em|%)$/)) {
      // Extract numeric value from string like "4px"
      return value.replace(/(px|rem|em|%)$/, '');
    }
    // If it's already a number, just return it
    return String(value);
  }
  // For CSS (or no format specified), show the full value with unit
  // If it's just a number, add 'px' unit
  if (typeof value === 'number' || (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value))) {
    return `${value}px`;
  }
  return String(value);
};

// Format React Native shadow
const formatReactNativeShadow = (value: any): string => {
  // Check if it's the resolved format with React Native properties
  if (value.shadowColor) {
    return JSON.stringify(
      {
        shadowColor: value.shadowColor,
        shadowOffset: value.shadowOffset,
        shadowOpacity: value.shadowOpacity,
        shadowRadius: value.shadowRadius,
      },
      null,
      2
    );
  }
  // Handle original format
  if (Array.isArray(value)) {
    const shadow = value[0]; // React Native only supports single shadows
    return JSON.stringify(
      {
        shadowColor: shadow.color || 'rgba(0,0,0,0.1)',
        shadowOffset: {
          width: Number.parseFloat(shadow.offsetX) || 0,
          height: Number.parseFloat(shadow.offsetY) || 0,
        },
        shadowOpacity: 1,
        shadowRadius: Number.parseFloat(shadow.blur) / 2 || 0,
      },
      null,
      2
    );
  }
  return JSON.stringify(value, null, 2);
};

// Format CSS shadow
const formatCSSShadow = (value: any): string => {
  if (value.boxShadow) {
    return value.boxShadow;
  }
  // Handle array of shadows
  if (Array.isArray(value)) {
    return value
      .map(
        (shadow) =>
          `${shadow.offsetX || '0'} ${shadow.offsetY || '0'} ${shadow.blur || '0'} ${shadow.spread || '0'} ${shadow.color || 'rgba(0,0,0,0.1)'}`
      )
      .join(', ');
  }
  return `${value.offsetX || '0'} ${value.offsetY || '0'} ${value.blur || '0'} ${value.spread || '0'} ${value.color || 'rgba(0,0,0,0.1)'}`;
};

// Format shadow value
const formatShadow = (value: any, format?: string): string => {
  // Show individual properties for JS/JSON format (React Native compatible)
  if (format === 'js' || format === 'json') {
    return formatReactNativeShadow(value);
  }
  // CSS format
  return formatCSSShadow(value);
};

// Format object value
const formatObject = (value: any, type?: string, format?: string): string => {
  if (type === 'typography') {
    // Typography tokens are composite - don't try to display them inline
    // The individual properties will be shown when the token is expanded
    return '(Composite)';
  }
  if (type === 'shadow') {
    return formatShadow(value, format);
  }
  return JSON.stringify(value, null, 2);
};

export const formatValue = (value: any, type?: string, format?: string): string => {
  if (value === null || value === undefined) return '-';

  if (type === 'color') {
    return formatColorValue(value);
  }

  if (type === 'fontFamily') {
    return formatFontFamily(value, format);
  }

  if (type === 'dimension') {
    return formatDimension(value, format);
  }

  if (typeof value === 'object') {
    return formatObject(value, type, format);
  }

  return String(value);
};
