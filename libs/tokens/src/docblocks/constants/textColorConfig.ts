export interface TextColorConfig {
  title: string;
  description?: string;
  tokens: {
    tokenPath: string;
    label: string;
    background: string;
    backgroundLabel?: string;
  }[];
}

export const TEXT_COLOR_CONFIGS: TextColorConfig[] = [
  {
    title: 'Content Text',
    description: 'Primary text colors for content',
    tokens: [
      {
        tokenPath: 'sys.color.text.primary',
        label: 'Primary',
        background: 'var(--sys-color-surface-primary-default)',
        backgroundLabel: 'Primary Surface',
      },
      {
        tokenPath: 'sys.color.text.secondary',
        label: 'Secondary',
        background: 'var(--sys-color-surface-primary-default)',
        backgroundLabel: 'Primary Surface',
      },
      {
        tokenPath: 'sys.color.text.tertiary',
        label: 'Tertiary',
        background: 'var(--sys-color-surface-primary-default)',
        backgroundLabel: 'Primary Surface',
      },
      {
        tokenPath: 'sys.color.text.muted',
        label: 'Muted',
        background: 'var(--sys-color-surface-primary-default)',
        backgroundLabel: 'Primary Surface',
      },
      {
        tokenPath: 'sys.color.text.disabled',
        label: 'Disabled',
        background: 'var(--sys-color-surface-primary-default)',
        backgroundLabel: 'Primary Surface',
      },
    ],
  },
  {
    title: 'Special Purpose Text',
    description: 'Text colors for specific contexts',
    tokens: [
      {
        tokenPath: 'sys.color.text.inverse',
        label: 'Inverse',
        background: 'var(--sys-color-surface-tertiary-default)',
        backgroundLabel: 'Tertiary Surface',
      },
      {
        tokenPath: 'sys.color.text.onAction',
        label: 'On Action',
        background: 'var(--sys-color-action-primary-default)',
        backgroundLabel: 'Primary Action',
      },
      {
        tokenPath: 'sys.color.text.onSurface',
        label: 'On Surface',
        background: 'var(--sys-color-surface-secondary-default)',
        backgroundLabel: 'Secondary Surface',
      },
      {
        tokenPath: 'sys.color.text.brand',
        label: 'Brand',
        background: 'var(--sys-color-surface-primary-default)',
        backgroundLabel: 'Primary Surface',
      },
    ],
  },
  {
    title: 'Status Text',
    description: 'Text colors for status messages',
    tokens: [
      {
        tokenPath: 'sys.color.text.success',
        label: 'Success',
        background: 'var(--sys-color-surface-primary-default)',
        backgroundLabel: 'Primary Surface',
      },
      {
        tokenPath: 'sys.color.text.error',
        label: 'Error',
        background: 'var(--sys-color-surface-primary-default)',
        backgroundLabel: 'Primary Surface',
      },
      {
        tokenPath: 'sys.color.text.warning',
        label: 'Warning',
        background: 'var(--sys-color-surface-primary-default)',
        backgroundLabel: 'Primary Surface',
      },
    ],
  },
  {
    title: 'Status Text on Colored Backgrounds',
    description: 'Text colors for status surfaces',
    tokens: [
      {
        tokenPath: 'sys.color.status.info.text',
        label: 'Info Text',
        background: 'var(--sys-color-status-info-surface)',
        backgroundLabel: 'Info Surface',
      },
      {
        tokenPath: 'sys.color.status.success.text',
        label: 'Success Text',
        background: 'var(--sys-color-status-success-surface)',
        backgroundLabel: 'Success Surface',
      },
      {
        tokenPath: 'sys.color.status.warning.text',
        label: 'Warning Text',
        background: 'var(--sys-color-status-warning-surface)',
        backgroundLabel: 'Warning Surface',
      },
      {
        tokenPath: 'sys.color.status.error.text',
        label: 'Error Text',
        background: 'var(--sys-color-status-error-surface)',
        backgroundLabel: 'Error Surface',
      },
    ],
  },
];
