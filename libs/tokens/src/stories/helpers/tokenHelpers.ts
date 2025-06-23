import { TokenInfo } from './TokenReferenceTable/types';
import type {
  BaseToken,
  BorderTokenGroup,
  ColorScale,
  FontFamilyToken,
  FontSizeToken,
  FontWeightToken,
  LineHeightToken,
  NumericToken,
  SemanticColorCategory,
  ShadowToken,
  SpecialColorToken,
  StringToken,
  TypographyCategory,
} from './types/tokens';

// ===== PRIMITIVE TOKEN HELPERS =====

/**
 * Extract dimension tokens and convert to numeric values
 */
export const extractDimensions = (tokens: TokenInfo[]): NumericToken[] => {
  return tokens
    .filter((token) => {
      const isMax = token.name.toLowerCase().includes('max');
      const hasNumber = /\d+$/.test(token.name);
      return hasNumber && !isMax;
    })
    .map((token) => {
      const isNegative = token.name.toLowerCase().includes('neg');
      const match = token.name.match(/(\d+)$/);
      const numericKey = match ? match[1] : token.name;
      const absoluteValue = Number.parseInt(numericKey || '0');

      return {
        value: isNegative ? -absoluteValue : absoluteValue,
        tokenValue: token.value !== null && token.value !== undefined ? String(token.value) : '0',
        key: isNegative ? `neg${numericKey}` : numericKey || '',
        cssVariable: token.cssVariable,
        jsPath: token.jsPath,
        jsFlat: token.jsFlat,
      };
    })
    .sort((a, b) => a.value - b.value);
};

/**
 * Extract special dimension tokens (e.g., max values)
 */
export const extractSpecialDimensions = (tokens: TokenInfo[]): StringToken[] => {
  return tokens
    .filter((token) => token.name.toLowerCase() === 'refdimensionmax')
    .map((token) => ({
      key: token.path.split('.').pop() || token.name,
      value: String(token.value),
      tokenValue: token.value !== null && token.value !== undefined ? `${token.value}px` : '0px',
      cssVariable: token.cssVariable,
      jsPath: token.jsPath,
      jsFlat: token.jsFlat,
    }));
};

/**
 * Extract font size tokens sorted by size
 */
export const extractFontSizes = (tokens: TokenInfo[]): FontSizeToken[] => {
  return tokens
    .filter((token) => /^\d+$/.test(token.name))
    .map((token) => {
      const size = Number.parseInt(token.name);
      return {
        size,
        value: token.value,
        key: size.toString(),
        cssVariable: token.cssVariable,
        jsPath: token.jsPath,
        jsFlat: token.jsFlat,
      };
    })
    .sort((a, b) => b.size - a.size);
};

/**
 * Extract font weight tokens with display names
 */
export const extractFontWeights = (tokens: TokenInfo[]): FontWeightToken[] => {
  const weightMap: Record<string, { displayName: string; numericValue: number }> = {
    regular: { displayName: 'Regular', numericValue: 400 },
    medium: { displayName: 'Medium', numericValue: 500 },
    'semi-bold': { displayName: 'Semibold', numericValue: 600 },
    semibold: { displayName: 'Semibold', numericValue: 600 },
    bold: { displayName: 'Bold', numericValue: 700 },
  };

  return tokens
    .map((token) => {
      const weightName = token.name;
      const weightInfo = weightMap[weightName.toLowerCase()];

      if (!weightInfo) {
        const numericValue = Number.parseInt(token.value);
        return {
          name: weightName,
          value: !Number.isNaN(numericValue) ? numericValue : 400,
          token: { $value: token.value },
          cssVariable: token.cssVariable,
          jsPath: token.jsPath,
          jsFlat: token.jsFlat,
        };
      }

      return {
        name: weightInfo.displayName,
        value: weightInfo.numericValue,
        token: { $value: token.value },
        cssVariable: token.cssVariable,
        jsPath: token.jsPath,
        jsFlat: token.jsFlat,
      };
    })
    .sort((a, b) => a.value - b.value);
};

/**
 * Extract line height tokens sorted numerically
 */
export const extractLineHeights = (tokens: TokenInfo[]): LineHeightToken[] => {
  return tokens
    .filter((token) => /^\d+$/.test(token.name))
    .map((token) => {
      const numericValue = token.name;
      return {
        name: `${numericValue}px`,
        key: numericValue,
        description: `Line height of ${numericValue}px`,
        token: {
          $value: token.value,
        },
        cssVariable: token.cssVariable,
        jsPath: token.jsPath,
        jsFlat: token.jsFlat,
      };
    })
    .sort((a, b) => Number.parseInt(a.key) - Number.parseInt(b.key));
};

/**
 * Extract font family tokens
 */
export const extractFontFamilies = (tokens: TokenInfo[]): FontFamilyToken[] => {
  return tokens.map((token) => ({
    key: token.name.replace('refFontFamily', '').toLowerCase(),
    value: token.value,
    cssVariable: token.cssVariable,
    jsPath: token.jsPath,
    jsFlat: token.jsFlat,
  }));
};

/**
 * Get special color tokens (white, black, transparent)
 */
export const getSpecialColors = (tokens: TokenInfo[]): SpecialColorToken[] => {
  const specials = ['white', 'black', 'transparent'];

  return tokens
    .filter((token) => {
      const colorName = token.name.replace('refColor', '').toLowerCase();
      return specials.includes(colorName);
    })
    .map((token) => {
      const name = token.name.replace('refColor', '').toLowerCase();
      return {
        name,
        token: { $value: token.value },
        cssVariable: token.cssVariable,
        jsPath: token.jsPath,
        jsFlat: token.jsFlat,
      };
    });
};

/**
 * Get color scales grouped by color name
 */
export const getColorScales = (tokens: TokenInfo[]): ColorScale[] => {
  const scales: Record<string, any[]> = {};

  tokens
    .filter((token) => {
      const colorName = token.name.replace('refColor', '').toLowerCase();
      return !['white', 'black', 'transparent'].includes(colorName);
    })
    .forEach((token) => {
      const match = token.name.match(/refColor([A-Za-z]+)(\d+)/);
      if (match) {
        const [, scaleName, shade] = match;
        const scale = scaleName?.toLowerCase() || '';

        if (!scales[scale]) {
          scales[scale] = [];
        }

        scales[scale].push({
          shade,
          value: token.value,
          cssVariable: token.cssVariable,
          jsPath: token.jsPath,
          jsFlat: token.jsFlat,
        });
      }
    });

  return Object.entries(scales).map(([name, colors]) => ({
    name,
    colors: colors.sort((a, b) => Number.parseInt(a.shade) - Number.parseInt(b.shade)),
  }));
};

// ===== SEMANTIC TOKEN HELPERS =====

/**
 * Get semantic spacing tokens in logical order
 */
export const getSemanticSpacing = (tokens: TokenInfo[]): StringToken[] => {
  const order = ['none', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

  return tokens
    .map((token) => {
      const pathParts = token.path?.split('.') || [];
      const key = pathParts[pathParts.length - 1] || '';

      return {
        key,
        tokenValue: token.value !== null && token.value !== undefined ? String(token.value) : '0',
        value: token.value,
        cssVariable: token.cssVariable,
        jsPath: token.jsPath,
        jsFlat: token.jsFlat,
      };
    })
    .sort((a, b) => {
      const aIndex = order.indexOf(a.key || '');
      const bIndex = order.indexOf(b.key || '');
      if (aIndex === -1 && bIndex === -1) {
        const aNum = Number.parseInt(a.key || '');
        const bNum = Number.parseInt(b.key || '');
        if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
        return (a.key || '').localeCompare(b.key || '');
      }
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
};

/**
 * Get semantic radius tokens in logical order
 */
export const getSemanticRadius = (tokens: TokenInfo[]): StringToken[] => {
  const order = ['none', 'sm', 'md', 'lg', 'xl', 'full'];

  return tokens
    .map((token) => {
      const pathParts = token.path?.split('.') || [];
      const key = pathParts[pathParts.length - 1] || '';

      return {
        key,
        tokenValue: token.value !== null && token.value !== undefined ? String(token.value) : '0',
        value: token.value,
        cssVariable: token.cssVariable,
        jsPath: token.jsPath,
        jsFlat: token.jsFlat,
      };
    })
    .sort((a, b) => {
      const aIndex = order.indexOf(a.key || '');
      const bIndex = order.indexOf(b.key || '');
      if (aIndex === -1 && bIndex === -1) return a.key.localeCompare(b.key);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
};

/**
 * Get semantic z-index tokens sorted by value
 */
export const getSemanticZIndex = (
  tokens: TokenInfo[]
): Array<BaseToken & { key: string; value: number }> => {
  return tokens
    .map((token) => {
      const pathParts = token.path?.split('.') || [];
      const key = pathParts[pathParts.length - 1] || '';

      return {
        key,
        value: token.value,
        cssVariable: token.cssVariable,
        jsPath: token.jsPath,
        jsFlat: token.jsFlat,
      };
    })
    .sort((a, b) => a.value - b.value);
};

/**
 * Get semantic colors organized by category
 */
export const getSemanticColors = (tokens: TokenInfo[]): SemanticColorCategory[] => {
  const categories = new Map<string, any>();

  tokens.forEach((token) => {
    const pathParts = token.path?.split('.') || [];
    if (pathParts.length < 4) return;

    const category = pathParts[2];
    if (!category) return;

    if (!categories.has(category)) {
      categories.set(category, {});
    }

    const categoryObj = categories.get(category)!;

    if (pathParts.length === 4) {
      const key = pathParts[3];
      if (key) {
        categoryObj[key] = {
          $type: 'color',
          $value: token.value,
          cssVariable: token.cssVariable,
          jsPath: token.jsPath,
          jsFlat: token.jsFlat,
        };
      }
    } else if (pathParts.length === 5) {
      const subcategory = pathParts[3];
      const state = pathParts[4];

      if (subcategory && state) {
        if (!categoryObj[subcategory]) {
          categoryObj[subcategory] = {};
        }

        categoryObj[subcategory][state] = {
          $type: 'color',
          $value: token.value,
          cssVariable: token.cssVariable,
          jsPath: token.jsPath,
          jsFlat: token.jsFlat,
        };
      }
    }
  });

  const categoryOrder = ['action', 'interaction', 'surface', 'status', 'text', 'border', 'icon'];
  const labels: Record<string, string> = {
    action: 'Action Colors',
    interaction: 'Interaction Colors',
    surface: 'Surface Colors',
    status: 'Status Colors',
    text: 'Text Colors',
    border: 'Border Colors',
    icon: 'Icon Colors',
  };

  return categoryOrder
    .filter((name) => categories.has(name))
    .map((name) => ({
      name,
      label: labels[name] || name,
      colors: categories.get(name)!,
    }));
};

/**
 * Get semantic shadow tokens
 */
export const getSemanticShadows = (tokens: TokenInfo[]): ShadowToken[] => {
  return tokens.map((token) => {
    const pathParts = token.path?.split('.') || [];
    const key = pathParts[pathParts.length - 1] || '';

    return {
      key,
      token: { $value: token.value },
      value: token.value,
      cssVariable: token.cssVariable,
      jsPath: token.jsPath,
      jsFlat: token.jsFlat,
    };
  });
};

/**
 * Get semantic borders grouped by type
 */
export const getSemanticBorders = (tokens: TokenInfo[]): BorderTokenGroup => {
  const grouped: BorderTokenGroup = {
    width: [],
    style: [],
  };

  tokens.forEach((token) => {
    const pathParts = token.path?.split('.') || [];
    if (pathParts.length >= 4) {
      const category = pathParts[2];
      const key = pathParts[3];

      if (category && key && (category === 'width' || category === 'style')) {
        grouped[category].push({
          key,
          value: token.value,
          description: token.description,
          cssVariable: token.cssVariable,
          jsPath: token.jsPath,
          jsFlat: token.jsFlat,
        });
      }
    }
  });

  return grouped;
};

/**
 * Get semantic typography organized by category
 */
export const getSemanticTypography = (tokens: TokenInfo[]): TypographyCategory[] => {
  const categories = new Map<string, any[]>();

  tokens.forEach((token) => {
    const pathParts = token.path?.split('.') || [];
    if (pathParts.length >= 4) {
      const category = pathParts[2];
      const variant = pathParts[3];

      if (!category || !variant) return;

      if (!categories.has(category)) {
        categories.set(category, []);
      }

      categories.get(category)!.push({
        variant,
        value: token.value,
        cssVariable: token.cssVariable,
        jsPath: token.jsPath,
        jsFlat: token.jsFlat,
      });
    }
  });

  const categoryOrder = ['heading', 'body', 'action', 'label', 'code'];

  // Define size order for sorting variants
  const sizeOrder = ['3xl', '2xl', 'xl', 'lg', 'md', 'sm', 'xs', '2xs'];

  return categoryOrder
    .filter((category) => categories.has(category))
    .map((category) => ({
      category,
      variants: categories.get(category)!.sort((a, b) => {
        const aIndex = sizeOrder.indexOf(a.variant);
        const bIndex = sizeOrder.indexOf(b.variant);
        // If both are in sizeOrder, sort by that order
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        // Otherwise, sort alphabetically
        return a.variant.localeCompare(b.variant);
      }),
    }));
};

/**
 * Format font family value for display
 */
export const formatFontFamilyValue = (
  value: string | string[] | Record<string, unknown>
): string => {
  return Array.isArray(value)
    ? value.join(', ')
    : typeof value === 'object'
      ? 'Custom font object'
      : value;
};

/**
 * Extract numeric color shades from color object
 */
export const extractColorShades = (colors: Record<string, unknown>): string[] => {
  return Object.keys(colors)
    .filter((key) => !Number.isNaN(Number.parseInt(key)))
    .sort((a, b) => Number.parseInt(a) - Number.parseInt(b));
};
