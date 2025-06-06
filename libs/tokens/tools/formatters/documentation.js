import StyleDictionary from 'style-dictionary';
import {
  getReferences,
  resolveReferences,
  sortByReference,
  usesReferences,
} from 'style-dictionary/utils';

// Helper to trace full reference chain
function getFullReferenceChain(token, tokens) {
  const chain = [];
  let currentToken = token;

  while (
    currentToken &&
    usesReferences(currentToken.original.$value || currentToken.original.value || '')
  ) {
    const refs = getReferences(
      currentToken.original.$value || currentToken.original.value,
      tokens,
      { unfilteredTokens: tokens, warnImmediately: false }
    );

    if (refs.length > 0) {
      chain.push({
        from: currentToken.path.join('.'),
        to: refs[0].path.join('.'),
        value: refs[0].$value || refs[0].value,
      });
      currentToken = refs[0];
    } else {
      break;
    }
  }

  return chain;
}

// Register custom format for documentation
StyleDictionary.registerFormat({
  name: 'documentation/json',
  format: ({ dictionary, options = {} }) => {
    const { unfilteredTokens } = dictionary;

    // Sort tokens by reference to ensure referenced tokens come first
    const sortedDict = sortByReference(dictionary);
    const sortedTokens = sortedDict.allTokens || dictionary.allTokens;

    const documentation = {
      ref: {},
      sys: {},
      cmp: {},
      metadata: {
        generatedAt: new Date().toISOString(),
        totalTokens: sortedTokens.length,
      },
    };

    sortedTokens.forEach((token) => {
      const tier = token.path[0];
      const category = token.path[1];

      // Skip if not in our expected tiers
      if (!['ref', 'sys', 'cmp'].includes(tier)) return;

      // Determine token type, inheriting from referenced token if not specified
      let tokenType = token.$type || token.type;

      // If no type is specified and token has references, inherit from the first reference
      if (!tokenType && usesReferences(token.original.$value || token.original.value || '')) {
        try {
          const refs = getReferences(
            token.original.$value || token.original.value,
            unfilteredTokens,
            { unfilteredTokens, warnImmediately: false }
          );
          if (refs.length > 0) {
            tokenType = refs[0].$type || refs[0].type;
          }
        } catch (e) {
          // Ignore errors, we'll fall back to undefined
        }
      }

      const tokenInfo = {
        name: token.name,
        path: token.path.join('.'),
        type: tokenType,
        description: token.$description || token.comment || '',

        // Original value (with references)
        originalValue:
          token.original.$value !== undefined ? token.original.$value : token.original.value,

        // Resolved value
        value: token.$value !== undefined ? token.$value : token.value,

        // Platform-specific names
        cssVariable: `--${token.path.join('-').toLowerCase()}`,
        jsPath: `tokens.${token.path.join('.')}`,
        jsFlat: token.name,

        // Reference information
        hasReferences: usesReferences(token.original.$value || token.original.value || ''),
        references: [],
      };

      // Get detailed reference information
      if (tokenInfo.hasReferences) {
        try {
          const originalValue = token.original.$value || token.original.value;

          // Handle composite tokens (shadow, typography, etc.)
          if (Array.isArray(originalValue)) {
            // Shadow tokens with array values
            tokenInfo.references = [];
            originalValue.forEach((shadowLayer) => {
              Object.entries(shadowLayer).forEach(([key, value]) => {
                if (typeof value === 'string' && value.startsWith('{')) {
                  const refs = getReferences(value, unfilteredTokens, {
                    unfilteredTokens,
                    warnImmediately: false,
                  });
                  if (refs.length > 0) {
                    tokenInfo.references.push({
                      path: refs[0].path.join('.'),
                      value: refs[0].$value || refs[0].value,
                      type: refs[0].$type || refs[0].type,
                      property: key,
                    });
                  }
                }
              });
            });
          } else if (typeof originalValue === 'object' && !Array.isArray(originalValue)) {
            // Typography and other composite tokens
            tokenInfo.references = [];
            Object.entries(originalValue).forEach(([key, value]) => {
              if (typeof value === 'string' && value.startsWith('{')) {
                const refs = getReferences(value, unfilteredTokens, {
                  unfilteredTokens,
                  warnImmediately: false,
                });
                if (refs.length > 0) {
                  tokenInfo.references.push({
                    path: refs[0].path.join('.'),
                    value: refs[0].$value || refs[0].value,
                    type: refs[0].$type || refs[0].type,
                    property: key,
                  });
                }
              }
            });
          } else {
            // Simple tokens
            const refs = getReferences(originalValue, unfilteredTokens, {
              unfilteredTokens,
              warnImmediately: false,
            });

            tokenInfo.references = refs.map((ref) => ({
              path: ref.path.join('.'),
              value: ref.$value || ref.value,
              type: ref.$type || ref.type,
            }));
          }

          // Show the reference chain
          tokenInfo.referenceChain = getFullReferenceChain(token, unfilteredTokens);
        } catch (e) {
          console.warn(`Could not resolve references for ${token.path.join('.')}: ${e.message}`);
        }
      }

      // Special handling for composite types
      if (token.$type === 'typography' && typeof tokenInfo.value === 'object') {
        tokenInfo.expandedValue = {
          fontFamily: tokenInfo.value.fontFamily,
          fontSize: tokenInfo.value.fontSize,
          fontWeight: tokenInfo.value.fontWeight,
          lineHeight: tokenInfo.value.lineHeight,
          letterSpacing: tokenInfo.value.letterSpacing,
        };
      }

      if (token.$type === 'shadow' && typeof tokenInfo.value === 'object') {
        tokenInfo.expandedValue = {
          offsetX: tokenInfo.value.offsetX,
          offsetY: tokenInfo.value.offsetY,
          blur: tokenInfo.value.blur,
          spread: tokenInfo.value.spread,
          color: tokenInfo.value.color,
        };
      }

      // Categorize
      if (!documentation[tier]) documentation[tier] = {};
      if (!documentation[tier][category]) documentation[tier][category] = [];

      documentation[tier][category].push(tokenInfo);
    });

    return JSON.stringify(documentation, null, 2);
  },
});
