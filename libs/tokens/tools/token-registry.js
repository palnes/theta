/**
 * Token Registry - Tracks design tokens and their outputs
 *
 * This registry provides:
 * - Token storage and retrieval
 * - Output format tracking (which tokens appear in which files)
 * - Theme variant management
 * - Token relationship tracking (references)
 */

import { buildNestedStructure, extractAllReferences } from './token-helpers.js';

// Constants
const VALID_TOKEN_ID_REGEX = /^[a-zA-Z][a-zA-Z0-9._-]*$/;

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
  }

  /**
   * Validate token ID format
   */
  validateTokenId(id) {
    if (!id || typeof id !== 'string') {
      throw new Error('Token ID must be a non-empty string');
    }
    if (!VALID_TOKEN_ID_REGEX.test(id)) {
      throw new Error(
        `Invalid token ID format: ${id}. IDs must start with a letter and contain only letters, numbers, dots, underscores, and hyphens.`
      );
    }
  }

  /**
   * Register a token with its source information
   * @param {string} id - Token ID (e.g., 'ref.color.blue')
   * @param {Object} tokenData - Token data from parser
   * @param {string} tokenData.$type - Token type
   * @param {*} tokenData.$value - Token value
   * @param {Object} [tokenData.source] - Source information
   */
  registerToken(id, tokenData) {
    this.validateTokenId(id);
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
   * Record a transformation for audit trail with size limit
   */
  recordTransformation(tokenId, format, data) {
    if (!this.transformations.has(tokenId)) {
      this.transformations.set(tokenId, []);
    }

    const history = this.transformations.get(tokenId);
    history.push({
      format,
      timestamp: new Date().toISOString(),
      ...data,
    });

    // Limit history size per token to prevent memory issues during build
    if (history.length > MAX_TRANSFORMATION_HISTORY) {
      history.shift(); // Remove oldest
    }
  }

  /**
   * Extract token references from a value
   * @param {*} value - Value to extract references from
   * @returns {Set<string>} Set of referenced token IDs
   */
  extractReferences(value) {
    return extractAllReferences(value);
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
   * @returns {Array<string>} Array of all token IDs
   */
  getAllTokens() {
    return Array.from(this.tokens.keys());
  }

  /**
   * Get tokens by type
   * @param {string} type - Token type (e.g., 'color', 'dimension')
   * @returns {Array<string>} Array of token IDs of the given type
   */
  getTokensByType(type) {
    return Array.from(this.indexes.byType.get(type) || []);
  }

  /**
   * Get tokens by format
   * @param {string} format - Output format (e.g., 'css', 'typescript')
   * @returns {Array<string>} Array of token IDs that have outputs in this format
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
   * Get tokens that would be affected if this token changes
   */
  getImpactedTokens(tokenId) {
    // For now, just return direct references
    // Could be extended to include transitive dependencies if needed
    return this.getReferencingTokens(tokenId);
  }

  /**
   * Build nested token structure from flat token map
   */
  buildNestedTokenStructure() {
    const flatTokens = {};
    this.tokens.forEach((token, id) => {
      flatTokens[id] = this.getToken(id);
    });
    return buildNestedStructure(flatTokens);
  }

  /**
   * Export registry data for documentation
   */
  exportForDocumentation(options = {}) {
    const {
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
      data.tokens = this.buildNestedTokenStructure();
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

    return data;
  }
}
