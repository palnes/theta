import { composeStories } from '@storybook/react';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import * as stories from './Button.stories';

const { Basic } = composeStories(stories);

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Basic />);
    expect(getByText('Hello world')).toBeTruthy();
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Basic onPress={onPress} />);

    fireEvent.press(getByText('Hello world'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('applies primary variant styles', () => {
    const { getByTestId } = render(<Basic variant="primary" testID="button" />);
    const button = getByTestId('button');

    expect(button).toHaveStyle({
      backgroundColor: '#0066CC',
    });
  });

  it('applies medium size styles', () => {
    const { getByTestId } = render(<Basic size="medium" testID="button" />);
    const button = getByTestId('button');

    expect(button).toHaveStyle({
      paddingVertical: 12,
      paddingHorizontal: 24,
    });
  });

  it('renders with custom text', () => {
    const { getByText } = render(<Basic text="Custom Text" />);
    expect(getByText('Custom Text')).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<Basic disabled={true} onPress={onPress} testID="button" />);
    const button = getByTestId('button');

    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();

    expect(button).toHaveStyle({
      opacity: 0.5,
    });
  });
});
