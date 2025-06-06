import { setProjectAnnotations } from '@storybook/react';
import { beforeAll } from 'vitest';
import * as previewAnnotations from './preview';

const annotations = setProjectAnnotations([previewAnnotations]);

// Apply global decorators, parameters, and loaders
beforeAll(annotations.beforeAll);
