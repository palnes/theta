import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react-vite';
import '@fontsource/manrope/400.css';
import '../dist/css/base.css';
import '../dist/css/themes/light.css';
import '../dist/css/themes/dark.css';
import './docs.css';

const preview: Preview = {
  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          'Getting Started',
          ['Overview', 'Token Guide'],
          'Token Reference',
          [
            'Reference',
            'Semantic',
            [
              'Overview',
              'Colors',
              ['Overview', 'Action', 'Surface', 'Text', 'Border', 'Status'],
              'Spacing',
              'Borders',
              'Radius',
              'Shadows',
              'ZIndex',
            ],
            'Component',
          ],
        ],
      },
    },
  },
};

export default preview;
