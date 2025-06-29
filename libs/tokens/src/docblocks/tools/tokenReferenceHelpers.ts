import { TokenInfo, UsageFormat } from '../types/tokenReferenceTable';

export const getUsageValue = (token: TokenInfo, format: UsageFormat): string => {
  switch (format) {
    case 'css':
      return token.usage.find((u) => u.label === 'CSS')?.value || '';
    case 'json':
      return token.usage.find((u) => u.label === 'JSON')?.value || token.path;
    case 'js':
      return token.usage.find((u) => u.label === 'JS')?.value || '';
    default:
      return token.usage.find((u) => u.label === 'CSS')?.value || '';
  }
};

export const getUsageLabel = (format: UsageFormat): string => {
  switch (format) {
    case 'css':
      return 'CSS Variable';
    case 'json':
      return 'JSON Path';
    case 'js':
      return 'JS Variable';
    default:
      return 'CSS Variable';
  }
};
