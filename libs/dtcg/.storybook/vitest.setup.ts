import { setProjectAnnotations } from '@storybook/react';
import { beforeAll } from 'vitest';
import * as globalStorybookConfig from './preview';

const annotations = setProjectAnnotations([globalStorybookConfig]);

// Run before all tests
beforeAll(annotations.beforeAll);
