import { withBackgrounds } from '@storybook/addon-ondevice-backgrounds';
import type { Preview } from '@storybook/react-native-web-vite';
import React from 'react';
import { ThemeProvider } from '../src/ThemeProvider';

const preview: Preview = {
  decorators: [
    withBackgrounds,
    (Story, context) => {
      // Check darkMode boolean from args, or theme from parameters
      const darkMode = context.args?.darkMode ?? false;
      const theme = darkMode ? 'dark' : (context.parameters.theme || 'light');
      return React.createElement(
        ThemeProvider,
        { key: theme, defaultPreference: theme, persist: false },
        React.createElement(Story)
      );
    },
  ],

  parameters: {
    theme: 'light', // default theme
    backgrounds: {
      default: 'plain',
      values: [
        { name: 'light', value: 'white' },
        { name: 'dark', value: 'black' },
      ],
    },
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  
  argTypes: {
    darkMode: {
      name: 'Dark Mode',
      control: { type: 'boolean' },
      defaultValue: false,
      description: 'Toggle between light and dark theme',
      table: {
        category: 'Theme',
        type: { summary: 'boolean' },
      },
    },
  },
};

export default preview;
