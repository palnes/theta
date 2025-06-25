import type { Preview } from '@storybook/react-native-web-vite';
import React from 'react';
import { ThemeProvider } from '../src/ThemeProvider';

const preview: Preview = {
  parameters: {
    // actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    theme: 'light', // default theme
  },

  decorators: [
    (Story, context) => {
      const theme = context.parameters.theme || 'light';
      console.log('Storybook decorator theme:', theme);
      return React.createElement(
        ThemeProvider,
        { defaultPreference: theme, persist: false },
        React.createElement(Story)
      );
    },
  ],

  tags: ['autodocs'],
};

export default preview;
