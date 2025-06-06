# Theta Design System - TODO

## Documentation Migration ✅
- [x] Migrated all token documentation to use centralized documentation format
- [x] Updated shadow formatter to show React Native-compatible properties
- [x] Updated border width tokens to reference dimension tokens
- [x] Migrated Borders.mdx and Typography.mdx to use documentation format

---

## Future Work

### Documentation
- [ ] Document theme usage in README
- [ ] Create interactive token playground
- [ ] Add search functionality to token documentation

### Technical Debt
- [ ] Remove fallback values from Button.module.css once CSS loading is fixed
- [ ] Consider adding border composite tokens (width + style + color)
- [ ] Add validation for component token references

---

## Token Naming Convention Reference

### Structure
`[layer].[category].[subcategory].[variant].[property].[state]`

### Examples
- `sys.color.action.primary.default`
- `sys.color.surface.raised.hover`
- `cmp.button.color.ghost.background.hover`
- `cmp.input.color.error.border.default`

### States
Always use explicit states:
- `default`: Base state
- `hover`: Hover state
- `active`: Pressed/active state
- `focus`: Focus state
- `disabled`: Disabled state

### Benefits
1. **Cleaner mental model**: Semantic = intent, Component = implementation
2. **Better theming**: Themes only need to understand semantic concepts
3. **Consistent structure**: Predictable state nesting
4. **Easier maintenance**: Clear separation of concerns

---

## Technical Notes

### DTCG Specification
- Following DTCG spec: https://tr.designtokens.org/format/
- Tokens use proper aliasing with `{group.token}` syntax
- Only semantic tokens change between themes
- Pure semantic token architecture with strict layering