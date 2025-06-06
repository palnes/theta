import React from 'react';
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';
import styles from './Button.module.css';

export interface ButtonProps extends AriaButtonProps {
  /** Visual style of the button */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Size of the button */
  size?: 'small' | 'medium' | 'large';
}

/** Primary UI component for user interaction */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'medium', className, ...props }, ref) => {
    return (
      <AriaButton
        ref={ref}
        className={(renderProps) => {
          const classes = [
            styles.button,
            styles[variant],
            styles[size],
            renderProps.isPressed && styles.pressed,
            renderProps.isHovered && styles.hovered,
            renderProps.isFocusVisible && styles.focusVisible,
            renderProps.isDisabled && styles.disabled,
            typeof className === 'function' ? className(renderProps) : className,
          ]
            .filter(Boolean)
            .join(' ');

          return classes;
        }}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
