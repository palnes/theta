import { TokenInfo, UsageFormat } from '../types';

export const getUsageValue = (token: TokenInfo, format: UsageFormat): string => {
  switch (format) {
    case 'css':
      return token.cssVariable;
    case 'json':
      return token.path;
    case 'js':
      return token.jsFlat;
    default:
      return token.cssVariable;
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
