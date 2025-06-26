/**
 * Collects output mappings from all plugins during build
 */
export class MappingCollector {
  constructor() {
    this.mappings = {};
  }

  /**
   * Add mappings from a plugin
   * @param {string} format - Output format (css, js, json, etc.)
   * @param {Object} pluginMappings - Token ID to output mapping
   */
  addMappings(format, pluginMappings) {
    for (const [tokenId, mapping] of Object.entries(pluginMappings)) {
      if (!this.mappings[tokenId]) {
        this.mappings[tokenId] = {};
      }
      this.mappings[tokenId][format] = {
        ...mapping,
        format,
      };
    }
  }

  /**
   * Get all collected mappings
   */
  getMappings() {
    return this.mappings;
  }

  /**
   * Get mappings for a specific token
   */
  getTokenMappings(tokenId) {
    return this.mappings[tokenId] || {};
  }
}
