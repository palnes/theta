/**
 * Custom lint rules for Theta design tokens
 */

/**
 * Enforce that color tokens reference base tokens (not hardcoded)
 */
export const noHardcodedColors = {
  meta: {
    messages: {
      HARDCODED_COLOR:
        'Color token "{{ id }}" has hardcoded value. Should reference a base token instead.',
    },
    docs: {
      description: 'Ensures semantic and component color tokens reference base tokens',
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    Object.entries(tokens).forEach(([id, token]) => {
      if (token.$type === 'color') {
        const value = token.$value;
        const isHardcoded =
          typeof value === 'string' &&
          (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl'));

        // Allow hardcoded colors only in reference tokens
        if (isHardcoded && !id.startsWith('ref.')) {
          report({
            messageId: 'HARDCODED_COLOR',
            data: { id },
            node: token.source?.node,
          });
        }
      }
    });
  },
};

/**
 * Ensure component tokens follow naming convention
 */
export const componentNaming = {
  meta: {
    messages: {
      INVALID_COMPONENT_NAME:
        'Component token "{{ id }}" should follow pattern: cmp.<component>.<property>.<state>',
    },
    docs: {
      description: 'Enforces component token naming convention',
    },
  },
  defaultOptions: {
    pattern: /^cmp\.[a-z]+\.[a-zA-Z.]+$/,
  },
  create({ tokens, options, report }) {
    Object.entries(tokens).forEach(([id, token]) => {
      if (id.startsWith('cmp.')) {
        const parts = id.split('.');

        // Should have at least cmp.component.property
        if (parts.length < 3) {
          report({
            messageId: 'INVALID_COMPONENT_NAME',
            data: { id },
            node: token.source?.node,
          });
        }

        // Component name should be lowercase
        const componentName = parts[1];
        if (componentName && componentName !== componentName.toLowerCase()) {
          report({
            messageId: 'INVALID_COMPONENT_NAME',
            data: { id },
            node: token.source?.node,
          });
        }
      }
    });
  },
};

/**
 * Ensure all interactive components have required states
 */
export const requiredStates = {
  meta: {
    messages: {
      MISSING_STATE: 'Interactive component "{{ component }}" missing required state: {{ state }}',
    },
    docs: {
      description: 'Ensures interactive components have all required states',
    },
  },
  defaultOptions: {
    requiredStates: ['default', 'hover', 'active', 'disabled'],
    interactiveComponents: ['button', 'input', 'checkbox', 'radioButton', 'switch'],
  },
  create({ tokens, options, report }) {
    const { requiredStates, interactiveComponents } = options;

    // Group tokens by component
    const componentTokens = {};
    Object.entries(tokens).forEach(([id, token]) => {
      if (id.startsWith('cmp.')) {
        const [, component] = id.split('.');
        if (!componentTokens[component]) {
          componentTokens[component] = new Set();
        }

        // Extract state from token path (e.g., cmp.button.color.primary.background.hover -> hover)
        const parts = id.split('.');
        const lastPart = parts[parts.length - 1];
        if (requiredStates.includes(lastPart)) {
          componentTokens[component].add(lastPart);
        }
      }
    });

    // Check interactive components have all states
    interactiveComponents.forEach((component) => {
      const states = componentTokens[component] || new Set();
      requiredStates.forEach((state) => {
        if (!states.has(state)) {
          // Find a token from this component to attach the error to
          const componentToken = Object.entries(tokens).find(([id]) =>
            id.startsWith(`cmp.${component}.`)
          );

          if (componentToken) {
            report({
              messageId: 'MISSING_STATE',
              data: { component, state },
              node: componentToken[1].source?.node,
            });
          }
        }
      });
    });
  },
};

/**
 * Prevent circular references
 */
export const noCircularReferences = {
  meta: {
    messages: {
      CIRCULAR_REFERENCE: 'Circular reference detected: {{ path }}',
    },
    docs: {
      description: 'Prevents circular token references',
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    // Build reference graph
    const references = {};
    Object.entries(tokens).forEach(([id, token]) => {
      const value = token.$value;
      if (typeof value === 'string' && value.includes('{')) {
        const matches = value.match(/\{([^}]+)\}/g) || [];
        references[id] = matches.map((m) => m.slice(1, -1));
      } else {
        references[id] = [];
      }
    });

    // Check for cycles using DFS
    const checkCycle = (tokenId, visited = new Set(), path = []) => {
      if (visited.has(tokenId)) {
        const cycleStart = path.indexOf(tokenId);
        if (cycleStart !== -1) {
          const cyclePath = [...path.slice(cycleStart), tokenId].join(' -> ');
          const token = tokens[tokenId];
          if (token) {
            report({
              messageId: 'CIRCULAR_REFERENCE',
              data: { path: cyclePath },
              node: token.source?.node,
            });
          }
          return true;
        }
        return false;
      }

      visited.add(tokenId);
      path.push(tokenId);

      const refs = references[tokenId] || [];
      for (const ref of refs) {
        if (checkCycle(ref, visited, path)) {
          return true;
        }
      }

      path.pop();
      return false;
    };

    // Check each token
    Object.keys(tokens).forEach((tokenId) => {
      checkCycle(tokenId);
    });
  },
};

/**
 * Ensure tokens have proper types
 */
export const requireTokenTypes = {
  meta: {
    messages: {
      MISSING_TYPE: 'Token "{{ id }}" is missing $type property',
      INVALID_TYPE: 'Token "{{ id }}" has invalid type "{{ type }}". Valid types: {{ validTypes }}',
    },
    docs: {
      description: 'Ensures all tokens have valid $type properties',
    },
  },
  defaultOptions: {
    validTypes: [
      'color',
      'dimension',
      'fontFamily',
      'fontWeight',
      'fontSize',
      'lineHeight',
      'typography',
      'shadow',
      'border',
      'opacity',
      'spacing',
    ],
  },
  create({ tokens, options, report }) {
    const { validTypes } = options;

    Object.entries(tokens).forEach(([id, token]) => {
      if (!token.$type) {
        // Some exceptions: allow missing type for container tokens
        const isContainer = Object.keys(token).some(
          (key) => !key.startsWith('$') && typeof token[key] === 'object'
        );

        if (!isContainer) {
          report({
            messageId: 'MISSING_TYPE',
            data: { id },
            node: token.source?.node,
          });
        }
      } else if (!validTypes.includes(token.$type)) {
        report({
          messageId: 'INVALID_TYPE',
          data: { id, type: token.$type, validTypes: validTypes.join(', ') },
          node: token.source?.node,
        });
      }
    });
  },
};

/**
 * Lint plugin that provides all custom rules
 */
export default function thetaLintPlugin() {
  return {
    name: 'theta-lint',
    lint() {
      return {
        'theta/no-hardcoded-colors': noHardcodedColors,
        'theta/component-naming': componentNaming,
        'theta/required-states': requiredStates,
        'theta/no-circular-references': noCircularReferences,
        'theta/require-token-types': requireTokenTypes,
      };
    },
  };
}
