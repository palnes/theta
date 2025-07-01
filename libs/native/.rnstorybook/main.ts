import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { StorybookConfig } from '@storybook/react-native';

const require = createRequire(import.meta.url);

const main: StorybookConfig = {
  stories: ['../src/components/**/*.stories.?(ts|tsx|js|jsx)'],
  addons: [
    getAbsolutePath("@storybook/addon-ondevice-controls"),
    getAbsolutePath("@storybook/addon-ondevice-backgrounds"),
    getAbsolutePath("@storybook/addon-ondevice-actions"),
  ],
};

export default main;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
