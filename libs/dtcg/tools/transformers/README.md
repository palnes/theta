# Design Token Transformers

This directory contains custom Style Dictionary transformers that handle DTCG (Design Tokens Community Group) format tokens and convert them for different platforms.

## Transformers

### Color (`color.js`)
- **Transform**: `dtcg/color`
- **Purpose**: Converts DTCG color objects to hex values
- **Supports**: 
  - Direct hex values with optional alpha
  - sRGB color space with components array
  - Alpha transparency handling

### Dimension (`dimension.js`)
- **Transforms**: 
  - `dtcg/dimension` - Converts to CSS units (px, rem, etc.)
  - `dtcg/dimension/unitless` - Converts to pure numbers for JS/JSON
- **Purpose**: Handles DTCG dimension objects and legacy string formats
- **Supports**:
  - Object format: `{ unit: "px", value: 16 }`
  - String format: `"16px"`
  - rem to px conversion with configurable base font size

### Shadow (`shadow.js`)
- **Transforms**:
  - `dtcg/shadow/css` - Converts to CSS shadow strings
  - `dtcg/shadow/rn` - Converts to React Native shadow objects
- **Purpose**: Platform-specific shadow formatting
- **React Native Output**:
  ```javascript
  {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1.5,
    boxShadow: "0px 1px 3px -1px #000000"
  }
  ```

### Typography (`typography.js`)
- **Transform**: `dtcg/typography`
- **Purpose**: Passes through typography objects for platform-specific formatting
- **Handles**: Font family, size, weight, line height, letter spacing

### Name (`name.js`)
- **Transforms**:
  - `name/kebab` - Converts to kebab-case for CSS
  - `name/flat` - Converts to camelCase for JavaScript
- **Purpose**: Platform-appropriate token naming

## Usage

Transform groups automatically apply the appropriate transformers:

- `custom/css` - For CSS output with units and CSS-formatted shadows
- `custom/js` - For JavaScript/JSON output with unitless dimensions and React Native shadows

## Adding New Transformers

1. Create a new file in this directory
2. Register your transform with `StyleDictionary.registerTransform()`
3. Export it in `index.js`
4. Add to appropriate transform groups in the main config