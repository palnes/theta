/**
 * Token Registry - A centralized system for tracking design tokens across formats
 *
 * This registry provides a scalable solution for:
 * - Tracking token transformations across multiple output formats
 * - Managing relationships between tokens (references, aliases)
 * - Source mapping back to original token files
 * - Querying tokens by various criteria
 */

export class TokenRegistry {
  constructor() {
    // Core token data indexed by ID
    this.tokens = new Map();

    // Indexes for efficient querying
    this.indexes = {
      byType: new Map(), // type -> Set<tokenId>
      byFormat: new Map(), // format -> Set<tokenId>
      byFile: new Map(), // sourceFile -> Set<tokenId>
      byComponent: new Map(), // component -> Set<tokenId>
      references: new Map(), // tokenId -> Set<referencedTokenIds>
      referencedBy: new Map(), // tokenId -> Set<referencingTokenIds>
    };

    // Theme variants
    this.themes = new Map();

    // Transformation history
    this.transformations = new Map();
  }

  /**
   * Register a token with its source information
   */
  registerToken(id, tokenData) {
    const token = {
      id,
      value: tokenData.$value,
      type: tokenData.$type,
      description: tokenData.$description,
      deprecated: tokenData.$deprecated,
      source: tokenData.source || null,
      originalValue: tokenData.originalValue,
      metadata: {},
      outputs: new Map(),
      references: new Set(),
      referencedBy: new Set(),
      themes: new Map(),
    };

    this.tokens.set(id, token);

    // Update indexes
    if (token.type) {
      if (!this.indexes.byType.has(token.type)) {
        this.indexes.byType.set(token.type, new Set());
      }
      this.indexes.byType.get(token.type).add(id);
    }

    // Extract component from ID (e.g., cmp.button.* -> button)
    if (id.startsWith('cmp.')) {
      const component = id.split('.')[1];
      if (component) {
        if (!this.indexes.byComponent.has(component)) {
          this.indexes.byComponent.set(component, new Set());
        }
        this.indexes.byComponent.get(component).add(id);
      }
    }

    // Extract references from value
    const references = this.extractReferences(token.originalValue || token.value);
    references.forEach((ref) => {
      token.references.add(ref);

      // Update reference index
      if (!this.indexes.references.has(id)) {
        this.indexes.references.set(id, new Set());
      }
      this.indexes.references.get(id).add(ref);

      // Update reverse reference index
      if (!this.indexes.referencedBy.has(ref)) {
        this.indexes.referencedBy.set(ref, new Set());
      }
      this.indexes.referencedBy.get(ref).add(id);
    });

    return token;
  }

  /**
   * Register an output format for a token
   */
  registerOutput(tokenId, format, outputData) {
    const token = this.tokens.get(tokenId);
    if (!token) {
      throw new Error(`Token ${tokenId} not found`);
    }

    // Store output data
    token.outputs.set(format, {
      format,
      name: outputData.name,
      value: outputData.value,
      usage: outputData.usage,
      metadata: outputData.metadata || {},
    });

    // Update format index
    if (!this.indexes.byFormat.has(format)) {
      this.indexes.byFormat.set(format, new Set());
    }
    this.indexes.byFormat.get(format).add(tokenId);

    // Track transformation
    this.recordTransformation(tokenId, format, outputData);
  }

  /**
   * Register a theme variant for a token
   */
  registerThemeVariant(tokenId, theme, value, outputs = {}) {
    const token = this.tokens.get(tokenId);
    if (!token) {
      throw new Error(`Token ${tokenId} not found`);
    }

    token.themes.set(theme, {
      value,
      outputs: new Map(Object.entries(outputs)),
    });
  }

  /**
   * Record a transformation for audit trail
   */
  recordTransformation(tokenId, format, data) {
    if (!this.transformations.has(tokenId)) {
      this.transformations.set(tokenId, []);
    }

    this.transformations.get(tokenId).push({
      format,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  /**
   * Extract token references from a value
   */
  extractReferences(value) {
    const references = new Set();

    if (typeof value === 'string') {
      const matches = value.match(/\{([^}]+)\}/g);
      if (matches) {
        matches.forEach((match) => references.add(match.slice(1, -1)));
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.values(value).forEach((val) => {
        if (typeof val === 'string') {
          const matches = val.match(/\{([^}]+)\}/g);
          if (matches) {
            matches.forEach((match) => references.add(match.slice(1, -1)));
          }
        }
      });
    }

    return references;
  }

  // Query APIs

  /**
   * Get a token by ID
   */
  getToken(id) {
    const token = this.tokens.get(id);
    if (!token) return null;

    return {
      ...token,
      references: Array.from(token.references),
      referencedBy: Array.from(this.indexes.referencedBy.get(id) || []),
      outputs: Object.fromEntries(token.outputs),
      themes: Object.fromEntries(token.themes),
    };
  }

  /**
   * Get all tokens
   */
  getAllTokens() {
    return Array.from(this.tokens.keys());
  }

  /**
   * Get tokens by type
   */
  getTokensByType(type) {
    return Array.from(this.indexes.byType.get(type) || []);
  }

  /**
   * Get tokens by format
   */
  getTokensByFormat(format) {
    return Array.from(this.indexes.byFormat.get(format) || []);
  }

  /**
   * Get tokens by component
   */
  getTokensByComponent(component) {
    return Array.from(this.indexes.byComponent.get(component) || []);
  }

  /**
   * Get tokens that reference a given token
   */
  getReferencingTokens(tokenId) {
    return Array.from(this.indexes.referencedBy.get(tokenId) || []);
  }

  /**
   * Get tokens referenced by a given token
   */
  getReferencedTokens(tokenId) {
    return Array.from(this.indexes.references.get(tokenId) || []);
  }

  /**
   * Get impact analysis - what would be affected if a token changes
   */
  getImpactAnalysis(tokenId, visited = new Set()) {
    if (visited.has(tokenId)) return [];
    visited.add(tokenId);

    const directReferences = this.getReferencingTokens(tokenId);
    const impact = [...directReferences];

    // Recursively find all dependent tokens
    directReferences.forEach((ref) => {
      impact.push(...this.getImpactAnalysis(ref, visited));
    });

    return [...new Set(impact)];
  }

  /**
   * Export registry data for documentation
   */
  exportForDocumentation(options = {}) {
    const {
      includeTransformations = false,
      includeStats = true,
      format = 'nested', // 'nested' or 'flat'
    } = options;

    const data = {
      tokens: {},
      formats: Array.from(this.indexes.byFormat.keys()),
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    // Build token data
    if (format === 'nested') {
      // Build nested structure (ref.color.blue.500 -> ref: { color: { blue: { 500: {...} } } })
      this.tokens.forEach((token, id) => {
        const parts = id.split('.');
        let current = data.tokens;

        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }

        current[parts[parts.length - 1]] = this.getToken(id);
      });
    } else {
      // Flat structure
      this.tokens.forEach((token, id) => {
        data.tokens[id] = this.getToken(id);
      });
    }

    // Add stats if requested
    if (includeStats) {
      data.metadata.stats = {
        total: this.tokens.size,
        byType: Object.fromEntries(
          Array.from(this.indexes.byType.entries()).map(([type, set]) => [type, set.size])
        ),
        byFormat: Object.fromEntries(
          Array.from(this.indexes.byFormat.entries()).map(([format, set]) => [format, set.size])
        ),
        byComponent: Object.fromEntries(
          Array.from(this.indexes.byComponent.entries()).map(([comp, set]) => [comp, set.size])
        ),
        withReferences: this.indexes.references.size,
        themes: Array.from(this.themes.keys()),
      };
    }

    // Add transformations if requested
    if (includeTransformations) {
      data.transformations = Object.fromEntries(this.transformations);
    }

    return data;
  }
}

/**
 * Plugin interface for token registry
 */
export class TokenRegistryPlugin {
  constructor(registry) {
    this.registry = registry;
  }

  /**
   * Helper method for plugins to register outputs
   */
  registerOutputs(format, outputs) {
    Object.entries(outputs).forEach(([tokenId, outputData]) => {
      if (this.registry.tokens.has(tokenId)) {
        this.registry.registerOutput(tokenId, format, outputData);
      }
    });
  }
}
