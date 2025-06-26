import { useEffect, useState } from 'react';

export interface RegistryToken {
  id: string;
  value: any;
  type: string;
  outputs?: {
    css?: {
      name: string;
      value: string;
      usage: string;
    };
    js?: {
      name: string;
      value: string;
      usage: string;
    };
    [format: string]: any;
  };
  references?: string[];
  referencedBy?: string[];
  themes?: Record<string, { value: any; outputs: any }>;
  originalValue?: any;
  source?: any;
  metadata?: any;
}

export interface RegistryData {
  tokens: {
    ref?: Record<string, any>;
    sys?: Record<string, any>;
    cmp?: Record<string, any>;
  };
  formats?: string[];
  metadata?: {
    timestamp: string;
    stats?: {
      total: number;
      byType?: Record<string, number>;
      byFormat?: Record<string, number>;
      byComponent?: Record<string, number>;
      coverage?: {
        total: number;
        withOutputs: number;
        percentage: number;
      };
    };
  };
}

export const useRegistryData = () => {
  const [data, setData] = useState<RegistryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/generated/tokens-generic.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};
