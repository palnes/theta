# Design Token Formatters

This directory contains custom Style Dictionary formatters that generate platform-specific output files.

## Formatters

### CSS Expanded (`css-expanded.js`)
- **Format**: `css/expanded`
- **Purpose**: Generates CSS custom properties with expanded typography
- **Features**:
  - Typography shorthand + individual properties
  - CSS-compatible shadow strings
  - Font family array handling
  - Reference resolution with CSS variables

### JavaScript Module Flat (`javascript-module-flat.js`)
- **Format**: `javascript/module-flat`
- **Purpose**: Generates flat JavaScript object with ES6 exports
- **Features**:
  - Unitless dimensions for React Native
  - React Native shadow objects
  - Numeric typography values
  - ES6 module format

### JSON Nested RN (`json-nested-rn.js`)
- **Format**: `json/nested-rn`
- **Purpose**: Generates nested JSON structure with React Native shadows
- **Features**:
  - Maintains token hierarchy
  - React Native shadow objects
  - Direct JSON consumption

## Output Examples

### CSS
```css
:root {
  --sys-shadow-card: 0px 1px 3px -1px #000000;
  --sys-typography-heading-1: 700 36px/1.25 system-ui, sans-serif;
  --sys-typography-heading-1-font-size: 36px;
  --sys-typography-heading-1-font-weight: 700;
}
```

### JavaScript
```javascript
export const tokens = {
  sysShadowCard: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1.5,
    boxShadow: "0px 1px 3px -1px #000000"
  },
  sysFontSizeBase: 16
};
```

### JSON
```json
{
  "sys": {
    "shadow": {
      "card": {
        "shadowColor": "#000000",
        "shadowOffset": { "width": 0, "height": 1 },
        "shadowOpacity": 1,
        "shadowRadius": 1.5,
        "boxShadow": "0px 1px 3px -1px #000000"
      }
    }
  }
}
```

## Adding New Formatters

1. Create a new file in this directory
2. Register your formatter with `StyleDictionary.registerFormat()`
3. Export it in `index.js`
4. Reference in platform configurations