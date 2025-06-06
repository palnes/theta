# Troubleshooting

Common issues and solutions when using the Theta design system.

## Component Issues

### "The component doesn't do what I need"

Before building custom solutions:

1. **Check the component's full API** - Many components have extensive props
2. **Consider composition** - Can you combine multiple components?
3. **Look for similar patterns** - How have others solved this?
4. **Ask your team** - Someone may have encountered this before
5. **Request an enhancement** - File an issue for missing functionality

### "Styles look different than expected"

Possible causes:

1. **Global styles interfering** - Check for CSS resets or global styles
2. **Missing theme provider** - Ensure your app is wrapped in ThemeProvider
3. **Outdated packages** - Update to latest versions
4. **Build cache** - Clear build artifacts and rebuild

### "TypeScript errors with components"

Solutions:

1. **Rebuild packages** - Run `yarn build` in the monorepo
2. **Check imports** - Ensure you're importing from the correct package
3. **Update TypeScript** - Ensure compatible TypeScript versions
4. **Regenerate types** - Delete `node_modules` and reinstall

## Layout Issues

### "Spacing doesn't match design"

Check:

1. **Using Stack/Inline** - Don't add custom margins
2. **Correct spacing prop** - Use semantic spacing values
3. **Parent container** - Check for conflicting styles
4. **Box model** - Ensure no global box-sizing changes

### "Components not responsive"

Verify:

1. **Responsive props** - Use responsive prop syntax
2. **Container queries** - Some components use container queries
3. **Viewport meta tag** - Ensure proper viewport settings
4. **Grid columns** - Check responsive column configuration

## Form Issues

### "Form validation not working"

Ensure:

1. **Form wrapper** - Inputs must be inside Form component
2. **Name attributes** - All inputs need name props
3. **Submit handler** - Form needs onSubmit prop
4. **Error display** - FormField shows errors automatically

### "Can't get form data"

Check:

1. **Controlled vs uncontrolled** - Choose one pattern
2. **Name props** - Required for form data collection
3. **Form nesting** - Don't nest forms
4. **Submit prevention** - Check for preventDefault

## Platform Differences

### "Looks different on web vs native"

This may be intentional:

1. **Platform conventions** - Respecting platform patterns
2. **Technical constraints** - Some features platform-specific
3. **Check documentation** - Note platform differences
4. **File issue** - If you believe it's a bug

### "Component not available on my platform"

Some components are platform-specific:

1. **Check compatibility** - See component documentation
2. **Alternative patterns** - Look for platform equivalent
3. **Request addition** - File enhancement request

## Performance Issues

### "Components rendering slowly"

Optimize:

1. **Memoization** - Use React.memo for expensive components
2. **Key props** - Ensure proper keys in lists
3. **Lazy loading** - Split code where appropriate
4. **Development mode** - Production builds are faster

## Getting Help

If these solutions haven't resolved your issue:

1. **Search existing issues** - Someone may have encountered this
2. **Check examples** - Review working implementations
3. **Ask your team** - Internal knowledge base
4. **File an issue** - Include reproduction steps

## Debug Checklist

When reporting issues, include:

* Package versions
* Platform (web/native)
* Browser/device info
* Minimal reproduction
* Expected vs actual behavior
* Screenshots if visual issue
* Error messages
* Relevant code snippets