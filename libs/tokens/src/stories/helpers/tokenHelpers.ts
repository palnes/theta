import primitiveColors from '../../tokens/primitives/color.json';
import primitiveDimensions from '../../tokens/primitives/dimension.json';
import primitiveTypography from '../../tokens/primitives/typography.json';
import { TokenInfo } from './TokenReferenceTable/types';

export const extractColorShades = (colors: Record<string, any>) => {
  return Object.keys(colors)
    .filter((key) => !Number.isNaN(Number.parseInt(key)))
    .sort((a, b) => Number.parseInt(a) - Number.parseInt(b));
};

export const extractDimensions = () => {
  return Object.entries(primitiveDimensions.ref.dimension || {})
    .filter(([key]) => !key.startsWith('negative') && key !== 'max')
    .map(([key, token]: [string, any]) => {
      const tokenValue =
        typeof token.$value === 'object'
          ? `${token.$value.value}${token.$value.unit}`
          : token.$value;

      return {
        value: Number.parseInt(key),
        tokenValue,
        key,
      };
    })
    .sort((a, b) => a.value - b.value);
};

export const extractSpecialDimensions = () => {
  return Object.entries(primitiveDimensions.ref.dimension || {}).filter(
    ([key]) => key.startsWith('negative') || key === 'max'
  );
};

export const extractFontSizes = () => {
  return Object.entries(primitiveTypography.ref.fontSize || {})
    .filter(([key]) => key !== '$type' && !Number.isNaN(Number.parseInt(key)))
    .map(([key, token]: [string, any]) => {
      const value =
        typeof token.$value === 'object'
          ? `${token.$value.value}${token.$value.unit}`
          : token.$value;

      return {
        size: Number.parseInt(key),
        value,
        key,
      };
    })
    .sort((a, b) => a.size - b.size);
};

export const extractFontWeights = () => {
  const weights = [
    { name: 'Regular', value: 400 },
    { name: 'Medium', value: 500 },
    { name: 'Semibold', value: 600 },
    { name: 'Bold', value: 700 },
  ];

  return weights
    .map(({ name, value }) => {
      const token = (primitiveTypography.ref.fontWeight as any)?.[value];
      if (!token) return null;

      return {
        name,
        value,
        token,
      };
    })
    .filter(Boolean);
};

export const extractLineHeights = () => {
  // Get lineHeightPx data
  const lineHeightData = (primitiveTypography.ref as any).lineHeightPx;
  if (!lineHeightData) return [];

  // Extract numeric line heights
  return Object.entries(lineHeightData)
    .filter(([key]) => key !== '$type')
    .map(([key, token]: [string, any]) => {
      const value =
        typeof token.$value === 'object'
          ? `${token.$value.value}${token.$value.unit}`
          : token.$value;

      return {
        name: `${key}px`,
        key,
        description: `Line height of ${key}px`,
        token: { ...token, $value: value },
      };
    })
    .sort((a, b) => Number.parseInt(a.key) - Number.parseInt(b.key));
};

export const extractFontFamilies = () => {
  return Object.entries(primitiveTypography.ref.fontFamily || {});
};

export const formatFontFamilyValue = (value: any) => {
  return Array.isArray(value)
    ? value.join(', ')
    : typeof value === 'object'
      ? 'Custom font object'
      : value;
};

export const getSpecialColors = () => {
  const specials = ['white', 'black', 'transparent'];

  return specials
    .map((name) => {
      const token = (primitiveColors.ref.color as any)[name];
      if (!token) return null;

      return {
        name,
        token,
      };
    })
    .filter(Boolean);
};

export const getColorScales = () => {
  return Object.entries(primitiveColors.ref.color)
    .filter(
      ([_, colors]: [string, any]) => typeof colors === 'object' && !colors.$type && !colors.$value
    )
    .map(([name, colors]) => ({ name, colors }));
};

export const formatTokenValue = (value: any): string => {
  if (typeof value === 'object' && value !== null) {
    if ('value' in value && 'unit' in value) {
      return `${value.value}${value.unit}`;
    }
  }
  return String(value);
};

// New functions for working with documentation format
export const extractDimensionsFromDocs = (tokens: TokenInfo[]) => {
  return tokens
    .filter((token) => {
      // Include all numeric dimensions except max
      const isMax = token.name.toLowerCase().includes('max');
      const hasNumber = /\d+$/.test(token.name);

      return hasNumber && !isMax;
    })
    .map((token) => {
      // Extract the numeric value and handle negative dimensions
      const isNegative = token.name.toLowerCase().includes('neg');
      const match = token.name.match(/(\d+)$/);
      const numericKey = match ? match[1] : token.name;
      const absoluteValue = Number.parseInt(numericKey);

      return {
        value: isNegative ? -absoluteValue : absoluteValue,
        tokenValue: token.value !== null && token.value !== undefined ? `${token.value}px` : '0px',
        key: isNegative ? `neg${numericKey}` : numericKey,
        cssVariable: token.cssVariable,
        jsPath: token.jsPath,
      };
    })
    .sort((a, b) => a.value - b.value);
};

export const extractSpecialDimensionsFromDocs = (tokens: TokenInfo[]) => {
  return tokens
    .filter((token) => token.name.toLowerCase() === 'refdimensionmax')
    .map((token) => ({
      key: token.path.split('.').pop() || token.name,
      tokenValue: token.value !== null && token.value !== undefined ? `${token.value}px` : '0px',
      cssVariable: token.cssVariable,
      jsPath: token.jsPath,
    }));
};

// Typography primitive helpers for documentation format
export const extractFontSizesFromDocs = (tokens: TokenInfo[]) => {
  return tokens
    .filter((token) => /^\d+$/.test(token.name.replace('refFontSize', '')))
    .map((token) => {
      const size = Number.parseInt(token.name.replace('refFontSize', ''));
      return {
        size,
        value: token.value !== null && token.value !== undefined ? `${token.value}px` : '16px',
        key: size.toString(),
        cssVariable: token.cssVariable,
        jsPath: token.jsPath,
      };
    })
    .sort((a, b) => a.size - b.size);
};

export const extractFontWeightsFromDocs = (tokens: TokenInfo[]) => {
  const weightNames: Record<string, string> = {
    '400': 'Regular',
    '500': 'Medium',
    '600': 'Semibold',
    '700': 'Bold',
  };

  return tokens
    .map((token) => {
      const weight = token.name.replace('refFontWeight', '');
      return {
        name: weightNames[weight] || weight,
        value: Number.parseInt(weight),
        token: { $value: token.value },
        cssVariable: token.cssVariable,
        jsPath: token.jsPath,
      };
    })
    .sort((a, b) => a.value - b.value);
};

export const extractLineHeightsFromDocs = (tokens: TokenInfo[]) => {
  return tokens
    .filter((token) => /^\d+$/.test(token.name.replace('refLineHeightPx', '')))
    .map((token) => {
      const value = token.name.replace('refLineHeightPx', '');
      return {
        name: `${value}px`,
        key: value,
        description: `Line height of ${value}px`,
        token: {
          $value: token.value !== null && token.value !== undefined ? `${token.value}px` : value,
        },
        cssVariable: token.cssVariable,
        jsPath: token.jsPath,
      };
    })
    .sort((a, b) => Number.parseInt(a.key) - Number.parseInt(b.key));
};

export const extractFontFamiliesFromDocs = (tokens: TokenInfo[]) => {
  return tokens.map((token) => ({
    key: token.name.replace('refFontFamily', '').toLowerCase(),
    value: token.value,
    cssVariable: token.cssVariable,
    jsPath: token.jsPath,
  }));
};

// Color primitive helpers for documentation format
export const getSpecialColorsFromDocs = (tokens: TokenInfo[]) => {
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
      };
    });
};

export const getColorScalesFromDocs = (tokens: TokenInfo[]) => {
  // Group tokens by color scale (e.g., gray, blue, green, etc.)
  const scales: Record<string, any[]> = {};

  tokens
    .filter((token) => {
      // Exclude special colors
      const colorName = token.name.replace('refColor', '').toLowerCase();
      return !['white', 'black', 'transparent'].includes(colorName);
    })
    .forEach((token) => {
      // Extract scale name and shade from token name
      // e.g., "refColorGray100" -> scale: "gray", shade: "100"
      const match = token.name.match(/refColor([A-Za-z]+)(\d+)/);
      if (match) {
        const [, scaleName, shade] = match;
        const scale = scaleName.toLowerCase();

        if (!scales[scale]) {
          scales[scale] = [];
        }

        scales[scale].push({
          shade,
          value: token.value,
          cssVariable: token.cssVariable,
          jsPath: token.jsPath,
        });
      }
    });

  // Convert to array format and sort shades
  return Object.entries(scales).map(([name, colors]) => ({
    name,
    colors: colors.sort((a, b) => Number.parseInt(a.shade) - Number.parseInt(b.shade)),
  }));
};
