export interface TokenInfo {
  name: string;
  path: string;
  type: string;
  description: string;
  originalValue: any;
  value: any;
  cssVariable: string;
  jsPath: string;
  jsFlat: string;
  hasReferences: boolean;
  references: Array<{
    path: string;
    value: any;
    type: string;
    property?: string;
  }>;
  expandedValue?: any;
  themeValues?: Record<string, any>;
  isThemeable?: boolean;
  overriddenIn?: string[];
}

export interface TokenData {
  ref: Record<string, TokenInfo[]>;
  sys: Record<string, TokenInfo[]>;
  cmp: Record<string, TokenInfo[]>;
  metadata: {
    generatedAt: string;
    totalTokens: number;
    themes?: string[];
    themeableTokens?: number;
  };
}

export interface TokenReferenceTableProps {
  tier?: 'ref' | 'sys' | 'cmp';
  category?: string;
  filter?: (token: TokenInfo) => boolean;
}

export type UsageFormat = 'css' | 'json' | 'js';
