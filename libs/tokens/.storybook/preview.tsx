import type { Preview } from '@storybook/react-vite';
import { TokenSystemProvider } from '../src/docblocks/contexts/TokenSystemContext';
import tokenDataJson from './generated/tokens-generic.json';

const tokenData = tokenDataJson as any;
import '@fontsource/manrope/400.css';
import '../dist/css/base.css';
import '../dist/css/themes/light.css';
import '../dist/css/themes/dark.css';
import './docs.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <TokenSystemProvider data={tokenData}>
        <Story />
      </TokenSystemProvider>
    ),
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
              'Typography',
              ['Overview', 'Headings', 'Body', 'Action', 'Label'],
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
