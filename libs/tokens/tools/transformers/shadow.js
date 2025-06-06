import StyleDictionary from 'style-dictionary';

// Register custom transform for shadow tokens - for CSS only
StyleDictionary.registerTransform({
  name: 'dtcg/shadow/css',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'shadow',
  transform: (token, config) => {
    const value = token.$value || token.value;
    if (!value) return undefined;

    const formatShadow = (shadow) => {
      if (!shadow || typeof shadow !== 'object') return '0px 0px 0px 0px rgba(0,0,0,0)';

      // Ensure all values have proper units
      const ensureUnit = (val) => {
        if (typeof val === 'string') return val;
        if (typeof val === 'number') return `${val}px`;
        return '0px';
      };

      const x = ensureUnit(shadow.offsetX || 0);
      const y = ensureUnit(shadow.offsetY || 0);
      const blur = ensureUnit(shadow.blur || 0);
      const spread = ensureUnit(shadow.spread || 0);
      const color = shadow.color || 'rgba(0,0,0,0.1)';

      return `${x} ${y} ${blur} ${spread} ${color}`;
    };

    if (Array.isArray(value)) {
      return value.map(formatShadow).join(', ');
    }

    return formatShadow(value);
  },
});

// Register custom transform for shadow tokens - for React Native
StyleDictionary.registerTransform({
  name: 'dtcg/shadow/rn',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'shadow',
  transform: (token, config) => {
    const value = token.$value || token.value;
    if (!value) return undefined;

    const formatShadow = (shadow) => {
      if (!shadow || typeof shadow !== 'object') return null;

      const offsetX = typeof shadow.offsetX === 'number' ? shadow.offsetX : 0;
      const offsetY = typeof shadow.offsetY === 'number' ? shadow.offsetY : 0;
      const blur = typeof shadow.blur === 'number' ? shadow.blur : 0;
      const spread = typeof shadow.spread === 'number' ? shadow.spread : 0;
      const color = shadow.color || '#000000';

      return {
        offsetX,
        offsetY,
        blur,
        spread,
        color,
      };
    };

    let shadows;
    if (Array.isArray(value)) {
      shadows = value.map(formatShadow).filter(Boolean);
    } else {
      const formatted = formatShadow(value);
      shadows = formatted ? [formatted] : [];
    }

    if (shadows.length === 0) return null;

    // Convert to React Native format
    const primaryShadow = shadows[0];

    // Extract opacity from color if it's rgba/hsla
    let shadowOpacity = 1;
    let shadowColor = primaryShadow.color;

    // Check for rgba
    const rgbaMatch = shadowColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (rgbaMatch) {
      shadowOpacity = Number.parseFloat(rgbaMatch[4]);
      shadowColor = `rgb(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]})`;
    }

    // Check for hex with alpha
    const hexAlphaMatch = shadowColor.match(/^#([0-9a-f]{6})([0-9a-f]{2})$/i);
    if (hexAlphaMatch) {
      shadowOpacity = Number.parseInt(hexAlphaMatch[2], 16) / 255;
      shadowColor = `#${hexAlphaMatch[1]}`;
    }

    return {
      shadowColor,
      shadowOffset: {
        width: primaryShadow.offsetX,
        height: primaryShadow.offsetY,
      },
      shadowOpacity,
      shadowRadius: primaryShadow.blur / 2, // CSS blur is roughly 2x React Native shadowRadius
      // Include the original for boxShadow support
      boxShadow: shadows
        .map((s) => `${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px ${s.color}`)
        .join(', '),
    };
  },
});
