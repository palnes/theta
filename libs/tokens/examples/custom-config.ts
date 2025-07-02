import type { FlexibleTokenSystemConfig } from '../src/docblocks/types/FlexibleTokenSystemConfig';

/**
 * Example: Minimal configuration with different tier names
 */
export const minimalConfig: Partial<FlexibleTokenSystemConfig> = {
  tiers: [
    { id: 'base', name: 'Base Tokens' },
    { id: 'theme', name: 'Theme Tokens' },
  ],
};

/**
 * Example: Material Design style configuration
 */
export const materialConfig: Partial<FlexibleTokenSystemConfig> = {
  tiers: [
    { id: 'md', name: 'Material Design' },
    { id: 'product', name: 'Product Specific' },
  ],
  categories: [
    { id: 'elevation', name: 'Elevation', icon: '📐' },
    { id: 'motion', name: 'Motion', icon: '🎬' },
    { id: 'shape', name: 'Shape', icon: '⬛' },
  ],
  sortOrders: {
    elevation: ['0', '1', '2', '4', '6', '8', '12', '16', '24'],
    motion: ['instant', 'fast', 'normal', 'slow', 'slower'],
  },
};

/**
 * Example: Tailwind-style configuration
 */
export const tailwindConfig: Partial<FlexibleTokenSystemConfig> = {
  tiers: [{ id: 'tw', name: 'Tailwind' }],
  sortOrders: {
    spacing: [
      '0',
      '0.5',
      '1',
      '1.5',
      '2',
      '2.5',
      '3',
      '3.5',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '14',
      '16',
      '20',
      '24',
      '28',
      '32',
      '36',
      '40',
      '44',
      '48',
      '52',
      '56',
      '60',
      '64',
      '72',
      '80',
      '96',
    ],
    fontSize: [
      'xs',
      'sm',
      'base',
      'lg',
      'xl',
      '2xl',
      '3xl',
      '4xl',
      '5xl',
      '6xl',
      '7xl',
      '8xl',
      '9xl',
    ],
  },
  paths: {
    getTier: () => 'tw', // Everything is in one tier
    getCategory: (path) => path.split('-')[0], // text-sm -> text
    isComponent: () => false, // No component tokens
  },
};

/**
 * Example: Custom enterprise configuration
 */
export const enterpriseConfig: Partial<FlexibleTokenSystemConfig> = {
  tiers: [
    { id: 'foundation', name: 'Foundation', description: 'Core brand values' },
    { id: 'semantic', name: 'Semantic', description: 'Meaningful design decisions' },
    { id: 'component', name: 'Component', description: 'Component overrides' },
    { id: 'pattern', name: 'Pattern', description: 'Composed patterns' },
  ],
  categories: [
    { id: 'brand', name: 'Brand Colors' },
    { id: 'interaction', name: 'Interaction States' },
    { id: 'feedback', name: 'User Feedback' },
    { id: 'data-viz', name: 'Data Visualization' },
  ],
  themes: ['light', 'dark', 'high-contrast', 'print'],
  paths: {
    getTier: (path) => path.split('.')[0],
    getCategory: (path) => path.split('.')[1],
    isComponent: (path) => path.startsWith('component.') || path.startsWith('pattern.'),
    getComponent: (path) => {
      const parts = path.split('.');
      if (parts[0] === 'component' || parts[0] === 'pattern') {
        return parts[1];
      }
      return null;
    },
  },
  validation: {
    naming: {
      pattern: /^[a-z0-9-]+$/, // kebab-case only
      componentPattern: /^[a-z0-9-]+$/, // components also kebab-case
    },
  },
};

/**
 * Example: How to use with TokenSystemProvider
 *
 * import { TokenSystemProvider } from '@theta/tokens';
 * import { enterpriseConfig } from './custom-config';
 *
 * function App() {
 *   return (
 *     <TokenSystemProvider config={enterpriseConfig} data={registryData}>
 *       <YourApp />
 *     </TokenSystemProvider>
 *   );
 * }
 */
