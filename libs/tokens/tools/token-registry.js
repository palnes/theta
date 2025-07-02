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
  constructor(config = {}) {
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

    // Store configuration with defaults
    this.config = {
      paths: {
        getTier: (id) => id.split('.')[0],
        isComponent: (id) => id.startsWith('cmp.'),
        getComponent: (id) => (id.startsWith('cmp.') ? id.split('.')[1] : null),
        isReference: (id) => id.startsWith('ref.'),
      },
      types: {
        nonExpandable: ['shadow', 'border', 'gradient'],
      },
      ...config,
    };
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
   * Create a new token object from token data
   */
  createToken(id, tokenData) {
    return {
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
  }

  /**
   * Update type index for a token
   */
  updateTypeIndex(tokenId, tokenType) {
    if (!tokenType) return;

    if (!this.indexes.byType.has(tokenType)) {
      this.indexes.byType.set(tokenType, new Set());
    }
    this.indexes.byType.get(tokenType).add(tokenId);
  }

  /**
   * Update component index for a token
   */
  updateComponentIndex(tokenId) {
    if (!tokenId.startsWith('cmp.')) return;

    const component = tokenId.split('.')[1];
    if (!component) return;

    if (!this.indexes.byComponent.has(component)) {
      this.indexes.byComponent.set(component, new Set());
    }
    this.indexes.byComponent.get(component).add(tokenId);
  }

  /**
   * Update reference indexes for a token
   */
  updateReferenceIndexes(tokenId, token) {
    const references = this.extractReferences(token.originalValue || token.value);

    for (const ref of references) {
      token.references.add(ref);

      // Update reference index
      if (!this.indexes.references.has(tokenId)) {
        this.indexes.references.set(tokenId, new Set());
      }
      this.indexes.references.get(tokenId).add(ref);

      // Update reverse reference index
      if (!this.indexes.referencedBy.has(ref)) {
        this.indexes.referencedBy.set(ref, new Set());
      }
      this.indexes.referencedBy.get(ref).add(tokenId);
    }
  }

  /**
   * Check if a token value is expandable
   */
  isExpandableToken(token, tokenId) {
    if (typeof token.value !== 'object' || token.value === null || Array.isArray(token.value)) {
      return false;
    }

    if (tokenId.startsWith('ref.')) return false;

    const nonExpandableTypes = ['shadow', 'border', 'gradient'];
    if (nonExpandableTypes.includes(token.type)) return false;

    // Check if this object has expandable properties (not a dimension object with value/unit)
    return !('value' in token.value && 'unit' in token.value);
  }

  /**
   * Register an expanded token property
   */
  registerExpandedProperty(parentId, parentToken, prop, propValue) {
    const propId = `${parentId}.${prop}`;
    const propType = this.inferTokenType(prop, propValue);

    const expandedToken = {
      id: propId,
      value: propValue,
      type: propType,
      description: `${prop} from ${parentId}`,
      deprecated: parentToken.deprecated,
      source: parentToken.source,
      originalValue: propValue,
      metadata: {
        expandedFrom: parentId,
        parentType: parentToken.type,
      },
      outputs: new Map(),
      references: new Set([parentId]),
      referencedBy: new Set(),
      themes: new Map(),
    };

    this.tokens.set(propId, expandedToken);
    this.updateTypeIndex(propId, propType);

    // Update reference indexes for parent-child relationship
    if (!this.indexes.references.has(propId)) {
      this.indexes.references.set(propId, new Set());
    }
    this.indexes.references.get(propId).add(parentId);

    if (!this.indexes.referencedBy.has(parentId)) {
      this.indexes.referencedBy.set(parentId, new Set());
    }
    this.indexes.referencedBy.get(parentId).add(propId);
  }

  /**
   * Expand composite token into individual properties
   */
  expandCompositeToken(tokenId, token) {
    if (!this.isExpandableToken(token, tokenId)) return;

    for (const [prop, propValue] of Object.entries(token.value)) {
      if (propValue === null || propValue === undefined) continue;
      this.registerExpandedProperty(tokenId, token, prop, propValue);
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

    const token = this.createToken(id, tokenData);
    this.tokens.set(id, token);

    // Update indexes
    this.updateTypeIndex(id, token.type);
    this.updateComponentIndex(id);
    this.updateReferenceIndexes(id, token);

    // Expand composite tokens
    this.expandCompositeToken(id, token);

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

    // Also register theme variants for expanded properties
    if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      token.metadata?.expandedFrom === undefined
    ) {
      // Only for parent tokens, not already expanded

      for (const [prop, propValue] of Object.entries(value)) {
        const expandedTokenId = `${tokenId}.${prop}`;
        const expandedToken = this.tokens.get(expandedTokenId);

        if (expandedToken) {
          expandedToken.themes.set(theme, {
            value: propValue,
            outputs: new Map(),
          });
        }
      }
    }
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

  /**
   * Infer type from reference
   */
  inferTypeFromReference(value) {
    if (typeof value !== 'string' || !value.match(/^\{[^}]+\}$/)) {
      return null;
    }

    const refId = value.slice(1, -1); // Remove { and }
    const referencedToken = this.tokens.get(refId);
    return referencedToken?.type || null;
  }

  /**
   * Infer type from string value
   */
  inferTypeFromString(value) {
    // Color patterns
    if (value.match(/^#[0-9a-fA-F]{3,8}$/) || value.match(/^rgb/) || value.match(/^hsl/)) {
      return 'color';
    }

    // Dimension patterns (number with unit)
    if (value.match(/^-?\d+(\.\d+)?(px|rem|em|%|vh|vw|pt|cm|mm|in|pc|ex|ch)$/)) {
      return 'dimension';
    }

    // Pure number as string
    if (value.match(/^-?\d+(\.\d+)?$/)) {
      return 'number';
    }

    // Font weight keywords
    const fontWeightKeywords = ['thin', 'light', 'regular', 'medium', 'semibold', 'bold', 'black'];
    if (fontWeightKeywords.includes(value.toLowerCase())) {
      return 'fontWeight';
    }

    return null;
  }

  /**
   * Infer type from number value
   */
  inferTypeFromNumber(value) {
    // Numbers between 100-900 in steps of 100 are likely font weights
    if (value >= 100 && value <= 900 && value % 100 === 0) {
      return 'fontWeight';
    }
    return 'number';
  }

  /**
   * Infer type from array value
   */
  inferTypeFromArray(value) {
    // Arrays of strings might be fontFamily
    if (value.every((v) => typeof v === 'string')) {
      return 'fontFamily';
    }
    return 'array';
  }

  /**
   * Infer type from object value
   */
  inferTypeFromObject(value) {
    // Dimension object
    if ('value' in value && 'unit' in value) {
      return 'dimension';
    }

    // Color object
    if ('r' in value || 'red' in value || 'h' in value || 'hue' in value) {
      return 'color';
    }

    return 'object';
  }

  /**
   * Best-effort type inference based on value characteristics
   * @param {string} propertyName - Name of the property
   * @param {*} value - Value of the property
   * @returns {string} Inferred token type
   */
  inferTokenType(_propertyName, value) {
    // Try to infer from reference first
    const refType = this.inferTypeFromReference(value);
    if (refType) return refType;

    // Infer based on value type
    if (typeof value === 'string') {
      return this.inferTypeFromString(value) || 'string';
    }

    if (typeof value === 'number') {
      return this.inferTypeFromNumber(value);
    }

    if (typeof value === 'boolean') {
      return 'boolean';
    }

    if (Array.isArray(value)) {
      return this.inferTypeFromArray(value);
    }

    if (typeof value === 'object' && value !== null) {
      return this.inferTypeFromObject(value);
    }

    return 'string'; // Default fallback
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
    for (const [id, _token] of this.tokens) {
      flatTokens[id] = this.getToken(id);
    }
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
      for (const [id, _token] of this.tokens) {
        data.tokens[id] = this.getToken(id);
      }
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
