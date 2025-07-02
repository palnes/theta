export type UsageFormat = string;

export interface TokenUsage {
  label: string;
  value: string;
}

export interface TokenInfo {
  name: string;
  path: string;
  type: string;
  description: string;
  originalValue: any;
  value: any;
  usage: TokenUsage[];
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
  referencedBy?: string[];
  expandedFrom?: string;
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

/**
 * Generic token data structure that can work with any tier system
 */
export interface GenericTokenData {
  /** Token tiers mapped by tier ID */
  tiers: Record<string, Record<string, TokenInfo[]>>;
  /** Metadata about the token collection */
  metadata: {
    generatedAt: string;
    totalTokens: number;
    themes?: string[];
    themeableTokens?: number;
  };
}

/**
 * Table props that work with any tier system
 */
export interface TokenTableProps {
  tier?: string;
  category?: string;
  filter?: (token: TokenInfo) => boolean;
  /** Optional token data in TokenData format - if not provided, will use context */
  tokenData?: any;
}
