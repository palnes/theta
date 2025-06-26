# Theme Documentation Enhancement TODO

## Overview
Enhance the token documentation system to properly display and document theme variations, making it clear which tokens change between themes and how they change.

## Completed Tasks ✅

### 1. Updated Docs Plugin to Support Themes
**File**: `tools/plugins/docs.js`
- [x] Added `themes` parameter to plugin options
- [x] Capture theme-specific values for each token
- [x] Added `themeValues` object showing value in each theme
- [x] Added `isThemeable` boolean flag for tokens that change
- [x] Added `overriddenIn` array listing themes that override the token
- [x] Added theme metadata (count of themeable tokens)

### 2. Pass Theme Data to Docs Plugin
**File**: `tools/build-tokens.js`
- [x] Updated docs plugin configuration to pass theme data

### 3. Updated TokenReferenceTable Component
**Files**: `src/stories/helpers/TokenReferenceTable/*`
- [x] Added theme indicator (🎨) for themeable tokens
- [x] Updated `TokenValue` component to show theme swatches for colors
- [x] Added theme values in expanded details
- [x] Updated types to support theme data

### 4. Enhanced ColorDisplay Component
**File**: `src/stories/helpers/components/ColorDisplay.tsx`
- [x] Added `showThemeComparison` prop
- [x] Side-by-side theme swatches for color tokens
- [x] Theme values in popover
- [x] Theme indicators on themeable tokens

### 5. Created Theme Documentation Components
- [x] **ThemeComparison Component**: Searchable table of all theme changes
- Removed ThemeOverview and ThemeDiff as redundant

### 6. Created Theme Documentation Pages
- [x] **Getting Started/Creating Custom Themes**: Complete guide for creating themes
- [x] **Themes/Token Comparison**: Interactive comparison tool
- Removed redundant Overview page

### 7. Updated Existing Documentation
- [x] Updated semantic colors story to use enhanced data
- [x] Cleaned up overlaps between Token Guide and Creating Custom Themes

### 8. Enhanced Theme Comparison Component
**File**: `src/stories/helpers/components/ThemeComparison.tsx`
- [x] Added visual previews for different token types:
  - Color swatches for color tokens
  - Shadow previews for shadow tokens
  - Spacing bars for dimension tokens
  - Font previews for typography tokens
  - Z-index indicators for layering
- [x] Improved styling with better visual hierarchy
- [x] Added responsive design considerations

### 9. Created Dark Theme Token Overrides
**Files**: `src/tokens/semantic/dark/*`
- [x] Added shadow overrides (lighter shadows for dark mode)
- [x] Added spacing overrides (slightly more generous spacing)
- [x] Added radius overrides (softer corners)
- [x] Added border width overrides (thinner borders)
- [x] Added typography overrides (improved readability)
- [x] Added z-index overrides (adjusted layering)

## Remaining Tasks

### 10. Update Storybook Configuration
**File**: `.storybook/preview.ts`
- [ ] Verify theme addon is properly configured for all packages
- [ ] Add theme-specific decorators if needed
- [ ] Update story sorting if needed

### 11. Add Theme Testing Utilities
**New file**: `src/stories/helpers/theme-utils.ts`
- [ ] Helper to get theme-specific token value
- [ ] Helper to check if token is themeable
- [ ] Helper to get all overridden tokens for a theme
- [ ] Helper to validate theme coverage

### 12. Visual Theme Testing
- [ ] Add stories that show components in all themes
- [ ] Create automated visual regression tests
- [ ] Add accessibility checks for each theme
- [ ] Validate color contrast ratios

## Technical Considerations

### Token Reference JSON Structure
The enhanced structure should include:
```json
{
  "name": "sysColorSurfaceBaseDefault",
  "path": "sys.color.surface.base.default",
  "type": "color",
  "value": "#ffffff",          // Base/light value
  "cssVariable": "--sys-color-surface-base-default",
  "jsPath": "sys.color.surface.base.default",
  "jsFlat": "sysColorSurfaceBaseDefault",
  "themeValues": {
    "light": "#ffffff",
    "dark": "#222225"
  },
  "isThemeable": true,
  "overriddenIn": ["dark"],
  "hasReferences": false,
  "references": []
}
```

### Performance Considerations
- [ ] Ensure token data isn't duplicated unnecessarily
- [ ] Consider lazy loading theme data
- [ ] Optimize theme switching performance
- [ ] Cache computed theme differences

### Backwards Compatibility
- [ ] Ensure existing token usage still works
- [ ] Keep current API surface stable
- [ ] Add deprecation warnings if needed
- [ ] Document migration path

## Success Criteria
- Developers can easily see which tokens change between themes
- Theme documentation is comprehensive and searchable
- Visual comparisons make theme differences clear
- Creating custom themes is well-documented
- Performance impact is minimal

## Future Enhancements
- Theme playground for live editing
- Theme export/import functionality
- Automated theme validation
- Theme usage analytics
- AI-powered theme suggestions