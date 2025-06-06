# Getting Started with Theta

Start building interfaces immediately with Theta components.

## Your First Component

```jsx
import { Button, Card, Stack, Text } from '@theta/web';

function Welcome() {
  return (
    <Card>
      <Stack spacing="md">
        <Text variant="heading">Welcome to Theta</Text>
        <Text>Build beautiful interfaces with simple components.</Text>
        <Button variant="primary">Get Started</Button>
      </Stack>
    </Card>
  );
}
```

## Core Components

### Layout Components

**Stack** - Vertical spacing between elements
```jsx
<Stack spacing="lg">
  <Text>First item</Text>
  <Text>Second item</Text>
  <Text>Third item</Text>
</Stack>
```

**Inline** - Horizontal spacing between elements
```jsx
<Inline spacing="md">
  <Button>Save</Button>
  <Button variant="secondary">Cancel</Button>
</Inline>
```

**Grid** - Responsive grid layouts
```jsx
<Grid columns={{ base: 1, md: 2, lg: 3 }} gap="lg">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>
```

**Container** - Constrained content width
```jsx
<Container maxWidth="lg">
  <Text>Content with maximum width</Text>
</Container>
```

### Content Components

**Text** - Typography with variants
```jsx
<Text variant="heading">Heading Text</Text>
<Text variant="body">Body text with regular weight</Text>
<Text variant="caption" color="secondary">Small caption text</Text>
```

**Card** - Content containers
```jsx
<Card>
  <Text variant="heading-sm">Card Title</Text>
  <Text>Card content goes here</Text>
</Card>

<Card clickable onClick={handleClick}>
  <Text>Clickable card</Text>
</Card>
```

**Button** - Interactive actions
```jsx
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="ghost">Ghost Button</Button>
<Button size="small">Small Button</Button>
<Button fullWidth>Full Width Button</Button>
<Button disabled>Disabled Button</Button>
```

### Form Components

**Form** - Form wrapper with validation
```jsx
<Form onSubmit={handleSubmit}>
  <Stack spacing="md">
    <FormField label="Email" required>
      <Input type="email" name="email" />
    </FormField>
    <Button type="submit">Submit</Button>
  </Stack>
</Form>
```

**Input** - Text input fields
```jsx
<Input placeholder="Enter text" />
<Input type="password" />
<Input type="email" error="Invalid email" />
<Input disabled />
```

**Select** - Dropdown selection
```jsx
<Select options={[
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' }
]} />
```

**Checkbox** - Single selection
```jsx
<Checkbox label="I agree to terms" />
<Checkbox defaultChecked />
```

**Radio** - Multiple choice selection
```jsx
<RadioGroup name="choice">
  <Radio value="a" label="Option A" />
  <Radio value="b" label="Option B" />
  <Radio value="c" label="Option C" />
</RadioGroup>
```

## Composition Patterns

### Combining Components

Components are designed to work together:

```jsx
function LoginForm() {
  return (
    <Container maxWidth="sm">
      <Card>
        <Stack spacing="lg">
          <Text variant="heading">Sign In</Text>
          
          <Form onSubmit={handleLogin}>
            <Stack spacing="md">
              <FormField label="Email">
                <Input type="email" name="email" />
              </FormField>
              
              <FormField label="Password">
                <Input type="password" name="password" />
              </FormField>
              
              <Checkbox label="Remember me" />
              
              <Button type="submit" variant="primary" fullWidth>
                Sign In
              </Button>
            </Stack>
          </Form>
          
          <Text variant="caption" align="center">
            Don't have an account? <Link href="/signup">Sign up</Link>
          </Text>
        </Stack>
      </Card>
    </Container>
  );
}
```

## Component Props

Most components share common props:

- **className** - Additional CSS classes
- **style** - Inline styles (use sparingly)
- **children** - Component content
- **variant** - Visual style variant
- **size** - Component size
- **disabled** - Disabled state
- **onClick** - Click handler (where applicable)

## Best Practices

1. **Use semantic variants** - Choose variants based on meaning, not appearance
2. **Compose rather than customize** - Combine components instead of overriding styles
3. **Let components handle spacing** - Use Stack and Inline instead of margins
4. **Trust the defaults** - Components have sensible defaults

## Next Steps

- Explore [Common Patterns](./patterns/) for more complex examples
- Check [Platform Guides](./platforms/) for platform-specific details
- Review the component documentation in Storybook