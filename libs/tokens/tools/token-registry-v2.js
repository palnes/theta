/**
 * Token Registry V2 - Enhanced with merge tracking
 *
 * This version tracks:
 * - Token sources and merge history
 * - Override chains
 * - Theme layering
 * - Merge conflicts
 */

export class TokenRegistryV2 {
  constructor() {
    // Core token data indexed by ID
    this.tokens = new Map();

    // Merge tracking
    this.sources = new Map(); // tokenId -> Array<{file, value, priority}>
    this.overrides = new Map(); // tokenId -> Array<{theme, value, source}>
    this.conflicts = new Map(); // tokenId -> Array<{files, values}>

    // Indexes for efficient querying
    this.indexes = {
      byType: new Map(), // type -> Set<tokenId>
      byFormat: new Map(), // format -> Set<tokenId>
      byFile: new Map(), // sourceFile -> Set<tokenId>
      byComponent: new Map(), // component -> Set<tokenId>
      byTheme: new Map(), // theme -> Set<tokenId>
      references: new Map(), // tokenId -> Set<referencedTokenIds>
      referencedBy: new Map(), // tokenId -> Set<referencingTokenIds>
    };

    // Merge configuration
    this.mergeConfig = {
      conflictResolution: 'last-wins', // 'last-wins', 'first-wins', 'error'
      trackSources: true,
      trackOverrides: true,
    };
  }

  /**
   * Register a token source (before merging)
   */
  registerTokenSource(id, tokenData, sourceInfo) {
    const source = {
      file: sourceInfo.file,
      layer: sourceInfo.layer || 'base', // 'base', 'semantic', 'component', 'theme'
      theme: sourceInfo.theme || 'default',
      priority: sourceInfo.priority || 0,
      value: tokenData.$value,
      type: tokenData.$type,
      metadata: {
        description: tokenData.$description,
        deprecated: tokenData.$deprecated,
        ...sourceInfo.metadata,
      },
    };

    // Track all sources for this token
    if (!this.sources.has(id)) {
      this.sources.set(id, []);
    }
    this.sources.get(id).push(source);

    // Update file index
    if (!this.indexes.byFile.has(source.file)) {
      this.indexes.byFile.set(source.file, new Set());
    }
    this.indexes.byFile.get(source.file).add(id);

    // Update theme index
    if (source.theme !== 'default') {
      if (!this.indexes.byTheme.has(source.theme)) {
        this.indexes.byTheme.set(source.theme, new Set());
      }
      this.indexes.byTheme.get(source.theme).add(id);
    }

    return source;
  }

  /**
   * Merge token sources and register the final token
   */
  mergeAndRegister(id, options = {}) {
    const sources = this.sources.get(id);
    if (!sources || sources.length === 0) {
      throw new Error(`No sources found for token ${id}`);
    }

    // Sort sources by priority (higher priority wins)
    const sortedSources = [...sources].sort((a, b) => {
      // First sort by theme (base tokens first)
      if (a.theme === 'default' && b.theme !== 'default') return -1;
      if (a.theme !== 'default' && b.theme === 'default') return 1;

      // Then by layer priority
      const layerPriority = { base: 0, semantic: 1, component: 2, theme: 3 };
      const layerDiff = (layerPriority[a.layer] || 0) - (layerPriority[b.layer] || 0);
      if (layerDiff !== 0) return layerDiff;

      // Finally by explicit priority
      return a.priority - b.priority;
    });

    // Detect conflicts (multiple sources at same priority level)
    const conflicts = this.detectConflicts(sortedSources);
    if (conflicts.length > 0) {
      this.conflicts.set(id, conflicts);

      if (this.mergeConfig.conflictResolution === 'error') {
        throw new Error(`Merge conflict for token ${id}: ${JSON.stringify(conflicts)}`);
      }
    }

    // Apply merge strategy
    const winner =
      this.mergeConfig.conflictResolution === 'first-wins'
        ? sortedSources[0]
        : sortedSources[sortedSources.length - 1];

    // Create the merged token
    const token = {
      id,
      value: winner.value,
      type: winner.type || this.inferType(winner.value),
      description: winner.metadata.description,
      deprecated: winner.metadata.deprecated,

      // Merge tracking
      source: {
        winner: winner.file,
        theme: winner.theme,
        layer: winner.layer,
        allSources: sources.map((s) => ({
          file: s.file,
          theme: s.theme,
          layer: s.layer,
          priority: s.priority,
        })),
      },

      // Data structures
      metadata: {},
      outputs: new Map(),
      references: new Set(),
      referencedBy: new Set(),
      themes: new Map(),
      overrides: [],
    };

    // Track theme overrides
    const baseValue = sortedSources.find((s) => s.theme === 'default')?.value;
    sortedSources.forEach((source) => {
      if (source.theme !== 'default' && source.value !== baseValue) {
        token.overrides.push({
          theme: source.theme,
          value: source.value,
          source: source.file,
        });

        if (!this.overrides.has(id)) {
          this.overrides.set(id, []);
        }
        this.overrides.get(id).push({
          theme: source.theme,
          value: source.value,
          source: source.file,
        });
      }
    });

    // Register the merged token
    this.tokens.set(id, token);

    // Update indexes
    if (token.type) {
      if (!this.indexes.byType.has(token.type)) {
        this.indexes.byType.set(token.type, new Set());
      }
      this.indexes.byType.get(token.type).add(id);
    }

    // Extract component from ID
    if (id.startsWith('cmp.')) {
      const component = id.split('.')[1];
      if (component) {
        if (!this.indexes.byComponent.has(component)) {
          this.indexes.byComponent.set(component, new Set());
        }
        this.indexes.byComponent.get(component).add(id);
      }
    }

    // Extract and index references
    const references = this.extractReferences(token.value);
    references.forEach((ref) => {
      token.references.add(ref);

      if (!this.indexes.references.has(id)) {
        this.indexes.references.set(id, new Set());
      }
      this.indexes.references.get(id).add(ref);

      if (!this.indexes.referencedBy.has(ref)) {
        this.indexes.referencedBy.set(ref, new Set());
      }
      this.indexes.referencedBy.get(ref).add(id);
    });

    return token;
  }

  /**
   * Detect merge conflicts
   */
  detectConflicts(sources) {
    const conflicts = [];
    const seen = new Map();

    sources.forEach((source) => {
      const key = `${source.theme}-${source.layer}-${source.priority}`;
      if (seen.has(key)) {
        const existing = seen.get(key);
        if (JSON.stringify(existing.value) !== JSON.stringify(source.value)) {
          conflicts.push({
            files: [existing.file, source.file],
            values: [existing.value, source.value],
            theme: source.theme,
            layer: source.layer,
          });
        }
      } else {
        seen.set(key, source);
      }
    });

    return conflicts;
  }

  /**
   * Get merge information for a token
   */
  getMergeInfo(id) {
    const token = this.tokens.get(id);
    if (!token) return null;

    return {
      winner: token.source.winner,
      sources: this.sources.get(id) || [],
      overrides: this.overrides.get(id) || [],
      conflicts: this.conflicts.get(id) || [],
      mergeChain: this.buildMergeChain(id),
    };
  }

  /**
   * Build the complete merge chain for a token
   */
  buildMergeChain(id) {
    const sources = this.sources.get(id) || [];

    return sources
      .map((source) => ({
        file: source.file,
        theme: source.theme,
        layer: source.layer,
        value: source.value,
        wouldApply: this.wouldSourceApply(source, sources),
      }))
      .sort((a, b) => {
        // Show in order of precedence
        if (a.wouldApply && !b.wouldApply) return -1;
        if (!a.wouldApply && b.wouldApply) return 1;
        return 0;
      });
  }

  /**
   * Determine if a source would apply given other sources
   */
  wouldSourceApply(source, allSources) {
    // Complex logic to determine if this source would win
    // This is simplified - real implementation would follow full merge rules
    const higherPriority = allSources.filter(
      (s) => s.theme === source.theme && s.layer === source.layer && s.priority > source.priority
    );

    return higherPriority.length === 0;
  }

  /**
   * Get tokens by source file
   */
  getTokensByFile(file) {
    return Array.from(this.indexes.byFile.get(file) || []);
  }

  /**
   * Get tokens that were overridden in a theme
   */
  getThemeOverrides(theme) {
    const overrides = [];

    this.overrides.forEach((overrideList, tokenId) => {
      const themeOverride = overrideList.find((o) => o.theme === theme);
      if (themeOverride) {
        overrides.push({
          tokenId,
          ...themeOverride,
        });
      }
    });

    return overrides;
  }

  /**
   * Get all merge conflicts
   */
  getAllConflicts() {
    const conflicts = [];

    this.conflicts.forEach((conflictList, tokenId) => {
      conflictList.forEach((conflict) => {
        conflicts.push({
          tokenId,
          ...conflict,
        });
      });
    });

    return conflicts;
  }

  /**
   * Export with merge tracking information
   */
  exportForDocumentation(options = {}) {
    const { includeMergeInfo = true, includeConflicts = true, format = 'nested' } = options;

    const data = {
      tokens: {},
      formats: Array.from(this.indexes.byFormat.keys()),
      sources: this.exportSources(),
      metadata: {
        timestamp: new Date().toISOString(),
        mergeStrategy: this.mergeConfig.conflictResolution,
      },
    };

    // Build token data
    this.tokens.forEach((token, id) => {
      const exported = {
        id: token.id,
        value: token.value,
        type: token.type,
        outputs: Object.fromEntries(token.outputs),
        references: Array.from(token.references),
        referencedBy: Array.from(this.indexes.referencedBy.get(id) || []),
      };

      if (includeMergeInfo) {
        exported.source = token.source;
        exported.overrides = token.overrides;
      }

      if (format === 'nested') {
        // Build nested structure
        const parts = id.split('.');
        let current = data.tokens;

        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }

        current[parts[parts.length - 1]] = exported;
      } else {
        data.tokens[id] = exported;
      }
    });

    // Add conflicts if requested
    if (includeConflicts && this.conflicts.size > 0) {
      data.conflicts = this.getAllConflicts();
    }

    // Add statistics
    data.metadata.stats = {
      total: this.tokens.size,
      byFile: Object.fromEntries(
        Array.from(this.indexes.byFile.entries()).map(([file, set]) => [file, set.size])
      ),
      withOverrides: this.overrides.size,
      withConflicts: this.conflicts.size,
    };

    return data;
  }

  /**
   * Export source file information
   */
  exportSources() {
    const sources = {};

    this.indexes.byFile.forEach((tokenIds, file) => {
      sources[file] = {
        tokens: tokenIds.size,
        layers: new Set(),
        themes: new Set(),
      };

      tokenIds.forEach((id) => {
        const tokenSources = this.sources.get(id) || [];
        tokenSources.forEach((source) => {
          if (source.file === file) {
            sources[file].layers.add(source.layer);
            sources[file].themes.add(source.theme);
          }
        });
      });

      sources[file].layers = Array.from(sources[file].layers);
      sources[file].themes = Array.from(sources[file].themes);
    });

    return sources;
  }

  // ... (include other methods from original TokenRegistry)

  /**
   * Helper to infer token type from value
   */
  inferType(value) {
    if (typeof value === 'string') {
      if (value.match(/^#[0-9A-Fa-f]{6}/) || value.match(/^rgba?\(/)) return 'color';
      if (value.match(/^\d+(\.\d+)?(px|rem|em|%)/)) return 'dimension';
      if (value.match(/^\{[^}]+\}$/)) return 'reference';
    }
    if (typeof value === 'object' && value !== null) {
      if (value.colorSpace || value.space) return 'color';
      if (value.value !== undefined && value.unit !== undefined) return 'dimension';
      if (value.fontFamily || value.fontSize) return 'typography';
    }
    return 'unknown';
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
}
