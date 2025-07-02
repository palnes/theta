import { getTokens } from '@theta/tokens/native';
import type React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { useColorScheme } from 'react-native';

// Lazy load AsyncStorage to handle web platform
let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  // AsyncStorage not available (web, tests)
  AsyncStorage = null;
}

export type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'system';

interface ThemeState {
  preference: ThemePreference;
  isLoading: boolean;
}

interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  tokens: ReturnType<typeof getTokens>;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Cache token objects to maintain referential equality
const tokenCache = new Map<Theme, ReturnType<typeof getTokens>>();
const STORAGE_KEY = '@theta/theme-preference';

// Get cached tokens or create new ones
function getCachedTokens(theme: Theme): ReturnType<typeof getTokens> {
  const cached = tokenCache.get(theme);
  if (cached) {
    return cached;
  }
  const newTokens = getTokens(theme);
  tokenCache.set(theme, newTokens);
  return newTokens;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Enable theme persistence */
  persist?: boolean;
  /** Default theme preference if none is stored */
  defaultPreference?: ThemePreference;
}

type ThemeAction =
  | { type: 'PREFERENCE_LOADED'; preference: ThemePreference }
  | { type: 'SET_PREFERENCE'; preference: ThemePreference };

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'PREFERENCE_LOADED':
      return {
        ...state,
        preference: action.preference,
        isLoading: false,
      };
    case 'SET_PREFERENCE':
      return {
        ...state,
        preference: action.preference,
      };
    default:
      return state;
  }
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  persist = true,
  defaultPreference = 'system',
}) => {
  const systemTheme = useColorScheme();
  const hasLoadedRef = useRef(false);

  const [state, dispatch] = useReducer(themeReducer, {
    preference: defaultPreference,
    isLoading: persist,
  });

  // Resolve the actual theme based on preference
  const resolvedTheme = useMemo(() => {
    if (state.preference === 'system') {
      return systemTheme || 'light';
    }
    return state.preference;
  }, [state.preference, systemTheme]);

  // Load persisted preference on mount
  useEffect(() => {
    if (!persist || !AsyncStorage || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored: string | null) => {
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          dispatch({ type: 'PREFERENCE_LOADED', preference: stored });
        } else {
          dispatch({ type: 'PREFERENCE_LOADED', preference: defaultPreference });
        }
      })
      .catch((error: any) => {
        // AsyncStorage might not be available (web, tests)
        if (__DEV__) {
          console.warn('Failed to load theme preference:', error);
        }
        dispatch({ type: 'PREFERENCE_LOADED', preference: defaultPreference });
      });
  }, [persist, defaultPreference]);

  // Persist preference changes
  const setPreference = useCallback(
    (preference: ThemePreference) => {
      dispatch({ type: 'SET_PREFERENCE', preference });

      if (persist && AsyncStorage) {
        AsyncStorage.setItem(STORAGE_KEY, preference).catch((error: any) => {
          if (__DEV__) {
            console.warn('Failed to save theme preference:', error);
          }
        });
      }
    },
    [persist]
  );

  // Get cached tokens
  const tokens = getCachedTokens(resolvedTheme);

  const value = useMemo(
    () => ({
      theme: resolvedTheme,
      preference: state.preference,
      setPreference,
      tokens,
    }),
    [resolvedTheme, state.preference, setPreference, tokens]
  );

  // Don't render until preference is loaded (prevents flash)
  if (state.isLoading) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
