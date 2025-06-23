import tokens from '@theta/tokens';
import React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  onPress: () => void;
  text: string;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export const Button = ({
  onPress,
  text,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  testID,
  ...props
}: ButtonProps) => {
  const containerStyle: ViewStyle[] = [
    styles.container,
    styles[variant],
    styles[size],
    ...(disabled ? [styles.disabled] : []),
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`${variant}Text` as keyof typeof styles] as TextStyle,
    styles[`${size}Text` as keyof typeof styles] as TextStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      {...props}
    >
      <Text style={textStyle}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: tokens.cmpButtonFontSizeMedium,
    fontWeight: tokens.cmpButtonFontWeight,
  },
  // Variants
  primary: {
    backgroundColor: tokens.cmpButtonColorPrimaryBackgroundDefault,
  },
  secondary: {
    backgroundColor: tokens.cmpButtonColorSecondaryBackgroundDefault,
  },
  primaryText: {
    color: tokens.cmpButtonColorPrimaryTextDefault,
  },
  secondaryText: {
    color: tokens.cmpButtonColorSecondaryTextDefault,
  },
  // Sizes
  small: {
    paddingHorizontal: tokens.cmpButtonPaddingXSmall,
    borderRadius: tokens.cmpButtonRadiusSmall,
    height: tokens.cmpButtonHeightSmall,
  },
  medium: {
    paddingHorizontal: tokens.cmpButtonPaddingXMedium,
    borderRadius: tokens.cmpButtonRadiusMedium,
    height: tokens.cmpButtonHeightMedium,
  },
  large: {
    paddingHorizontal: tokens.cmpButtonPaddingXLarge,
    borderRadius: tokens.cmpButtonRadiusLarge,
    height: tokens.cmpButtonHeightLarge,
  },
  // Text sizes
  smallText: {
    fontSize: tokens.cmpButtonFontSizeSmall,
  },
  mediumText: {
    fontSize: tokens.cmpButtonFontSizeMedium,
  },
  largeText: {
    fontSize: tokens.cmpButtonFontSizeLarge,
  },
  // States
  disabled: {
    opacity: tokens.cmpButtonOpacityDisabled,
  },
});
