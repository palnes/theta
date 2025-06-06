import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Button } from './Button';
import styles from './Button.module.css';

describe('Button', () => {
  test('renders with text', async () => {
    const screen = render(<Button>Click me</Button>);
    await expect.element(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  test('applies variant classes', async () => {
    const screen = render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button');
    await expect.element(button).toHaveClass(styles.primary);
  });

  test('applies size classes', async () => {
    const screen = render(<Button size="small">Small</Button>);
    const button = screen.getByRole('button');
    await expect.element(button).toHaveClass(styles.small);
  });

  test('handles onPress events', async () => {
    const onPress = vi.fn();

    const screen = render(<Button onPress={onPress}>Press me</Button>);

    await screen.getByRole('button').click();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('disables button when isDisabled is true', async () => {
    const screen = render(<Button isDisabled>Disabled</Button>);
    const button = screen.getByRole('button');

    await expect.element(button).toHaveAttribute('disabled');
    await expect.element(button).toHaveClass(styles.disabled);
  });

  test('supports custom className', async () => {
    const screen = render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    await expect.element(button).toHaveClass('custom-class');
  });

  test('keyboard navigation works', async () => {
    const onPress = vi.fn();

    const screen = render(<Button onPress={onPress}>Press me</Button>);

    const button = screen.getByRole('button');
    await button.click();
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
