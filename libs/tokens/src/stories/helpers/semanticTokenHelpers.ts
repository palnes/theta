import semanticColors from '../../tokens/semantic/color.json';
import semanticRadius from '../../tokens/semantic/radius.json';
import semanticShadows from '../../tokens/semantic/shadow.json';
import semanticSpacing from '../../tokens/semantic/spacing.json';
import semanticTypography from '../../tokens/semantic/typography.json';
import semanticZIndex from '../../tokens/semantic/zIndex.json';
import { TokenInfo } from './TokenReferenceTable/types';

export const getSemanticColors = () => {
  const categories = [
    { name: 'action', label: 'Action Colors' },
    { name: 'interaction', label: 'Interaction Colors' },
    { name: 'surface', label: 'Surface Colors' },
    { name: 'status', label: 'Status Colors' },
    { name: 'text', label: 'Text Colors' },
    { name: 'border', label: 'Border Colors' },
    { name: 'icon', label: 'Icon Colors' },
  ];

  return categories.map(({ name, label }) => ({
    name,
    label,
    colors: (semanticColors.sys.color as any)[name] || {},
  }));
};

export const getSemanticSpacing = () => {
  return Object.entries(semanticSpacing.sys.spacing || {}).map(([key, token]: [string, any]) => ({
    key,
    token,
    tokenValue:
      typeof token.$value === 'object' ? `${token.$value.value}${token.$value.unit}` : token.$value,
  }));
};

export const getSemanticTypography = () => {
  const categories = Object.entries(semanticTypography.sys.typography || {});

  return categories.map(([category, variants]) => ({
    category,
    variants: Object.entries(variants || {}).map(([variant, token]) => ({
      variant,
      token,
    })),
  }));
};

export const getSemanticRadius = () => {
  return Object.entries((semanticRadius.sys as any).borderRadius || {}).map(
    ([key, token]: [string, any]) => ({
      key,
      token,
    })
  );
};

export const getSemanticShadows = () => {
  return Object.entries((semanticShadows.sys as any).boxShadow || {}).map(
    ([key, token]: [string, any]) => ({
      key,
      token,
    })
  );
};

export const getSemanticZIndex = () => {
  // Define the z-index values directly based on the semantic tokens
  const zIndexMap: Record<string, number> = {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
  };

  return Object.entries(semanticZIndex.sys.zIndex || {})
    .map(([key, token]: [string, any]) => ({
      key,
      token,
      value: zIndexMap[key] || 0,
    }))
    .sort((a, b) => a.value - b.value);
};

// New functions for working with documentation format
export const getSemanticSpacingFromDocs = (tokens: TokenInfo[]) => {
  const order = ['none', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

  return tokens
    .map((token) => {
      // Extract the key from the path (e.g., "sys.spacing.lg" -> "lg")
      const pathParts = token.path.split('.');
      const key = pathParts[pathParts.length - 1];

      return {
        key,
        tokenValue: token.value !== null && token.value !== undefined ? `${token.value}px` : '0px',
        value: token.value,
        cssVariable: token.cssVariable,
        jsPath: token.jsPath,
      };
    })
    .sort((a, b) => {
      const aIndex = order.indexOf(a.key);
      const bIndex = order.indexOf(b.key);
      if (aIndex === -1 && bIndex === -1) {
        // If not in order array, sort numerically if numbers, otherwise alphabetically
        const aNum = Number.parseInt(a.key);
        const bNum = Number.parseInt(b.key);
        if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
        return a.key.localeCompare(b.key);
      }
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
};

export const getSemanticRadiusFromDocs = (tokens: TokenInfo[]) => {
  const order = ['none', 'sm', 'md', 'lg', 'xl', 'full'];

  return tokens
    .map((token) => {
      // Extract the key from the path (e.g., "sys.radius.sm" -> "sm")
      const pathParts = token.path.split('.');
      const key = pathParts[pathParts.length - 1];

      return {
        key,
        tokenValue: token.value !== null && token.value !== undefined ? `${token.value}px` : '0px',
        value: token.value,
        cssVariable: token.cssVariable,
        jsPath: token.jsPath,
      };
    })
    .sort((a, b) => {
      const aIndex = order.indexOf(a.key);
      const bIndex = order.indexOf(b.key);
      if (aIndex === -1 && bIndex === -1) return a.key.localeCompare(b.key);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
};

export const getSemanticZIndexFromDocs = (tokens: TokenInfo[]) => {
  return tokens
    .map((token) => {
      // Extract the key from the path (e.g., "sys.zIndex.modal" -> "modal")
      const pathParts = token.path.split('.');
      const key = pathParts[pathParts.length - 1];

      return {
        key,
        value: token.value,
        cssVariable: token.cssVariable,
        jsPath: token.jsPath,
      };
    })
    .sort((a, b) => a.value - b.value);
};

export const getSemanticColorsFromDocs = (tokens: TokenInfo[]) => {
  // Group tokens by category and build nested structure
  const categories = new Map<string, any>();

  tokens.forEach((token) => {
    const pathParts = token.path.split('.');
    if (pathParts.length < 4) return;

    const category = pathParts[2]; // action, interaction, surface, etc.

    if (!categories.has(category)) {
      categories.set(category, {});
    }

    const categoryObj = categories.get(category)!;

    // Build nested structure based on path
    if (pathParts.length === 4) {
      // Simple token like sys.color.text.primary
      const key = pathParts[3];
      categoryObj[key] = {
        $type: 'color',
        $value: token.value,
        cssVariable: token.cssVariable,
        jsPath: token.jsPath,
      };
    } else if (pathParts.length === 5) {
      // State token like sys.color.action.primary.default
      const subcategory = pathParts[3];
      const state = pathParts[4];

      if (!categoryObj[subcategory]) {
        categoryObj[subcategory] = {};
      }

      categoryObj[subcategory][state] = {
        $type: 'color',
        $value: token.value,
        cssVariable: token.cssVariable,
        jsPath: token.jsPath,
      };
    }
  });

  // Convert to the expected format
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

export const getSemanticShadowsFromDocs = (tokens: TokenInfo[]) => {
  return tokens.map((token) => {
    // Extract the key from the path (e.g., "sys.boxShadow.base" -> "base")
    const pathParts = token.path.split('.');
    const key = pathParts[pathParts.length - 1];

    return {
      key,
      token: { $value: token.value },
      value: token.value,
      cssVariable: token.cssVariable,
      jsPath: token.jsPath,
    };
  });
};

export const getSemanticBordersFromDocs = (tokens: TokenInfo[]) => {
  // Group tokens by category (width or style)
  const grouped: Record<string, any[]> = {
    width: [],
    style: [],
  };

  tokens.forEach((token) => {
    const pathParts = token.path.split('.');
    if (pathParts.length >= 4) {
      const category = pathParts[2]; // width or style
      const key = pathParts[3];

      if (grouped[category]) {
        grouped[category].push({
          key,
          value: token.value,
          description: token.description,
          cssVariable: token.cssVariable,
          jsPath: token.jsPath,
        });
      }
    }
  });

  return grouped;
};

export const getSemanticTypographyFromDocs = (tokens: TokenInfo[]) => {
  // Group tokens by category (heading, body, action, label, code)
  const categories = new Map<string, any[]>();

  tokens.forEach((token) => {
    const pathParts = token.path.split('.');
    if (pathParts.length >= 4) {
      const category = pathParts[2]; // heading, body, action, etc.
      const variant = pathParts[3]; // sm, md, lg, etc.

      if (!categories.has(category)) {
        categories.set(category, []);
      }

      categories.get(category)!.push({
        variant,
        value: token.value,
        cssVariable: token.cssVariable,
        jsPath: token.jsPath,
      });
    }
  });

  // Convert to array format expected by the component
  return Array.from(categories.entries()).map(([category, variants]) => ({
    category,
    variants,
  }));
};
