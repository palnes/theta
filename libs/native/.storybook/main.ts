import { StorybookConfig } from '@storybook/react-native-web-vite';

const main: StorybookConfig = {
  stories: [
    '../src/components/**/*.stories.mdx',
    '../src/components/**/*.stories.@(js|jsx|ts|tsx)',
  ],

  addons: ['@storybook/addon-docs'],

  framework: {
    name: '@storybook/react-native-web-vite',
    options: {},
  },

  docs: {},

  typescript: {
    reactDocgen: 'react-docgen',
  },
};

export default main;
