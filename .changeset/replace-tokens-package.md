---
"@theta/tokens": major
"@theta/web": patch
"@theta/native": patch
---

Replace tokens package with improved dtcg implementation

### @theta/tokens
- Complete rewrite using DTCG specification and Terrazzo
- Added TypeScript definitions with literal types
- Implemented watch mode for development
- Added JSDoc comments to all exported functions
- Improved documentation and Storybook stories
- Fixed all TypeScript type issues (replaced `any` types)

### @theta/web
- Updated CSS variable names to match new token naming convention

### @theta/native
- Updated to use component-level tokens instead of system tokens
- Fixed button text alignment issues