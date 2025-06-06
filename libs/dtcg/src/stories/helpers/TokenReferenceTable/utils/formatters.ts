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

export const formatValue = (value: any, type?: string, format?: string): string => {
  if (value === null || value === undefined) return '-';

  if (type === 'color') {
    return formatColorValue(value);
  }

  if (typeof value === 'object') {
    if (type === 'typography') {
      // Show individual properties for JS/JSON format (React Native compatible)
      if (format === 'js' || format === 'json') {
        return JSON.stringify(
          {
            fontSize: value.fontSize,
            fontWeight: value.fontWeight,
            lineHeight: value.lineHeight,
            fontFamily: value.fontFamily,
            ...(value.letterSpacing && { letterSpacing: value.letterSpacing }),
          },
          null,
          2
        );
      }
      // CSS shorthand for CSS format
      return `${value.fontWeight || '400'} ${value.fontSize || '16px'}/${value.lineHeight || '1.5'} ${value.fontFamily || 'sans-serif'}`;
    }
    if (type === 'shadow') {
      // Show individual properties for JS/JSON format (React Native compatible)
      if (format === 'js' || format === 'json') {
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
      }
      // CSS format
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
    }
    return JSON.stringify(value, null, 2);
  }

  return String(value);
};
