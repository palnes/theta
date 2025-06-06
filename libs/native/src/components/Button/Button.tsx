import { tokens } from '@theta/tokens';
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
    borderRadius: tokens.sysRadiusMd,
  },
  text: {
    fontSize: tokens.sysFontSizeBase,
    fontWeight: '600',
  },
  // Variants
  primary: {
    backgroundColor: tokens.sysColorActionPrimary,
  },
  secondary: {
    backgroundColor: tokens.sysColorActionSecondary,
  },
  primaryText: {
    color: tokens.refColorWhite,
  },
  secondaryText: {
    color: tokens.refColorBlack,
  },
  // Sizes
  small: {
    paddingHorizontal: tokens.sysSpacingXs,
    paddingVertical: tokens.sysSpacing2xs,
  },
  medium: {
    paddingHorizontal: tokens.sysSpacingLg,
    paddingVertical: tokens.sysSpacingMd,
  },
  large: {
    paddingHorizontal: tokens.sysSpacingXl,
    paddingVertical: tokens.sysSpacingXs,
  },
  // States
  disabled: {
    opacity: 0.5,
  },
});
