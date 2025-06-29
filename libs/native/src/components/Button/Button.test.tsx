import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button text="Hello world" onPress={() => {}} />);
    expect(getByText('Hello world')).toBeTruthy();
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button text="Hello world" onPress={onPress} />);

    fireEvent.press(getByText('Hello world'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('applies primary variant styles', () => {
    const { getByTestId } = render(
      <Button text="Test" variant="primary" testID="button" onPress={() => {}} />
    );
    const button = getByTestId('button');

    // Check that backgroundColor is set (not checking exact value)
    expect(button.props.style).toMatchObject({
      backgroundColor: expect.any(String),
    });
  });

  it('applies secondary variant styles differently from primary', () => {
    const { getByTestId: getPrimary } = render(
      <Button text="Test" variant="primary" testID="primary-button" onPress={() => {}} />
    );
    const { getByTestId: getSecondary } = render(
      <Button text="Test" variant="secondary" testID="secondary-button" onPress={() => {}} />
    );

    const primaryButton = getPrimary('primary-button');
    const secondaryButton = getSecondary('secondary-button');

    // Ensure they have different background colors
    expect(primaryButton.props.style.backgroundColor).not.toBe(
      secondaryButton.props.style.backgroundColor
    );
  });

  it('applies size styles', () => {
    const { getByTestId: getSmall } = render(
      <Button text="Test" size="small" testID="small-button" onPress={() => {}} />
    );
    const { getByTestId: getMedium } = render(
      <Button text="Test" size="medium" testID="medium-button" onPress={() => {}} />
    );
    const { getByTestId: getLarge } = render(
      <Button text="Test" size="large" testID="large-button" onPress={() => {}} />
    );

    const smallButton = getSmall('small-button');
    const mediumButton = getMedium('medium-button');
    const largeButton = getLarge('large-button');

    // Check that sizes are different
    expect(smallButton.props.style.height).toBeLessThan(mediumButton.props.style.height);
    expect(mediumButton.props.style.height).toBeLessThan(largeButton.props.style.height);
  });

  it('renders with custom text', () => {
    const { getByText } = render(<Button text="Custom Text" onPress={() => {}} />);
    expect(getByText('Custom Text')).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Button text="Test" disabled={true} onPress={onPress} testID="button" />
    );
    const button = getByTestId('button');

    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();

    // Check that opacity is less than 1 (disabled state)
    expect(button.props.style.opacity).toBeLessThan(1);
  });
});
