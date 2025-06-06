import type { Preview } from '@storybook/react-vite';
import '@fontsource/manrope/400.css';
import '../dist/tokens.css';
import '../dist/css/internal-all-tokens.css';
import '../dist/css/themes.css';
import './docs.css';

const preview: Preview = {
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
          ['Primitives', 'Semantic', 'Component'],
        ],
      },
    },
  },
};

export default preview;
